export interface FileState {
  path: string;
  content: string;
  savedContent: string;
  language: string;
}

export interface FSTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FSTreeNode[];
}

export type SidebarTab = "explorer" | "search" | "git" | "settings";

export type IDEStatus = "idle" | "booting" | "ready" | "error";
