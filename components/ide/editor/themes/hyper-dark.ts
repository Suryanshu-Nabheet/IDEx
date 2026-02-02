"use client";

import { HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { EditorView } from "@codemirror/view";

/**
 * IDEx Hyper Dark Theme
 * Engineered for industrial-grade scrolling and visibility.
 */
export const hyperDarkTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "#000000",
    color: "#d4d4d4",
  },
  "&.cm-editor": {
    height: "100%",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-scroller": {
    fontFamily: '"Geist Mono", "JetBrains Mono", Menlo, Monaco, monospace',
    lineHeight: "1.6",
    paddingTop: "12px",
    paddingBottom: "12px",
    overflow: "auto !important", // Critical for scrolling
    height: "100%",
  },
  ".cm-content": {
    padding: "0 12px",
    caretColor: "#ffffff",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#ffffff",
    borderLeftWidth: "2px",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection":
    {
      backgroundColor: "rgba(255, 255, 255, 0.15) !important",
    },
  ".cm-gutters": {
    backgroundColor: "#000000",
    color: "#333",
    borderRight: "1px solid #1a1a1a",
    minWidth: "45px",
    display: "flex",
    justifyContent: "flex-end",
    paddingRight: "8px",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "#ffffff",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
});

export const hyperHighlightStyle = HighlightStyle.define([
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
