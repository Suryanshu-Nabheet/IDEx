"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useWebContainer } from "@/hooks/use-webcontainer";
import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/layout/footer";
import { SidebarPanel } from "@/components/ide/panels/sidebar";
import { WorkspacePanel } from "@/components/ide/panels/workspace";
import { RuntimePanel } from "@/components/ide/panels/runtime";
import { FileState, FSTreeNode, SidebarTab } from "@/lib/types";

export default function IDEPage() {
  const { instance, status, previewUrl, writeFile, readFile } =
    useWebContainer();

  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<Record<string, FileState>>({});
  const [fsTree, setFsTree] = useState<FSTreeNode[]>([]);
  const [showDiff, setShowDiff] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] =
    useState<SidebarTab>("explorer");

  // --- Filesystem Logic ---
  // 1. Loader
  const refreshFs = useCallback(async () => {
    if (!instance) return;

    const loadDir = async (path: string): Promise<FSTreeNode[]> => {
      try {
        const items = await instance.fs.readdir(path, { withFileTypes: true });
        const sorted = items.sort((a, b) => {
          if (a.isDirectory() && !b.isDirectory()) return -1;
          if (!a.isDirectory() && b.isDirectory()) return 1;
          return a.name.localeCompare(b.name);
        });

        return await Promise.all(
          sorted.map(async (item) => {
            const fullPath = path ? `${path}/${item.name}` : item.name;
            if (item.isDirectory()) {
              return {
                id: fullPath,
                name: item.name,
                type: "folder",
                children: await loadDir(fullPath),
              };
            }
            return {
              id: fullPath,
              name: item.name,
              type: "file",
            };
          }),
        );
      } catch (error) {
        console.warn("Failed to read dir", path, error);
        return [];
      }
    };

    const tree = await loadDir("");
    setFsTree(tree);
  }, [instance]);

  // 2. Watcher - The Key to "End-to-End Perfect" Sync
  useEffect(() => {
    if (status !== "ready" || !instance) return;

    // Initial Load
    void refreshFs();

    // Setup Watcher
    let watcher: any; // FSWatcher type is not exported by WebContainer API directly

    try {
      watcher = instance.fs.watch(
        ".",
        { recursive: true },
        (event: any, filename: any) => {
          console.log(`[FS Event] ${event}: ${filename}`);
          // Update FS Tree
          void refreshFs();
        },
      );
    } catch (e) {
      console.error("Failed to start FS watcher", e);
    }

    return () => {
      if (watcher && typeof watcher.close === "function") {
        watcher.close();
      }
    };
  }, [status, instance, refreshFs]);

  // 3. Auto-Close Deleted Files
  // Every time fsTree updates, verify if open files still exist
  useEffect(() => {
    const verifyOpenFiles = async () => {
      if (!instance) return;
      const pathsToCheck = Object.keys(openFiles);
      const newOpenFiles = { ...openFiles };
      let hasChanges = false;

      for (const path of pathsToCheck) {
        try {
          // Fallback: Use readFile to check existence since stat is not in types
          await instance.fs.readFile(path);
        } catch {
          delete newOpenFiles[path];
          hasChanges = true;
        }
      }

      if (hasChanges) {
        setOpenFiles(newOpenFiles);
        // If active file was deleted, switch active
        if (activeFilePath && !newOpenFiles[activeFilePath]) {
          const remaining = Object.keys(newOpenFiles);
          setActiveFilePath(remaining[remaining.length - 1] || null);
        }
      }
    };

    // Run this check when fsTree changes (meaning FS changed)
    if (instance) {
      void verifyOpenFiles();
    }
  }, [fsTree, instance, openFiles, activeFilePath]);

  const handleFileSelect = useCallback(
    async (path: string) => {
      // Check if it's a folder: Try to read it as specific dir
      // If readdir succeeds, it is a directory => return.
      try {
        await instance?.fs.readdir(path);
        // If we are here, it IS a directory.
        return;
      } catch (error: any) {
        // If error is NOT "path is not a directory", then maybe it doesn't exist or is a file.
        // We assume if it fails to readdir, it might be a file we can open.
      }

      if (openFiles[path]) {
        setActiveFilePath(path);
        return;
      }

      try {
        const content = (await readFile(path)) || "";
        const ext = path.split(".").pop() || "";

        setOpenFiles((prev) => ({
          ...prev,
          [path]: {
            path,
            content,
            savedContent: content,
            language: ext,
          },
        }));
        setActiveFilePath(path);
      } catch (e) {
        console.error("Failed to open file", path, e);
      }
    },
    [openFiles, readFile, instance],
  );

  const handleContentChange = useCallback(
    (newContent: string) => {
      if (!activeFilePath) return;
      setOpenFiles((prev) => ({
        ...prev,
        [activeFilePath]: {
          ...prev[activeFilePath],
          content: newContent,
        },
      }));
    },
    [activeFilePath],
  );

  const handleSave = useCallback(async () => {
    if (!activeFilePath || !openFiles[activeFilePath]) return;
    const { content } = openFiles[activeFilePath];
    await writeFile(activeFilePath, content);
    setOpenFiles((prev) => ({
      ...prev,
      [activeFilePath]: {
        ...prev[activeFilePath],
        savedContent: content,
      },
    }));
    // Watcher will pick this up
  }, [activeFilePath, openFiles, writeFile]);

  const handleCloseFile = (path: string) => {
    const newOpenFiles = { ...openFiles };
    delete newOpenFiles[path];
    setOpenFiles(newOpenFiles);
    if (activeFilePath === path) {
      const remainingPaths = Object.keys(newOpenFiles);
      setActiveFilePath(remainingPaths[remainingPaths.length - 1] || null);
    }
  };

  const handleAutoServe = async () => {
    if (!instance) return;
    const process = await instance.spawn("npx", [
      "-y",
      "serve",
      ".",
      "-l",
      "3000",
    ]);
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          console.info("[Runtime]", data);
        },
      }),
    );
  };

  const handleNewFile = async () => {
    const name = prompt("Enter File Path (e.g., 'src/main.ts'):");
    if (name) {
      // Ensure parent dirs exist
      const parts = name.split("/");
      if (parts.length > 1) {
        const dir = parts.slice(0, -1).join("/");
        try {
          await instance?.fs.mkdir(dir, { recursive: true });
        } catch {} // Ignore if exists
      }
      await instance?.fs.writeFile(name, "");
      // Watcher updates tree
    }
  };

  const handleNewFolder = async () => {
    const name = prompt("Enter Folder Path (e.g., 'components/ui'):");
    if (name) {
      await instance?.fs.mkdir(name, { recursive: true });
      // Watcher updates tree
    }
  };

  return (
    <div className="ide-grid-layout bg-[#000000] text-[#cccccc] font-sans">
      {/* Row 1: Header */}
      <TopBar status={status} />

      {/* Row 2: Main Layout (3 Columns) */}
      <main className="ide-main-grid">
        {/* Col 1: Sidebar (20%) */}
        <div className="border-r border-[#1a1a1a] bg-[#000000] overflow-hidden min-w-0">
          <SidebarPanel
            activeTab={activeSidebarTab}
            setActiveTab={setActiveSidebarTab}
            fsTree={fsTree}
            onFileSelect={handleFileSelect}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
          />
        </div>

        {/* Col 2: Workspace (50%) */}
        <div className="overflow-hidden min-w-0">
          <WorkspacePanel
            openFiles={openFiles}
            activeFilePath={activeFilePath}
            setActiveFilePath={setActiveFilePath}
            closeFile={handleCloseFile}
            showDiff={showDiff}
            setShowDiff={setShowDiff}
            onContentChange={handleContentChange}
            onSave={handleSave}
          />
        </div>

        {/* Col 3: Runtime (30%) */}
        <div className="border-l border-[#1a1a1a] bg-[#000000] overflow-hidden min-w-0">
          <RuntimePanel
            instance={instance}
            previewUrl={previewUrl}
            onAutoServe={handleAutoServe}
          />
        </div>
      </main>

      {/* Row 3: Footer */}
      <Footer />
    </div>
  );
}
