"use client";

import React from "react";
import { X, ChevronRight, Cpu, Save, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/ide/editor";
import { CodeDiffEditor } from "@/components/ide/code-diff-editor";
import { getFileIcon } from "@/components/ide/file-tree";
import { cn } from "@/lib/utils";
import { FileState } from "@/lib/types";

interface WorkspacePanelProps {
  openFiles: Record<string, FileState>;
  activeFilePath: string | null;
  setActiveFilePath: (path: string) => void;
  closeFile: (path: string) => void;
  showDiff: boolean;
  setShowDiff: (show: boolean) => void;
  onContentChange: (content: string) => void;
  onSave: () => void;
}

/**
 * IDEx Industrial Workspace
 * Features:
 * - 100% Guaranteed Layout via Grid
 * - Absolute Positioned Actions for Visibility
 * - High-Contrast Control Elements
 */
export function WorkspacePanel({
  openFiles,
  activeFilePath,
  setActiveFilePath,
  closeFile,
  showDiff,
  setShowDiff,
  onContentChange,
  onSave,
}: WorkspacePanelProps) {
  const activeFile = activeFilePath ? openFiles[activeFilePath] : null;

  return (
    <div className="h-full w-full bg-[#000000] border-r border-[#1a1a1a] flex flex-col min-h-0">
      {/* Tab Bar */}
      <div className="h-[40px] flex-shrink-0 flex bg-[#050505] border-b border-[#1a1a1a] overflow-x-auto no-scrollbar scroll-smooth">
        {Object.keys(openFiles).map((path) => (
          <div
            key={path}
            onClick={() => setActiveFilePath(path)}
            className={cn(
              "flex items-center gap-3 px-4 min-w-[140px] max-w-[280px] border-r border-[#1a1a1a] cursor-pointer transition-all h-full text-[11px] font-bold group relative select-none flex-shrink-0",
              activeFilePath === path
                ? "bg-[#000000] text-white shadow-[inset_0_-1px_0_0_#000]"
                : "text-[#444] hover:bg-white/[0.01]",
            )}
          >
            {activeFilePath === path && (
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-white z-10" />
            )}
            {getFileIcon(
              path,
              "w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity",
            )}
            <span className="truncate flex-1 font-bold tracking-tight">
              {path.split("/").pop()}
            </span>
            {openFiles[path].content !== openFiles[path].savedContent && (
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
            )}
            <X
              className="w-4 h-4 hover:bg-white/10 rounded-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                closeFile(path);
              }}
            />
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 relative min-h-0 min-w-0 bg-[#000000] flex flex-col">
        {activeFile ? (
          <>
            {/* Context Header */}
            <div className="h-[36px] flex-shrink-0 flex items-center px-4 border-b border-[#1a1a1a]/40 bg-[#020202] relative z-20">
              <div className="flex items-center gap-3 text-[9px] text-[#444] font-black uppercase tracking-[0.2em] select-none">
                <span className="opacity-30">FS_ROOT</span>
                <ChevronRight className="w-3 h-3 opacity-20" />
                <span className="text-[#888] font-black">
                  {activeFile.path}
                </span>
              </div>

              {/* ABSOLUTE POSITIONED ACTIONS - GUARANTEED VISIBILITY */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDiff(!showDiff)}
                  className={cn(
                    "h-6 px-3 text-[9px] border border-[#1a1a1a] rounded-[2px] font-black uppercase tracking-[0.2em] transition-all bg-[#080808] z-50",
                    showDiff
                      ? "bg-white text-black"
                      : "text-[#555] hover:text-white",
                  )}
                >
                  <GitCompare className="w-3 h-3 mr-1.5" />
                  {showDiff ? "SOURCE" : "COMPARE"}
                </Button>
                {!showDiff && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSave}
                    disabled={activeFile.content === activeFile.savedContent}
                    className="h-6 px-3 text-[9px] border border-[#1a1a1a] text-[#555] enabled:hover:text-white rounded-[2px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-20 bg-[#080808] shadow-sm z-50"
                  >
                    <Save className="w-3 h-3 mr-1.5" />
                    COMMIT
                  </Button>
                )}
              </div>
            </div>

            {/* Editor Surface */}
            <div className="flex-1 relative min-h-0 bg-[#000000]">
              {showDiff ? (
                <div className="absolute inset-0">
                  <CodeDiffEditor
                    beforeContent={activeFile.savedContent}
                    afterContent={activeFile.content}
                    language={activeFile.language}
                    filename={activeFile.path}
                    className="h-full w-full"
                  />
                </div>
              ) : (
                <div className="h-full w-full relative">
                  <Editor
                    content={activeFile.content}
                    language={activeFile.language}
                    onChange={onContentChange}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-6 opacity-10 select-none">
            <Cpu className="w-20 h-20" />
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-4xl font-black uppercase tracking-[0.4em]">
                IDEx
              </h1>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
