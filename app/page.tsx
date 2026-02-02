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
  const refreshFs = useCallback(async () => {
    if (!instance) return;

    const loadDir = async (path: string): Promise<FSTreeNode[]> => {
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
    };

    const tree = await loadDir("");
    setFsTree(tree);
  }, [instance]);

  useEffect(() => {
    if (status === "ready") {
      void refreshFs();
    }
  }, [status, refreshFs]);

  const handleFileSelect = useCallback(
    async (path: string) => {
      if (openFiles[path]) {
        setActiveFilePath(path);
        return;
      }

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
    },
    [openFiles, readFile],
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
    void refreshFs();
  }, [activeFilePath, openFiles, writeFile, refreshFs]);

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
    const name = prompt("Enter File Path:");
    if (name) {
      await instance?.fs.writeFile(name, "");
      void refreshFs();
    }
  };

  const handleNewFolder = async () => {
    const name = prompt("Enter Folder Path:");
    if (name) {
      await instance?.fs.mkdir(name);
      void refreshFs();
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
