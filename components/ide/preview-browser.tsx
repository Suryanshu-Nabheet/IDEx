"use client";

import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Globe,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

interface SafariProps {
  url: string;
  className?: string;
}

export function Safari({ url, className }: SafariProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full w-full bg-[#000000] overflow-hidden select-none",
        className,
      )}
    >
      {/* Precision Header */}
      <div className="h-10 flex items-center gap-4 px-4 bg-[#050505] border-b border-[#1a1a1a] flex-shrink-0 z-10 shadow-sm">
        <div className="flex gap-1.5 opacity-20 hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>

        <div className="flex items-center gap-3 text-[#333]">
          <ChevronLeft className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
          <ChevronRight className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-black border border-[#1a1a1a] rounded-sm w-full max-w-lg shadow-inner group transition-all hover:border-[#333]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/20 group-hover:text-emerald-500/50 transition-colors" />
            <span className="text-[10px] text-[#444] truncate select-none font-bold tracking-tight">
              {url}
            </span>
            <div className="flex-1" />
            <RotateCw
              className="w-3.5 h-3.5 text-[#222] hover:text-white cursor-pointer transition-transform hover:rotate-180"
              onClick={() => window.location.reload()}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExternalLink
            className="w-3.5 h-3.5 text-[#333] hover:text-white cursor-pointer transition-colors"
            onClick={() => window.open(url, "_blank")}
          />
        </div>
      </div>

      {/* Frame Container - Fixed Height Stretching */}
      <div className="flex-1 w-full bg-white relative min-h-0 overflow-hidden">
        {/* We use an absolute container to ensure the iframe respects the flexbox bounds perfectly */}
        <div className="absolute inset-0 block bg-white">
          <iframe
            src={url}
            className="w-full h-full border-none m-0 p-0 block absolute inset-0"
            title="Preview Console"
            sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
          />
        </div>
      </div>
    </div>
  );
}
