"use client";

import React from "react";
import { Editor } from "./editor";
import { cn } from "@/lib/utils";
import { getFileIcon } from "@/registry/magicui/file-tree";

interface CodeDiffEditorProps {
  beforeContent: string;
  afterContent: string;
  language: string;
  filename: string;
  className?: string;
}

export function CodeDiffEditor({
  beforeContent,
  afterContent,
  language,
  filename,
  className,
}: CodeDiffEditorProps) {
  return (
    <div
      className={cn(
        "flex flex-col w-full h-full bg-[#1a1a1a] gap-[1px]",
        className,
      )}
    >
      {/* Top Half: Original */}
      <div className="h-1/2 flex flex-col bg-[#000000] overflow-hidden">
        <div className="h-8 px-4 bg-[#050505] border-b border-[#1a1a1a] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-[#666] uppercase tracking-[0.2em]">
              Baseline (Original State)
            </span>
          </div>
          <div className="flex items-center gap-2 opacity-30">
            {getFileIcon(filename, "w-3 h-3")}
            <span className="text-[10px] truncate max-w-[200px]">
              {filename}
            </span>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <Editor
            content={beforeContent}
            language={language}
            onChange={() => {}}
            readOnly={true}
          />
        </div>
      </div>

      {/* Bottom Half: Modified */}
      <div className="h-1/2 flex flex-col bg-[#000000] overflow-hidden border-t border-[#1a1a1a]">
        <div className="h-8 px-4 bg-[#050505] border-b border-[#1a1a1a] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">
              Changes (Modified State)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
            <span className="text-[10px] text-[#444] font-medium uppercase tracking-widest">
              Unsaved
            </span>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <Editor
            content={afterContent}
            language={language}
            onChange={() => {}}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
}
