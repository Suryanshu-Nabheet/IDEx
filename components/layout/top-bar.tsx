"use client";

import React from "react";
import {
  Github,
  Linkedin,
  Terminal,
  Share2,
  Search,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopBarProps {
  status: "idle" | "booting" | "ready" | "error";
}

export function TopBar({ status }: TopBarProps) {
  return (
    <div className="h-10 border-b border-[#1a1a1a] bg-[#050505] flex items-center justify-between px-3 z-50 select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
            <Terminal className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="text-[12px] font-black tracking-tight text-white uppercase">
            IDEx
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#222]" />

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              status === "ready"
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                : status === "booting"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-red-500",
            )}
          />
          <span className="text-[9px] text-[#555] font-black uppercase tracking-widest">
            {status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#555] hover:text-white transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </Button>
        <div className="h-4 w-[1px] bg-[#222] mx-1" />
        <a
          href="https://github.com/Suryanshu-Nabheet"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#555] hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
          </Button>
        </a>
        <a
          href="https://www.linkedin.com/in/suryanshu-nabheet"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#555] hover:text-white transition-colors"
          >
            <Linkedin className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </div>
  );
}
