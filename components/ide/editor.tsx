"use client";

import React, { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
  indentOnInput,
  syntaxHighlighting,
  bracketMatching,
  foldGutter,
  foldKeymap,
  HighlightStyle,
} from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";

const premiumHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#c678dd", fontWeight: "bold" },
  { tag: t.operator, color: "#56b6c2" },
  { tag: t.variableName, color: "#e06c75" },
  { tag: t.propertyName, color: "#d19a66" },
  { tag: t.string, color: "#98c379" },
  { tag: t.comment, color: "#5c6370", fontStyle: "italic" },
  { tag: t.number, color: "#d19a66" },
  { tag: t.bool, color: "#d19a66" },
  { tag: t.punctuation, color: "#abb2bf" },
  { tag: t.function(t.variableName), color: "#61afef" },
  { tag: t.className, color: "#e5c07b" },
  { tag: t.typeName, color: "#e5c07b" },
  { tag: t.attributeName, color: "#d19a66" },
  { tag: t.tagName, color: "#e06c75" },
]);

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  language?: string;
  onCursorChange?: (line: number, col: number) => void;
  readOnly?: boolean;
}

export function Editor({
  content,
  onChange,
  language,
  onCursorChange,
  readOnly = false,
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const getLanguageExtension = (lang?: string) => {
      switch (lang?.toLowerCase()) {
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
          return css();
        case "json":
          return json();
        case "markdown":
        case "md":
          return markdown();
        default:
          return javascript();
      }
    };

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.readOnly.of(readOnly),
        indentOnInput(),
        syntaxHighlighting(premiumHighlightStyle),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          ...lintKeymap,
        ]),
        getLanguageExtension(language),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChange(update.state.doc.toString());
          if (update.selectionSet) {
            const pos = update.state.selection.main.head;
            const line = update.state.doc.lineAt(pos);
            onCursorChange?.(line.number, pos - line.from + 1);
          }
        }),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "13px",
            backgroundColor: "#000000",
            color: "#abb2bf",
          },
          ".cm-scroller": {
            overflow: "auto",
            fontFamily:
              '"Geist Mono", "JetBrains Mono", Menlo, Monaco, monospace',
            lineHeight: "1.6",
            paddingTop: "8px",
          },
          ".cm-gutters": {
            backgroundColor: "#000000",
            borderRight: "1px solid #1a1a1a",
            color: "#444",
            minWidth: "45px",
            paddingLeft: "8px",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "transparent",
            color: "#ffffff",
          },
          "&.cm-focused .cm-cursor": { borderLeftColor: "#ffffff" },
          "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection":
            {
              backgroundColor: "rgba(255, 255, 255, 0.15)",
            },
          ".cm-activeLine": { backgroundColor: "rgba(255, 255, 255, 0.03)" },
          ".cm-panels": {
            backgroundColor: "#050505",
            color: "#abb2bf",
            borderTop: "1px solid #1a1a1a",
          },
        }),
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;
    return () => view.destroy();
  }, [language, readOnly]);

  useEffect(() => {
    if (viewRef.current && content !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: content,
        },
      });
    }
  }, [content]);

  return <div ref={editorRef} className="h-full w-full" />;
}
