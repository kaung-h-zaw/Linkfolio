import { useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Icon from '../Icon'
import { profileLinkHref } from '../../lib/profileLinks'

export default function SummaryEditor({
  entry,
  onChange,
  onDone,
  onDelete,
  title = 'Edit summary entry',
  label = 'Professional Summary',
  children,
  autofocus = 'end',
  afterContent,
}) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
        link: { openOnClick: false, autolink: false },
      }),
      TextAlign.configure({ types: ['paragraph'] }),
    ],
    content: entry.content,
    autofocus,
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-label': label,
        'aria-multiline': 'true',
        class: 'summary-rich-text min-h-64 p-4 text-sm leading-7 outline-none',
      },
    },
    onUpdate: ({ editor: current }) =>
      onChange({ ...entry, content: current.getJSON() }),
  })
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current
        ? {
            bold: current.isActive('bold'),
            italic: current.isActive('italic'),
            underline: current.isActive('underline'),
            bulletList: current.isActive('bulletList'),
            link: current.isActive('link'),
            align:
              ['left', 'center', 'right', 'justify'].find((value) =>
                current.isActive({ textAlign: value }),
              ) || 'left',
          }
        : {},
  })
  if (!editor) return null
  function control(label, active, action, child) {
    return (
      <button
        key={label}
        type="button"
        aria-label={label}
        title={label}
        aria-pressed={active}
        onMouseDown={(event) => event.preventDefault()}
        onClick={action}
        className={`flex h-11 min-w-11 items-center justify-center rounded px-2 text-sm ${active ? 'bg-sage text-accent' : 'text-muted hover:bg-slate-100'}`}
      >
        {child}
      </button>
    )
  }
  function applyLink(event) {
    event.preventDefault()
    const href = profileLinkHref(url)
    if (url.trim() && !href) {
      setError('Enter a valid web address.')
      return
    }
    if (href)
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    else editor.chain().focus().extendMarkRange('link').unsetLink().run()
    setLinkOpen(false)
  }
  return (
    <section className="entry-edit-form rounded-lg border border-line bg-white shadow-sm">
      <div className="p-5 sm:p-7">
        <div className="entry-edit-header mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">{title}</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...entry, visible: !entry.visible })}
              aria-pressed={!entry.visible}
              aria-label={entry.visible ? 'Hide from resume' : 'Show on resume'}
              title={entry.visible ? 'Hide from resume' : 'Show on resume'}
              className="entry-form-action"
            >
              <Icon name={entry.visible ? 'eye' : 'hidden'} className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete entry"
              title="Delete entry"
              className="entry-form-action entry-form-delete"
            >
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </div>
        </div>
        {children}
        <p className="mb-2 text-sm font-semibold">{label}</p>
        {!entry.visible && (
          <p className="mb-3 text-xs text-muted">
            This entry is hidden from your resume.
          </p>
        )}
        <div className="entry-rich-text-box rounded-md border border-line bg-paper/50 focus-within:border-accent">
          <div
            role="group"
            aria-label="Text formatting"
            className="entry-format-toolbar flex flex-wrap gap-1 border-b border-line p-2"
          >
            {control(
              'Bold',
              state.bold,
              () => editor.chain().focus().toggleBold().run(),
              <Icon name="bold" className="h-4 w-4" />,
            )}
            {control(
              'Italic',
              state.italic,
              () => editor.chain().focus().toggleItalic().run(),
              <Icon name="italic" className="h-4 w-4" />,
            )}
            {control(
              'Underline',
              state.underline,
              () => editor.chain().focus().toggleUnderline().run(),
              <Icon name="underline" className="h-4 w-4" />,
            )}
            {control(
              'Bullet list',
              state.bulletList,
              () => editor.chain().focus().toggleBulletList().run(),
              <Icon name="list" className="h-4 w-4" />,
            )}
            {control(
              'Edit text link',
              state.link,
              () => {
                setUrl(editor.getAttributes('link').href || '')
                setError('')
                setLinkOpen(!linkOpen)
              },
              <Icon name="link" className="h-4 w-4" />,
            )}
            <span aria-hidden="true" className="mx-1 border-l border-line" />
            {['left', 'center', 'right', 'justify'].map((align) =>
              control(
                `Align ${align}`,
                state.align === align,
                () => editor.chain().focus().setTextAlign(align).run(),
                <Icon name={{left:'alignLeft',center:'alignCenter',right:'alignRight',justify:'alignJustify'}[align]} className="h-4 w-4" />,
              ),
            )}
          </div>
          <EditorContent editor={editor} />
        </div>
        {linkOpen && (
          <form
            onSubmit={applyLink}
            className="mt-3 rounded border border-line p-3"
          >
            <label className="block text-xs font-semibold">
              Link URL
              <input
                autoFocus
                type="text"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="mt-2 min-h-10 w-full border border-line px-3 text-sm"
                placeholder="https://example.com"
              />
            </label>
            {error && (
              <p role="alert" className="mt-2 text-xs text-red-700">
                {error}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="min-h-9 rounded bg-accent px-3 text-xs text-white">
                Apply link
              </button>
              <button
                type="button"
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange('link')
                    .unsetLink()
                    .run()
                  setLinkOpen(false)
                }}
                className="min-h-9 px-3 text-xs"
              >
                Remove link
              </button>
              <button
                type="button"
                onClick={() => {
                  setLinkOpen(false)
                  editor.commands.focus()
                }}
                className="min-h-9 px-3 text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {afterContent}
        <p className="mt-3 text-xs leading-5 text-muted">
          Highlight text to format it. Changes appear in the preview as you
          write.
        </p>
      </div>
      <div className="editor-form-footer">
        <button
          type="button"
          onClick={onDone}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-semibold text-white hover:bg-accent-hover"
        >
          <Icon name="check" className="h-4 w-4" />
          Done
        </button>
      </div>
    </section>
  )
}
