"use client";

import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { rust } from "@codemirror/lang-rust";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { php } from "@codemirror/lang-php";

export function getLanguageExtension(lang?: string) {
  const l = lang?.toLowerCase();
  switch (l) {
    case "javascript":
    case "js":
    case "jsx":
    case "typescript":
    case "ts":
    case "tsx":
      return javascript();
    case "python":
    case "py":
      return python();
    case "html":
      return html();
    case "css":
    case "scss":
    case "sass":
      return css();
    case "json":
      return json();
    case "markdown":
    case "md":
      return markdown();
    case "rust":
    case "rs":
      return rust();
    case "cpp":
    case "c++":
    case "c":
    case "h":
    case "hpp":
      return cpp();
    case "java":
      return java();
    case "php":
      return php();
    default:
      return javascript();
  }
}
