"use client";

import React from "react";
import {
  Files,
  Search,
  GitBranch,
  Database,
  ChevronDown,
  Plus,
  FolderPlus,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tree, Folder, File } from "@/components/ide/file-tree";
import { cn } from "@/lib/utils";
import { FSTreeNode, SidebarTab } from "@/lib/types";

interface SidebarPanelProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  fsTree: FSTreeNode[];
  onFileSelect: (path: string) => void;
  onNewFile: () => void;
  onNewFolder: () => void;
}

export function SidebarPanel({
  activeTab,
  setActiveTab,
  fsTree,
  onFileSelect,
  onNewFile,
  onNewFolder,
}: SidebarPanelProps) {
  const renderTree = (items: FSTreeNode[]): React.ReactNode => {
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
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#000000] overflow-hidden">
      <div className="h-10 flex items-center justify-center border-b border-[#1a1a1a] bg-[#050505] px-1 flex-shrink-0">
        <div className="flex-1 flex justify-center gap-1">
          {[
            { id: "explorer" as const, icon: Files },
            { id: "search" as const, icon: Search },
            { id: "git" as const, icon: GitBranch },
            { id: "settings" as const, icon: Database },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "h-8 w-8 text-[#444] hover:text-white transition-all relative group",
                activeTab === tab.id && "text-white bg-white/5",
              )}
            >
              <tab.icon className="w-4 h-4" />
              {activeTab === tab.id && (
                <div className="absolute bottom-[0px] left-1 right-1 h-[1px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
              )}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#444] hover:text-white"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-8 flex items-center justify-between px-4 text-[9px] font-black text-[#555] uppercase tracking-[0.2em] border-b border-[#1a1a1a] bg-[#020202] flex-shrink-0">
          <span className="opacity-60">{activeTab}</span>
          {activeTab === "explorer" && (
            <div className="flex gap-3">
              <Plus
                className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors"
                onClick={onNewFile}
              />
              <FolderPlus
                className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors"
                onClick={onNewFolder}
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto py-2 no-scrollbar bg-[#000000]">
          {activeTab === "explorer" ? (
            <Tree onSelect={onFileSelect}>{renderTree(fsTree)}</Tree>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-10 gap-3 grayscale px-6 text-center">
              <Zap className="w-10 h-10" />
              <span className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                System Module Optimization in Progress
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
