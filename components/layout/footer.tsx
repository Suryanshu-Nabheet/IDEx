"use client";

import React from "react";
import { Cpu, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <div className="h-6 border-t border-[#1a1a1a] bg-[#050505] flex items-center justify-between px-6 text-[9px] text-[#444] font-black uppercase tracking-[0.2em] z-50 select-none flex-shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Production Terminal</span>
        </div>
        <div className="h-3 w-[1px] bg-[#111]" />
        <div className="flex items-center gap-2">
          <span>Optimized Station v1.2</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3 h-3 text-emerald-500/20" />
          <span>Environment Ready</span>
        </div>
        <div className="h-3 w-[1px] bg-[#111]" />
        <span className="text-[#222]">By Suryanshu Nabheet</span>
      </div>
    </div>
  );
}
