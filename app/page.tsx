"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useWebContainer } from "@/hooks/use-webcontainer";
import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/layout/footer";
import { Tree, Folder, File, getFileIcon } from "@/registry/magicui/file-tree";
import { Editor } from "@/components/ide/editor";
import { Terminal } from "@/components/ide/terminal";
import { Safari } from "@/registry/magicui/safari";
import { CodeDiffEditor } from "@/components/ide/code-diff-editor";
import { Button } from "@/components/ui/button";
import {
  X,
  Search,
  Files,
  GitBranch,
  Plus,
  FolderPlus,
  Globe,
  Database,
  Cpu,
  ChevronDown,
  Terminal as TerminalIcon,
  Zap,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import JSZip from "jszip";

// --- Types ---
interface FileState {
  path: string;
  content: string;
  savedContent: string;
  language: string;
}

interface FSTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FSTreeNode[];
}

export default function IDEPage() {
  const { instance, status, previewUrl, writeFile, readFile } =
    useWebContainer();

  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<Record<string, FileState>>({});
  const [fsTree, setFsTree] = useState<FSTreeNode[]>([]);
  const [showDiff, setShowDiff] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<
    "explorer" | "search" | "git" | "settings"
  >("explorer");

  // --- Filesystem Operations ---
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
    // After save, refresh FS just in case
    void refreshFs();
  }, [activeFilePath, openFiles, writeFile, refreshFs]);

  const closeFile = (path: string) => {
    const newOpenFiles = { ...openFiles };
    delete newOpenFiles[path];
    setOpenFiles(newOpenFiles);
    if (activeFilePath === path) {
      const remainingPaths = Object.keys(newOpenFiles);
      setActiveFilePath(remainingPaths[remainingPaths.length - 1] || null);
    }
  };

  const exportZip = async () => {
    if (!instance) return;
    const zip = new JSZip();

    async function addToZip(path: string) {
      const items = await instance!.fs.readdir(path, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path ? `${path}/${item.name}` : item.name;
        if (item.isDirectory()) {
          await addToZip(fullPath);
        } else {
          const content = await instance!.fs.readFile(fullPath, "utf-8");
          zip.file(fullPath, content || "");
        }
      }
    }

    await addToZip("");
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "idex-workspace.zip";
    a.click();
  };

  const manualServe = async () => {
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
          console.info("[Runtime Server]", data);
        },
      }),
    );
  };

  // --- Rendering Helpers ---
  function renderTree(items: FSTreeNode[]): React.ReactNode {
    return items.map((item) => {
      if (item.type === "folder") {
        return (
          <Folder key={item.id} id={item.id} name={item.name}>
            {renderTree(item.children || [])}
          </Folder>
        );
      }
      return <File key={item.id} id={item.id} name={item.name} />;
    });
  }

  const activeFile = useMemo(
    () => (activeFilePath ? openFiles[activeFilePath] : null),
    [activeFilePath, openFiles],
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-[#000000] text-[#cccccc] overflow-hidden font-sans border-none focus:outline-none select-none antialiased">
      <TopBar status={status} />

      <main className="flex-1 flex overflow-hidden w-full relative">
        {/* Sidebar Panel (20%) */}
        <div className="w-[20%] flex-shrink-0 flex flex-col border-r border-[#1a1a1a] bg-[#000000] min-w-0">
          <div className="h-10 flex items-center justify-center border-b border-[#1a1a1a] bg-[#050505] px-2 flex-shrink-0">
            <div className="flex-1 flex justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveSidebarTab("explorer")}
                className={cn(
                  "h-8 w-8 text-[#444] hover:text-white transition-all relative",
                  activeSidebarTab === "explorer" && "text-white bg-white/5",
                )}
              >
                <Files className="w-4 h-4" />
                {activeSidebarTab === "explorer" && (
                  <div className="absolute bottom-[-1px] left-1 right-1 h-[1.5px] bg-white rounded-full" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveSidebarTab("search")}
                className={cn(
                  "h-8 w-8 text-[#444] hover:text-white transition-all relative",
                  activeSidebarTab === "search" && "text-white bg-white/5",
                )}
              >
                <Search className="w-4 h-4" />
                {activeSidebarTab === "search" && (
                  <div className="absolute bottom-[-1px] left-1 right-1 h-[1.5px] bg-white rounded-full" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveSidebarTab("git")}
                className={cn(
                  "h-8 w-8 text-[#444] hover:text-white transition-all relative",
                  activeSidebarTab === "git" && "text-white bg-white/5",
                )}
              >
                <GitBranch className="w-4 h-4" />
                {activeSidebarTab === "git" && (
                  <div className="absolute bottom-[-1px] left-1 right-1 h-[1.5px] bg-white rounded-full" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveSidebarTab("settings")}
                className={cn(
                  "h-8 w-8 text-[#444] hover:text-white transition-all relative",
                  activeSidebarTab === "settings" && "text-white bg-white/5",
                )}
              >
                <Database className="w-4 h-4" />
                {activeSidebarTab === "settings" && (
                  <div className="absolute bottom-[-1px] left-1 right-1 h-[1.5px] bg-white rounded-full" />
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#444] hover:text-white"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="h-8 flex items-center justify-between px-4 text-[9px] font-black text-[#666] uppercase tracking-[0.2em] border-b border-[#1a1a1a] bg-[#020202] flex-shrink-0">
              <span className="opacity-60">{activeSidebarTab}</span>
              {activeSidebarTab === "explorer" && (
                <div className="flex gap-3">
                  <Plus
                    className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors"
                    onClick={async () => {
                      const name = prompt("Enter File Path:");
                      if (name) {
                        await instance?.fs.writeFile(name, "");
                        refreshFs();
                      }
                    }}
                  />
                  <FolderPlus
                    className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors"
                    onClick={async () => {
                      const name = prompt("Enter Folder Path:");
                      if (name) {
                        await instance?.fs.mkdir(name);
                        refreshFs();
                      }
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto py-2 no-scrollbar min-h-0 bg-[#000000]">
              {activeSidebarTab === "explorer" ? (
                <Tree onSelect={handleFileSelect}>{renderTree(fsTree)}</Tree>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-10 gap-3 grayscale">
                  <Zap className="w-10 h-10" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-center px-10">
                    Optimizing Environment...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor & Comparison Area (40%) - Fix Stretching */}
        <div className="flex-1 flex flex-col border-r border-[#1a1a1a] bg-[#000000] overflow-hidden min-w-0">
          {/* Editor Header / Tabs */}
          <div className="h-10 flex bg-[#050505] border-b border-[#1a1a1a] overflow-x-auto no-scrollbar scroll-smooth flex-shrink-0">
            {Object.keys(openFiles).map((path) => (
              <div
                key={path}
                onClick={() => setActiveFilePath(path)}
                className={cn(
                  "flex items-center gap-3 px-4 min-w-[140px] max-w-[280px] border-r border-[#1a1a1a] cursor-pointer transition-all h-full text-[11px] font-bold group relative select-none flex-shrink-0",
                  activeFilePath === path
                    ? "bg-[#000000] text-white shadow-[inset_0_-1px_0_0_#000]"
                    : "text-[#555] hover:bg-white/[0.02]",
                )}
              >
                {activeFilePath === path && (
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-white z-10" />
                )}
                {getFileIcon(
                  path,
                  "w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity",
                )}
                <span className="truncate flex-1 font-bold">
                  {path.split("/").pop()}
                </span>
                {openFiles[path].content !== openFiles[path].savedContent && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                )}
                <X
                  className="w-4 h-4 hover:bg-white/10 rounded-sm p-1 opacity-10 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(path);
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex-1 relative flex flex-col min-h-0 min-w-0 bg-[#000000]">
            {activeFile ? (
              <>
                <div className="absolute top-3 right-6 z-30 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDiff(!showDiff)}
                    className={cn(
                      "h-7 px-4 text-[10px] border border-[#1a1a1a] rounded-sm font-black uppercase tracking-[0.2em] transition-all shadow-2xl",
                      showDiff
                        ? "bg-white text-black"
                        : "text-[#555] hover:text-white bg-[#030303]",
                    )}
                  >
                    {showDiff ? "Close Comparison" : "Compare Buffer"}
                  </Button>
                  {!showDiff && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSave}
                      disabled={activeFile.content === activeFile.savedContent}
                      className="h-7 px-4 text-[10px] border border-[#1a1a1a] text-[#555] enabled:hover:text-white rounded-sm font-black uppercase tracking-[0.2em] transition-all disabled:opacity-20 shadow-2xl bg-[#030303]"
                    >
                      Commit
                    </Button>
                  )}
                </div>

                {showDiff ? (
                  <CodeDiffEditor
                    beforeContent={activeFile.savedContent}
                    afterContent={activeFile.content}
                    language={activeFile.language}
                    filename={activeFile.path}
                    className="flex-1"
                  />
                ) : (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="h-7 px-6 flex items-center gap-3 border-b border-[#1a1a1a]/40 text-[9px] text-[#444] font-black uppercase tracking-[0.2em] bg-[#020202]">
                      <span className="opacity-40 select-none">
                        ProjectRoot
                      </span>
                      <ChevronRight className="w-3 h-3 opacity-20" />
                      <span className="text-[#888]">{activeFile.path}</span>
                    </div>
                    <div className="flex-1 min-h-0">
                      <Editor
                        content={activeFile.content}
                        language={activeFile.language}
                        onChange={handleContentChange}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-8 p-20 grayscale opacity-10 select-none cursor-default transition-all hover:opacity-15 duration-1000">
                <div className="p-10 border-2 border-dashed border-white/20 rounded-[40px] animate-pulse">
                  <Cpu className="w-32 h-32 text-white" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <h2 className="text-6xl font-black uppercase tracking-[0.5em] text-white">
                    IDEx
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
                    Industrial Workstation v1.2
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Runtime & Console Area (40% or 30% Dynamic) - Fix Half-Cut Browser */}
        <div className="w-[30%] flex-shrink-0 flex flex-col bg-[#000000] overflow-hidden min-w-0">
          {/* Live Preview - Vertical 1/2 */}
          <div className="h-1/2 flex flex-col border-b border-[#1a1a1a] overflow-hidden min-h-0 relative">
            <div className="h-10 flex items-center px-5 bg-[#050505] border-b border-[#1a1a1a] justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#555] animate-pulse" />
                <span className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em]">
                  Operational View
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={manualServe}
                  className="h-6 px-3 text-[9px] text-[#444] hover:text-white border border-[#1a1a1a] rounded-sm font-black uppercase tracking-widest bg-[#0a0a0a]"
                >
                  Serve
                </Button>
                {previewUrl && (
                  <Maximize2
                    className="w-4 h-4 text-[#555] hover:text-white cursor-pointer transition-colors"
                    onClick={() => window.open(previewUrl, "_blank")}
                  />
                )}
              </div>
            </div>
            <div className="flex-1 p-2 bg-[#000000] min-h-0 overflow-hidden relative">
              <div className="h-full w-full border border-[#1a1a1a] rounded-sm overflow-hidden bg-[#000000] shadow-inner relative">
                {previewUrl ? (
                  <Safari url={previewUrl} className="h-full w-full" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-4 opacity-5 bg-white/[0.02]">
                    <Globe className="w-16 h-16 text-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic px-10 text-center">
                      Internal Uplink Passive
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Terminal Console - Vertical 1/2 */}
          <div className="h-1/2 flex flex-col overflow-hidden min-h-0 relative">
            <div className="h-10 flex items-center px-5 bg-[#050505] border-b border-[#1a1a1a] flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <TerminalIcon className="w-4 h-4 text-[#555]" />
                <span className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em]">
                  System Console
                </span>
              </div>
            </div>
            <div className="flex-1 p-2 bg-[#000000] min-h-0 overflow-hidden">
              <div className="h-full w-full border border-[#1a1a1a] rounded-sm overflow-hidden bg-[#000] p-1.5 shadow-inner">
                <Terminal instance={instance} className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
