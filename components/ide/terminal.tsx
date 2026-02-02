"use client";

import React, { useEffect, useRef } from "react";
import { Terminal as Xterm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebContainer } from "@webcontainer/api";
import "@xterm/xterm/css/xterm.css";

interface TerminalProps {
  instance: WebContainer | null;
  className?: string;
}

export function Terminal({ instance, className }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Xterm | null>(null);

  useEffect(() => {
    if (!terminalRef.current || !instance || xtermRef.current) return;

    const terminal = new Xterm({
      cursorBlink: true,
      theme: {
        background: "#000000",
        foreground: "#cccccc",
        cursor: "#ffffff",
        selectionBackground: "rgba(255, 255, 255, 0.2)",
        black: "#000000",
        red: "#ff5f57",
        green: "#28c840",
        yellow: "#febc2e",
        blue: "#007acc",
        magenta: "#a855f7",
        cyan: "#06b6d4",
        white: "#e0e0e0",
      },
      fontSize: 12,
      fontFamily: "Menlo, Monaco, monospace",
      lineHeight: 1.2,
      convertEol: true, // Crucial for clean newlines
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);

    // Fit immediately
    fitAddon.fit();

    xtermRef.current = terminal;

    let shellProcess: any;
    let isDisposed = false;

    async function startShell() {
      // Diagnostic sequence
      terminal.writeln("\x1b[1;32mIDEx Engineering Core v1.2\x1b[0m");

      try {
        if (terminalRef.current) terminalRef.current.style.opacity = "1"; // Ensure visible

        const cols = terminal.cols || 80;
        const rows = terminal.rows || 24;

        shellProcess = await instance!.spawn("jsh", {
          terminal: { cols, rows },
        });

        const inputWriter = shellProcess.input.getWriter();

        const onResizeDisposable = terminal.onResize((size) => {
          try {
            if (shellProcess && size.cols > 0 && size.rows > 0) {
              shellProcess.resize({ cols: size.cols, rows: size.rows });
            }
          } catch (e) {
            /* Ignore */
          }
        });

        const onDataDisposable = terminal.onData((data) => {
          try {
            inputWriter.write(data);
          } catch (e) {
            /* Ignore */
          }
        });

        const reader = shellProcess.output.getReader();

        // STREAM FILTERING LOOP
        // We intercept the raw output and forcefully rewrite the prompt
        (async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done || isDisposed) break;

              // 1. Filter internal errors
              if (
                value.includes("exitCode") ||
                value.includes("jsh: Cannot read")
              )
                continue;

              // 2. PROMPT REWRITING (The Nuclear Option)
              // Regex matches: "~/webcontainer-id" followed by newline and "❯ "
              // We replace it with "IDEx $ "
              const cleanValue = value
                .replace(/~\/[\w-]+\n❯ /g, "\x1b[32mIDEx\x1b[0m $ ")
                .replace(/❯ /g, "\x1b[32mIDEx\x1b[0m $ "); // Catch fallback

              terminal.write(cleanValue);
            }
          } catch (e) {
            /* Stream error */
          }
        })();

        return () => {
          onDataDisposable.dispose();
          onResizeDisposable.dispose();
          try {
            inputWriter.releaseLock();
          } catch (e) {}
          try {
            reader.cancel();
          } catch (e) {}
        };
      } catch (e) {
        terminal.writeln("\r\n\x1b[31;1mShell Integration Failed\x1b[0m");
      }
    }

    const cleanupPromise = startShell();

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (e) {}
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isDisposed = true;
      window.removeEventListener("resize", handleResize);
      shellProcess?.kill();
      terminal.dispose();
      xtermRef.current = null;
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, [instance]);

  return <div ref={terminalRef} className={className} />;
}
