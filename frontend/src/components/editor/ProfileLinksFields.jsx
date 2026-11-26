import { useEffect, useId, useRef, useState } from 'react'
import Icon from '../Icon'
import { profileLinkHref } from '../../lib/profileLinks'

const presets = [
  'Website',
  'LinkedIn',
  'GitHub',
  'WhatsApp',
  'Portfolio',
  'Custom link',
]

function LinkRow({ link, index, onChange, onRemove, inputRef }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState(link.url)
  const [error, setError] = useState('')
  const root = useRef(null)
  const popup = useRef(null)
  const trigger = useRef(null)
  const urlInput = useRef(null)
  const id = useId()
  function close() {
    setOpen(false)
    trigger.current?.focus({ preventScroll: true })
  }
  useEffect(() => {
    if (!open) return
    function outside(event) {
      if (!root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])
  function show() {
    if (open) {
      close()
      return
    }
    setUrl(link.url)
    setError('')
    setOpen(true)
    requestAnimationFrame(() => {
      popup.current?.scrollIntoView({ block: 'nearest' })
      urlInput.current?.focus({ preventScroll: true })
    })
  }
  function confirm() {
    if (url.trim() && !profileLinkHref(url)) {
      setError('Enter a valid web address, such as https://example.com.')
      urlInput.current?.focus()
      return
    }
    onChange({ ...link, url: url.trim() })
    close()
  }
  return (
    <div
      ref={root}
      className="relative min-w-0"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          event.stopPropagation()
          close()
        }
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        {link.type === 'Custom link' ? (
          <input
            aria-label={`Custom field name ${index + 1}`}
            value={link.name || ''}
            onChange={(event) =>
              onChange({ ...link, name: event.target.value })
            }
            maxLength={60}
            placeholder="Custom link name"
            className="min-h-8 min-w-0 max-w-52 border border-line bg-white px-2 text-sm font-semibold"
          />
        ) : (
          <label htmlFor={id} className="text-sm font-semibold">
            {link.type || 'Link'}
          </label>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${link.name || link.type || 'link'} ${index + 1}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-muted hover:bg-paper hover:text-red-700"
        >
          <Icon name="close" className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex min-h-12 items-center gap-2 rounded-md border border-line bg-paper pr-2 focus-within:border-accent">
        <input
          id={id}
          ref={inputRef}
          aria-label={`${link.name || link.type || 'Link'} display text ${index + 1}`}
          value={link.label}
          onChange={(event) => {
            const label = event.target.value
            onChange({
              ...link,
              label,
              url: !link.url && profileLinkHref(label) ? label : link.url,
            })
          }}
          maxLength={200}
          placeholder={
            link.type === 'LinkedIn'
              ? 'in/yourname'
              : link.type === 'WhatsApp'
                ? '+66 80 123 4567'
                : 'Text to show on your resume'
          }
          className="min-h-12 min-w-0 flex-1 !border-0 bg-transparent px-3 text-sm !outline-none"
        />
        <button
          ref={trigger}
          type="button"
          aria-label={`Edit destination for ${link.name || link.type || 'link'} ${index + 1}`}
          aria-expanded={open}
          aria-controls={`${id}-url`}
          onClick={show}
          className={`flex min-h-9 shrink-0 items-center gap-1.5 rounded border px-2.5 text-xs font-medium ${open ? 'border-accent bg-sage text-accent' : 'border-line bg-white text-accent hover:bg-sage'}`}
        >
          <Icon name="link" className="h-3.5 w-3.5" />
          Link
        </button>
      </div>
      {open && (
        <div
          ref={popup}
          id={`${id}-url`}
          role="group"
          aria-label="Link destination"
          className="absolute top-full right-0 z-30 mt-2 w-full max-w-96 rounded-lg border border-line bg-white p-4 shadow-lg"
        >
          <label htmlFor={`${id}-input`} className="text-xs font-semibold">
            Link URL
          </label>
          <div className="mt-2 flex items-center gap-2">
            <input
              ref={urlInput}
              id={`${id}-input`}
              type="text"
              inputMode="url"
              autoCapitalize="none"
              spellCheck={false}
              value={url}
              onChange={(event) => {
                setUrl(event.target.value)
                setError('')
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  confirm()
                }
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              maxLength={2048}
              placeholder="https://example.com"
              className="min-h-11 min-w-0 flex-1 border border-line bg-paper px-3 text-sm"
            />
            <button
              type="button"
              onClick={confirm}
              aria-label="Apply link URL"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-white hover:bg-accent-hover"
            >
              <Icon name="check" className="h-5 w-5" />
            </button>
          </div>
          {error && (
            <p
              id={`${id}-error`}
              role="alert"
              className="mt-2 text-xs text-red-700"
            >
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProfileLinksFields({ links, onChange, firstInputRef }) {
  const labels = useRef(new Map())
  const addButton = useRef(null)
  const [choosing, setChoosing] = useState(false)
  function add(type) {
    const id = crypto.randomUUID()
    onChange([...links, { id, type, name: '', label: '', url: '' }])
    setChoosing(false)
    requestAnimationFrame(() => labels.current.get(id)?.focus())
  }
  function remove(id, index) {
    const next = links[index + 1] || links[index - 1]
    onChange(links.filter((link) => link.id !== id))
    requestAnimationFrame(() =>
      (labels.current.get(next?.id) || addButton.current)?.focus(),
    )
  }
  return (
    <div className="clear-both space-y-5">
      {links.map((link, index) => (
        <LinkRow
          key={link.id}
          link={link}
          index={index}
          inputRef={(node) => {
            if (node) labels.current.set(link.id, node)
            else labels.current.delete(link.id)
            if (index === 0 && firstInputRef) firstInputRef.current = node
          }}
          onChange={(value) =>
            onChange(links.map((item) => (item.id === link.id ? value : item)))
          }
          onRemove={() => remove(link.id, index)}
        />
      ))}
      <div className="pt-2">
        <button
          ref={(node) => {
            addButton.current = node
            if (!links.length && firstInputRef) firstInputRef.current = node
          }}
          type="button"
          aria-expanded={choosing}
          onClick={() => setChoosing(!choosing)}
          className="min-h-10 rounded-md border border-line bg-white px-3 text-xs font-medium text-accent hover:bg-sage"
        >
          <Icon name="plus" className="mr-1 inline-block h-4 w-4" />Add link
        </button>
        {choosing && (
          <div
            role="group"
            aria-label="Choose link type"
            className="mt-3 flex flex-wrap gap-2"
          >
            {presets.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => add(type)}
                className="min-h-10 rounded-md border border-line bg-paper px-3 text-xs font-medium hover:bg-paper"
              >
                <Icon name="plus" className="mr-1 inline-block h-4 w-4" />{type}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
