"use client";

import React, { useEffect, useRef } from "react";
import { EditorState, Extension } from "@codemirror/state";
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
} from "@codemirror/language";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";

import {
  hyperDarkTheme,
  hyperHighlightStyle,
} from "./editor/themes/hyper-dark";
import { getLanguageExtension } from "./editor/languages/loader";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  language?: string;
  onCursorChange?: (line: number, col: number) => void;
  readOnly?: boolean;
  extensions?: Extension[];
}

// STABILITY FIX: Global constant prevents 'new array' reference on every render
const EMPTY_EXTENSIONS: Extension[] = [];

/**
 * IDEx Editor Core
 * Minimalist container that delegates scroll management to CodeMirror via correct CSS inheritance.
 */
export function Editor({
  content,
  onChange,
  language,
  onCursorChange,
  readOnly = false,
  extensions = EMPTY_EXTENSIONS,
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // REFS prevents stale closures and re-initialization
  const onChangeRef = useRef(onChange);
  const onCursorChangeRef = useRef(onCursorChange);

  useEffect(() => {
    onChangeRef.current = onChange;
    onCursorChangeRef.current = onCursorChange;
  }, [onChange, onCursorChange]);

  useEffect(() => {
    if (!editorRef.current) return;

    if (viewRef.current) viewRef.current.destroy();

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
        syntaxHighlighting(hyperHighlightStyle),
        bracketMatching(),
        closeBrackets(),
        autocompletion({
          activateOnTyping: true,
          icons: true,
          defaultKeymap: true,
        }),
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
        hyperDarkTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
          if (update.selectionSet) {
            const pos = update.state.selection.main.head;
            const line = update.state.doc.lineAt(pos);
            onCursorChangeRef.current?.(line.number, pos - line.from + 1);
          }
        }),
        ...extensions,
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;

    return () => view.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, readOnly, extensions]);

  // Sync external changes (e.g. file switch)
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

  return <div ref={editorRef} className="h-full w-full bg-[#000000]" />;
}
