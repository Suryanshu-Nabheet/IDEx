"use client";

import React from "react";
import { Globe, Terminal as TerminalIcon, Zap, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Safari } from "@/components/ide/preview-browser";
import { Terminal } from "@/components/ide/terminal";
import { WebContainer } from "@webcontainer/api";

interface RuntimePanelProps {
  instance: WebContainer | null;
  previewUrl: string | null;
  onAutoServe: () => void;
}

export function RuntimePanel({
  instance,
  previewUrl,
  onAutoServe,
}: RuntimePanelProps) {
  return (
    <div className="w-full h-full flex flex-col bg-[#000000] overflow-hidden min-w-0">
      {/* Live Preview - Uses flex-1 to safeguard against overflowing constraints */}
      <div className="flex-1 flex flex-col border-b border-[#1a1a1a] overflow-hidden min-h-0 relative group">
        <div className="h-10 flex items-center px-4 bg-[#050505] border-b border-[#1a1a1a] justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#555] animate-pulse" />
            <span className="text-[9px] font-black text-[#666] uppercase tracking-[0.2em] truncate">
              Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAutoServe}
              className="h-6 px-2 text-[9px] text-[#444] hover:text-white border border-[#1a1a1a] rounded-[2px] font-black uppercase tracking-widest bg-[#0a0a0a] transition-all"
            >
              <Zap className="w-3 h-3 mr-1 fill-emerald-500/20" />
              Link
            </Button>
            {previewUrl && (
              <Maximize2
                className="w-3.5 h-3.5 text-[#555] hover:text-white cursor-pointer transition-colors"
                onClick={() => window.open(previewUrl, "_blank")}
              />
            )}
          </div>
        </div>
        <div className="flex-1 bg-[#000000] min-h-0 overflow-hidden relative">
          {/* Pure Container for Browser */}
          <div className="absolute inset-0 border border-[#1a1a1a]/50 border-t-0 p-0">
            {previewUrl ? (
              <Safari url={previewUrl} className="h-full w-full" />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-6 opacity-5 bg-white/[0.01]">
                <Globe className="w-12 h-12 text-white" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">
                    Standby
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Console - Uses flex-1 (50/50 Split effectively) */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
        <div className="h-10 flex items-center px-4 bg-[#050505] border-b border-[#1a1a1a] flex-shrink-0">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-3.5 h-3.5 text-[#555]" />
            <span className="text-[9px] font-black text-[#666] uppercase tracking-[0.2em]">
              Console
            </span>
          </div>
        </div>
        <div className="flex-1 bg-[#000000] min-h-0 overflow-hidden relative">
          <div className="absolute inset-0 p-1">
            <div className="h-full w-full border border-[#1a1a1a] rounded-[2px] overflow-hidden bg-[#000]">
              <Terminal instance={instance} className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
