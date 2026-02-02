"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getWebContainer } from "@/lib/webcontainer";
import { WebContainer } from "@webcontainer/api";

/**
 * Hook to interface with the WebContainer API.
 * Handles booting, status tracking, and core filesystem operations.
 */
export function useWebContainer() {
  const [instance, setInstance] = useState<WebContainer | null>(null);
  const [status, setStatus] = useState<"idle" | "booting" | "ready" | "error">(
    "idle",
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isBooting = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      // Check global state first to avoid redundant booting
      if (status === "ready" || isBooting.current) return;

      isBooting.current = true;
      setStatus("booting");

      try {
        const wc = await getWebContainer();
        if (!mounted) return;

        setInstance(wc);
        setStatus("ready");

        // Attach server-ready listener only once
        // Note: webcontainer listeners might be additive, so we should be careful.
        // For this singleton pattern, it's safer to attach listeners in the component
        // OR check if we've already attached.
        // A simple way is to just set it here.
        wc.on("server-ready", (port, url) => {
          if (mounted) {
            console.log(`[WebContainer] Server ready at port ${port}: ${url}`);
            setPreviewUrl(url);
          }
        });

        console.log("[WebContainer] Engine initialized successfully.");
      } catch (err) {
        if (mounted) {
          console.error("[WebContainer] Initialization failed:", err);
          setStatus("error");
        }
      } finally {
        isBooting.current = false;
      }
    }

    boot();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array to run once on mount (or singleton check handles rest)

  // --- Filesystem Actions ---

  const writeFile = useCallback(
    async (path: string, content: string) => {
      if (!instance) return;
      try {
        await instance.fs.writeFile(path, content);
      } catch (err) {
        console.error(`[WebContainer] Failed to write file: ${path}`, err);
      }
    },
    [instance],
  );

  const readFile = useCallback(
    async (path: string) => {
      if (!instance) return null;
      try {
        return await instance.fs.readFile(path, "utf-8");
      } catch (err) {
        console.error(`[WebContainer] Failed to read file: ${path}`, err);
        return null;
      }
    },
    [instance],
  );

  const readdir = useCallback(
    async (path: string) => {
      if (!instance) return [];
      try {
        return await instance.fs.readdir(path, { withFileTypes: true });
      } catch (err) {
        console.error(`[WebContainer] Failed to read directory: ${path}`, err);
        return [];
      }
    },
    [instance],
  );

  const mkdir = useCallback(
    async (path: string) => {
      if (!instance) return;
      try {
        await instance.fs.mkdir(path, { recursive: true });
      } catch (err) {
        console.error(
          `[WebContainer] Failed to create directory: ${path}`,
          err,
        );
      }
    },
    [instance],
  );

  const rm = useCallback(
    async (path: string) => {
      if (!instance) return;
      try {
        await instance.fs.rm(path, { recursive: true });
      } catch (err) {
        console.error(`[WebContainer] Failed to remove path: ${path}`, err);
      }
    },
    [instance],
  );

  return {
    instance,
    status,
    previewUrl,
    writeFile,
    readFile,
    readdir,
    mkdir,
    rm,
  };
}
