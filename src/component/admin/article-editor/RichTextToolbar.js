"use client";

import React from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Minus,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Undo2,
  Redo2,
  Eraser,
} from "lucide-react";

export default function RichTextToolbar({
  editor,
  onInsertImage,
  onInsertVideo,
  onInsertLink,
}) {
  if (!editor) return null;

  const btnCls = (active = false) =>
    `p-1.5 rounded transition cursor-pointer ${
      active
        ? "bg-[#184e2d] text-white"
        : "text-[#5c635b] hover:text-[#18221b] hover:bg-[#e5e2da]/60"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[#e5e2da] bg-[#fbfaf8]">
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
        className={`${btnCls(false)} disabled:opacity-30`}
      >
        <Undo2 size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
        className={`${btnCls(false)} disabled:opacity-30`}
      >
        <Redo2 size={15} />
      </button>

      <span className="h-4 w-px bg-[#e5e2da] mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
        className={btnCls(editor.isActive("bold"))}
      >
        <Bold size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
        className={btnCls(editor.isActive("italic"))}
      >
        <Italic size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
        className={btnCls(editor.isActive("underline"))}
      >
        <Underline size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
        className={btnCls(editor.isActive("strike"))}
      >
        <Strikethrough size={15} />
      </button>

      <span className="h-4 w-px bg-[#e5e2da] mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
        className={btnCls(editor.isActive("heading", { level: 2 }))}
      >
        <Heading2 size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
        className={btnCls(editor.isActive("heading", { level: 3 }))}
      >
        <Heading3 size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Blockquote"
        className={btnCls(editor.isActive("blockquote"))}
      >
        <Quote size={15} />
      </button>

      <span className="h-4 w-px bg-[#e5e2da] mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
        className={btnCls(editor.isActive("bulletList"))}
      >
        <List size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
        className={btnCls(editor.isActive("orderedList"))}
      >
        <ListOrdered size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Divider"
        className={btnCls(false)}
      >
        <Minus size={15} />
      </button>

      <span className="h-4 w-px bg-[#e5e2da] mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        title="Align Right"
        className={btnCls(editor.isActive({ textAlign: "right" }))}
      >
        <AlignRight size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        title="Align Center"
        className={btnCls(editor.isActive({ textAlign: "center" }))}
      >
        <AlignCenter size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        title="Align Left"
        className={btnCls(editor.isActive({ textAlign: "left" }))}
      >
        <AlignLeft size={15} />
      </button>

      <span className="h-4 w-px bg-[#e5e2da] mx-1" />

      <button
        type="button"
        onClick={onInsertLink}
        title="Insert / Edit Link"
        className={btnCls(editor.isActive("link"))}
      >
        <LinkIcon size={15} />
      </button>
      <button
        type="button"
        onClick={onInsertImage}
        title="Insert Image from Media Library"
        className={btnCls(false)}
      >
        <ImageIcon size={15} />
      </button>
      <button
        type="button"
        onClick={onInsertVideo}
        title="Insert Video Link"
        className={btnCls(false)}
      >
        <Video size={15} />
      </button>

      <span className="h-4 w-px bg-[#e5e2da] mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        title="Clear Formatting"
        className={btnCls(false)}
      >
        <Eraser size={15} />
      </button>
    </div>
  );
}
