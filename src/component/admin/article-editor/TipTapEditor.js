"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import RichTextToolbar from "./RichTextToolbar";

const TipTapEditor = forwardRef(function TipTapEditor(
  { value, onChange, dir = "rtl", placeholder = "Write your story...", onRequestImage },
  ref
) {
  const placeholderRef = useRef(placeholder);
  placeholderRef.current = placeholder;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#184e2d] underline" },
      }),
      Image.configure({
        HTMLAttributes: { class: "max-w-full h-auto rounded my-3 border border-[#e5e2da]" },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: () => placeholderRef.current,
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        dir,
        class: `min-h-[380px] p-5 bg-white focus:outline-none prose prose-sm max-w-none text-[#18221b] ${
          dir === "rtl" ? "leading-loose text-base" : "leading-relaxed text-sm"
        }`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  // Sync direction & placeholder when switching between UR and EN tabs
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    placeholderRef.current = placeholder;
    editor.setOptions({
      editorProps: {
        attributes: {
          dir,
          class: `min-h-[380px] p-5 bg-white focus:outline-none prose prose-sm max-w-none text-[#18221b] ${
            dir === "rtl" ? "leading-loose text-base" : "leading-relaxed text-sm"
          }`,
        },
      },
    });
    editor.view.dispatch(editor.state.tr);
  }, [editor, dir, placeholder]);

  // Sync external content changes (e.g., tab switch or Preview & arrange reorder)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || "") !== current) {
      editor.commands.setContent(value || "", false);
    }
  }, [editor, value]);

  useImperativeHandle(ref, () => ({
    insertImage: (url, alt = "") => {
      if (!editor || !url) return;
      editor.chain().focus().setImage({ src: url, alt }).run();
    },
    insertHtml: (html) => {
      if (!editor || !html) return;
      editor.chain().focus().insertContent(html).run();
    },
  }));

  function handleInsertLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter URL (https://...):", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function handleInsertVideo() {
    if (!editor) return;
    const url = window.prompt("Enter YouTube or Video URL:");
    if (!url) return;
    editor
      .chain()
      .focus()
      .insertContent(`<p><a href="${url}" target="_blank" rel="noopener noreferrer">Video: ${url}</a></p>`)
      .run();
  }

  const plainText = (value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = plainText ? plainText.split(" ").length : 0;
  const readMins = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="border border-[#e5e2da] bg-white">
      <RichTextToolbar
        editor={editor}
        onInsertImage={onRequestImage}
        onInsertLink={handleInsertLink}
        onInsertVideo={handleInsertVideo}
      />

      <EditorContent editor={editor} />

      <div className="px-4 py-1.5 border-t border-[#e5e2da] bg-[#fbfaf8] flex items-center justify-between text-[11px] text-[#5c635b]">
        <span>TipTap Editorial Engine (ProseMirror)</span>
        <span className="font-mono tabular-nums">
          {wordCount} words • ~{readMins} min read
        </span>
      </div>
    </div>
  );
});

export default TipTapEditor;
