'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false })
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="bg-gray-800 p-4 rounded mb-4 text-white">
      {/* Toolbar */}
      <div className="flex space-x-2 mb-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-600 px-2 rounded' : 'px-2 rounded'}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-600 px-2 rounded' : 'px-2 rounded'}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-gray-600 px-2 rounded' : 'px-2 rounded'}
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-600 px-2 rounded' : 'px-2 rounded'}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-600 px-2 rounded' : 'px-2 rounded'}
        >
          Num
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt('Introduce la URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={editor.isActive('link') ? 'bg-gray-600 px-2 rounded' : 'px-2 rounded'}
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className="px-2 rounded"
        >
          🚫🔗
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white text-black rounded p-2 max-h-[1000px]">
        <EditorContent
  editor={editor}
  className="rich-editor-content"
/>
      </div>
    </div>
  );
}
