"use client";

import React, { useMemo } from "react";
import { Editor } from "./editor";
import { cn } from "@/lib/utils";
import { getFileIcon } from "@/components/ide/file-tree";
import { diffLines } from "diff";
import { EditorView, Decoration } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";

interface CodeDiffEditorProps {
  beforeContent: string;
  afterContent: string;
  language: string;
  filename: string;
  className?: string;
}

/**
 * Creates a CodeMirror extension that highlights specific lines with a background color.
 */
function createHighlightExtension(lines: number[], color: "green" | "red") {
  const lineDecoration = Decoration.line({
    attributes: {
      style: `background-color: ${color === "green" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
    },
  });

  return StateField.define({
    create() {
      return Decoration.none;
    },
    update(decorations, tr) {
      return Decoration.set(
        lines
          .map((line) => {
            // Ensure line is within bounds (1-based index)
            // Warning: if doc changes this might be off, but for read-only diff it's fine.
            // We need to get the line position from the doc.
            // Actually, simpler to just map blindly if we assume static content.
            // However, StateField update runs on init.
            try {
              const lineInfo = tr.state.doc.line(line);
              return lineDecoration.range(lineInfo.from);
            } catch (e) {
              return null;
            }
          })
          .filter((d): d is any => d !== null),
      );
    },
    provide: (f) => EditorView.decorations.from(f),
  });
}

export function CodeDiffEditor({
  beforeContent,
  afterContent,
  language,
  filename,
  className,
}: CodeDiffEditorProps) {
  // Calculate Diff
  const { beforeHighlights, afterHighlights } = useMemo(() => {
    const changes = diffLines(beforeContent, afterContent);
    const beforeLines: number[] = [];
    const afterLines: number[] = [];

    let beforeLineParam = 1;
    let afterLineParam = 1;

    changes.forEach((part) => {
      if (part.added) {
        // Lines added in 'after' content
        for (let i = 0; i < part.count!; i++) {
          afterLines.push(afterLineParam + i);
        }
        afterLineParam += part.count!;
      } else if (part.removed) {
        // Lines removed from 'before' content
        for (let i = 0; i < part.count!; i++) {
          beforeLines.push(beforeLineParam + i);
        }
        beforeLineParam += part.count!;
      } else {
        // Unchanged
        beforeLineParam += part.count!;
        afterLineParam += part.count!;
      }
    });

    return { beforeHighlights: beforeLines, afterHighlights: afterLines };
  }, [beforeContent, afterContent]);

  const beforeExtension = useMemo(
    () => [createHighlightExtension(beforeHighlights, "red")],
    [beforeHighlights],
  );
  const afterExtension = useMemo(
    () => [createHighlightExtension(afterHighlights, "green")],
    [afterHighlights],
  );

  return (
    <div
      className={cn(
        "flex flex-col w-full h-full bg-[#1a1a1a] gap-[1px]",
        className,
      )}
    >
      {/* TOP Panel: Baseline (Red diffs) */}
      <div className="h-1/2 flex flex-col bg-[#000000] overflow-hidden min-h-0">
        <div className="h-8 px-4 bg-[#050505] border-b border-[#1a1a1a] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-[#555] uppercase tracking-[0.2em]">
              Baseline (Deleted)
            </span>
          </div>
          <div className="flex items-center gap-2 opacity-30">
            {getFileIcon(filename, "w-3 h-3")}
            <span className="text-[10px] truncate max-w-[120px]">
              {filename}
            </span>
          </div>
        </div>
        <div className="flex-1 min-h-0 relative">
          <Editor
            content={beforeContent}
            language={language}
            onChange={() => {}}
            readOnly={true}
            extensions={beforeExtension}
          />
        </div>
      </div>

      {/* BOTTOM Panel: Working (Green diffs) */}
      <div className="h-1/2 flex flex-col bg-[#000000] overflow-hidden min-h-0">
        <div className="h-8 px-4 bg-[#050505] border-b border-[#1a1a1a] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">
              Working (Added)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
            <span className="text-[10px] text-[#444] font-medium uppercase tracking-[0.2em]">
              Live
            </span>
          </div>
        </div>
        <div className="flex-1 min-h-0 relative">
          <Editor
            content={afterContent}
            language={language}
            onChange={() => {}}
            readOnly={true}
            extensions={afterExtension}
          />
        </div>
      </div>
    </div>
  );
}
