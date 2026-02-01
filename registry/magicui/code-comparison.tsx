"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import * as diff from "diff";

interface CodeComparisonProps {
  beforeCode: string;
  afterCode: string;
  language?: string;
  filename?: string;
  className?: string;
}

export function CodeComparison({
  beforeCode,
  afterCode,
  filename,
  className,
}: CodeComparisonProps) {
  const diffs = useMemo(() => {
    return diff.diffLines(beforeCode, afterCode);
  }, [beforeCode, afterCode]);

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-[#050505] border border-[#1a1a1a] overflow-hidden rounded-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#000] border-b border-[#1a1a1a]">
        <span className="text-[10px] font-bold text-[#666] uppercase tracking-wider">
          {filename || "Changes"}
        </span>
        <div className="flex items-center gap-4 text-[9px] uppercase font-bold text-[#444]">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
            <span>Deleted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
            <span>Inserted</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-[12px] leading-relaxed no-scrollbar select-none">
        {diffs.map((part, index) => (
          <div
            key={index}
            className={cn(
              "whitespace-pre-wrap px-2 border-l-2",
              part.added
                ? "bg-green-500/5 text-green-200 border-green-500/30"
                : part.removed
                  ? "bg-red-500/5 text-red-200 border-red-500/30 line-through opacity-70"
                  : "text-[#444] border-transparent",
            )}
          >
            {part.value}
          </div>
        ))}
      </div>
    </div>
  );
}
