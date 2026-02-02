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
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);

    setTimeout(() => fitAddon.fit(), 100);

    xtermRef.current = terminal;

    let shellProcess: any;

    async function startShell() {
      // Diagnostic sequence for professional look
      terminal.writeln("\x1b[1;32mIDEx Engineering Core v1.2\x1b[0m");
      terminal.writeln(
        "\x1b[2mSynchronizing with local runtime host...\x1b[0m",
      );

      shellProcess = await instance!.spawn("jsh", {
        terminal: { cols: terminal.cols, rows: terminal.rows },
        env: {
          PS1: "\x1b[1;32mIDEx \x1b[1;34m$ \x1b[0m",
        },
      });

      shellProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            terminal.write(data);
          },
        }),
      );

      const input = shellProcess.input.getWriter();
      terminal.onData((data) => {
        input.write(data);
      });
      terminal.onResize((size) => {
        shellProcess.resize({ cols: size.cols, rows: size.rows });
      });

      input.write('export PS1="IDEx $ "\n');
      input.write("clear\n");
    }

    startShell();

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (e) {}
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      shellProcess?.kill();
      terminal.dispose();
      xtermRef.current = null;
    };
  }, [instance]);

  return <div ref={terminalRef} className={className} />;
}
