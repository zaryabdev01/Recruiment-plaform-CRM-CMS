import { useState, type ReactNode } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Link2Off,
  Image as ImageIcon, Undo, Redo, Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaLibraryPicker } from "./MediaLibraryPicker";
import type { CmsImage } from "@/lib/cms-api";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick, active, disabled, title, children,
}: { onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none",
        active && "bg-brand-100 text-brand-700"
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onInsertImage }: { editor: Editor; onInsertImage: () => void }) {
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5 rounded-t-lg">
      <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <ToolbarButton title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}>
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Remove link" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}>
        <Link2Off className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Insert image" onClick={onInsertImage}>
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TiptapImage.configure({ HTMLAttributes: { class: "rounded-lg max-w-full" } }),
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { class: "text-brand-600 underline" } }),
      Placeholder.configure({ placeholder: placeholder ?? "Write the page content…" }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose prose-sm max-w-none min-h-[280px] px-4 py-3 focus:outline-none" },
    },
  });

  if (!editor) {
    return <div className="w-full rounded-lg border border-gray-300 min-h-[320px] animate-pulse bg-gray-50" />;
  }

  const handleSelectImage = (image: CmsImage) => {
    editor.chain().focus().setImage({ src: image.url, alt: image.alt_text ?? image.filename }).run();
    setPickerOpen(false);
  };

  return (
    <div className="rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
      <Toolbar editor={editor} onInsertImage={() => setPickerOpen(true)} />
      <EditorContent editor={editor} />
      {pickerOpen && <MediaLibraryPicker onSelect={handleSelectImage} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}
