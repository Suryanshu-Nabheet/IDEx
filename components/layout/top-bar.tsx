"use client";

import React from "react";
import { Github, Linkedin, Terminal, Share2 } from "lucide-react";
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
          <span className="text-[8px] font-bold text-[#444] tracking-tighter ml-[-4px] mt-[4px]">
            V1.2
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#1a1a1a]" />

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              status === "ready"
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                : status === "booting"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-red-500",
            )}
          />
          <span className="text-[9px] text-[#444] font-black uppercase tracking-[0.2em]">
            SYSTEM_{status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#444] hover:text-white transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </Button>
        <div className="h-4 w-[1px] bg-[#1a1a1a] mx-1" />
        <a
          href="https://github.com/Suryanshu-Nabheet"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#444] hover:text-white transition-colors"
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
            className="h-8 w-8 text-[#444] hover:text-white transition-colors"
          >
            <Linkedin className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </div>
  );
}
