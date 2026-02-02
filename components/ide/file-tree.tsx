"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  ChevronRight,
  FileCode2,
  FileJson,
  FileType2,
  FileText,
  FileBox,
  Binary,
  Cpu,
  Braces,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TreeContextProps = {
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  expandedIds: string[];
  onToggleExpand: (id: string) => void;
};

const TreeContext = createContext<TreeContextProps | undefined>(undefined);

export function useTree() {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error("useTree must be used within a Tree");
  }
  return context;
}

export const getFileIcon = (fileName: string, className?: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
      return <FileCode2 className={cn("h-4 w-4 text-[#3178c6]", className)} />;
    case "js":
    case "jsx":
      return <FileCode2 className={cn("h-4 w-4 text-[#f1e05a]", className)} />;
    case "json":
      return <FileJson className={cn("h-4 w-4 text-[#cbcb41]", className)} />;
    case "css":
    case "scss":
      return <FileType2 className={cn("h-4 w-4 text-[#563d7c]", className)} />;
    case "html":
      return <FileType2 className={cn("h-4 w-4 text-[#e34c26]", className)} />;
    case "md":
    case "markdown":
      return <FileText className={cn("h-4 w-4 text-[#42b883]", className)} />;
    case "rs":
      return <FileBox className={cn("h-4 w-4 text-[#dea584]", className)} />;
    case "py":
      return <Binary className={cn("h-4 w-4 text-[#3776ab]", className)} />;
    case "java":
      return <Cpu className={cn("h-4 w-4 text-[#007396]", className)} />;
    case "cpp":
    case "c":
    case "h":
    case "hpp":
      return <Braces className={cn("h-4 w-4 text-[#00599c]", className)} />;
    case "php":
      return <Hash className={cn("h-4 w-4 text-[#777bb4]", className)} />;
    default:
      return <FileIcon className={cn("h-4 w-4 text-[#666]", className)} />;
  }
};

interface TreeProps {
  children: React.ReactNode;
  className?: string;
  initialSelectedId?: string;
  initialExpandedIds?: string[];
  onSelect?: (id: string) => void;
}

export function Tree({
  children,
  className,
  initialSelectedId,
  initialExpandedIds = [],
  onSelect,
}: TreeProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialSelectedId,
  );
  const [expandedIds, setExpandedIds] = useState<string[]>(initialExpandedIds);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      onSelect?.(id);
    },
    [onSelect],
  );

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  return (
    <TreeContext.Provider
      value={{
        selectedId,
        onSelect: handleSelect,
        expandedIds,
        onToggleExpand: handleToggleExpand,
      }}
    >
      <div className={cn("flex flex-col select-none", className)}>
        {children}
      </div>
    </TreeContext.Provider>
  );
}

interface FolderProps {
  id: string;
  name: string;
  children?: React.ReactNode;
  className?: string;
}

export function Folder({ id, name, children, className }: FolderProps) {
  const { expandedIds, onToggleExpand } = useTree();
  const isExpanded = expandedIds.includes(id);

  return (
    <div className={cn("flex flex-col", className)}>
      <button
        onClick={() => onToggleExpand(id)}
        className="flex items-center gap-2 px-3 py-1.5 transition-colors hover:bg-white/5 text-[12px] group w-full text-left"
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 transition-transform text-[#333] group-hover:text-[#666]",
            isExpanded && "rotate-90",
          )}
        />
        {isExpanded ? (
          <FolderOpenIcon className="h-4 w-4 text-[#444] group-hover:text-white transition-colors" />
        ) : (
          <FolderIcon className="h-4 w-4 text-[#444] group-hover:text-white transition-colors" />
        )}
        <span
          className={cn(
            "truncate font-medium transition-colors",
            isExpanded ? "text-white" : "text-[#777] group-hover:text-white",
          )}
        >
          {name}
        </span>
      </button>
      {isExpanded && (
        <div className="flex flex-col pl-4 border-l border-[#111] overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}

interface FileProps {
  id: string;
  name: string;
  className?: string;
}

export function File({ id, name, className }: FileProps) {
  const { selectedId, onSelect } = useTree();
  const isSelected = selectedId === id;

  return (
    <button
      onClick={() => onSelect(id)}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 transition-all text-[12px] group w-full text-left pl-[26px]",
        isSelected
          ? "bg-white/10 text-white"
          : "text-[#777] hover:bg-white/5 hover:text-white",
      )}
    >
      {getFileIcon(name)}
      <span className="truncate font-medium">{name}</span>
    </button>
  );
}
