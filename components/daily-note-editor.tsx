'use client';

import { useEffect, useMemo } from 'react';
import { EditorContent, useEditor, useEditorState, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import styles from './daily-note-editor.module.css';

export type DailyNote = string | JSONContent;

const extensions = [
  StarterKit.configure({
    blockquote: false,
    code: false,
    codeBlock: false,
    heading: false,
    horizontalRule: false,
    link: false,
  }),
];

const controls = [
  { mark: 'bold', command: 'toggleBold', label: 'Bold', icon: 'B', className: styles.bold },
  { mark: 'italic', command: 'toggleItalic', label: 'Italic', icon: 'I', className: styles.italic },
  { mark: 'underline', command: 'toggleUnderline', label: 'Underline', icon: 'U', className: styles.underline },
  { mark: 'strike', command: 'toggleStrike', label: 'Strikethrough', icon: 'S', className: styles.strike },
  { mark: 'bulletList', command: 'toggleBulletList', label: 'Bulleted list', icon: '•', className: styles.list },
  { mark: 'orderedList', command: 'toggleOrderedList', label: 'Numbered list', icon: '1.', className: styles.list },
] as const;

function noteDocument(note: DailyNote | undefined): JSONContent {
  if (note && typeof note !== 'string') return note;

  return {
    type: 'doc',
    content: (note ?? '').split(/\r?\n/).map((line) => line
      ? { type: 'paragraph', content: [{ type: 'text', text: line }] }
      : { type: 'paragraph' }),
  };
}

export function DailyNoteEditor({ note, onChange }: {
  note: DailyNote | undefined;
  onChange: (note: JSONContent | undefined) => void;
}) {
  const content = useMemo(() => noteDocument(note), [note]);
  const editor = useEditor({
    extensions,
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-label': 'Daily to-do notes',
        'aria-multiline': 'true',
        'aria-placeholder': 'Start typing…',
      },
    },
    onUpdate: ({ editor }) => {
      const { doc } = editor.state;
      const blank = editor.isEmpty && doc.childCount === 1 && doc.firstChild?.type.name === 'paragraph';
      onChange(blank ? undefined : editor.getJSON());
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor }) => controls.map(({ mark }) => editor?.isActive(mark) ?? false),
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const savedDocument = editor.schema.nodeFromJSON(content);
    if (!editor.state.doc.eq(savedDocument)) {
      editor.commands.setContent(savedDocument, { emitUpdate: false });
    }
  }, [editor, content]);

  return (
    <div className={styles.note}>
      <div className={styles.toolbar} role="group" aria-label="Note formatting">
        {controls.map(({ command, label, icon, className }, index) => (
          <button
            key={command}
            type="button"
            aria-label={label}
            title={label}
            aria-pressed={state?.[index] ?? false}
            disabled={!editor}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor?.chain().focus()[command]().run()}
          >
            <span className={className} aria-hidden="true">{icon}</span>
          </button>
        ))}
      </div>
      <EditorContent editor={editor} className={styles.editor} />
    </div>
  );
}
