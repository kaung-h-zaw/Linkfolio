import { useState } from 'react'
import { Link } from 'react-router-dom'
import { savePublication } from '../../lib/resumeStorage'

export default function PublicationPanel({ documentId, publication, onSave }) {
  const [editingUrl, setEditingUrl] = useState(false)
  const [draftSlug, setDraftSlug] = useState('')
  const [visibility, setVisibility] = useState(publication?.visibility || 'private')
  const [saved, setSaved] = useState(null)
  const current = saved || publication
  const slug = current?.slug || ''
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function saveUrl(event) {
    event.preventDefault()
    if (busy) return
    setBusy(true); setMessage('')
    try {
      const document = await onSave()
      const result = await savePublication(documentId,{slug:draftSlug,visibility:current?.visibility || document?.publication?.visibility || 'private'})
      setSaved(result); setEditingUrl(false); setMessage('Portfolio URL updated.')
    } catch (error) { setMessage(error.message) }
    finally { setBusy(false) }
  }
  async function submit(event) {
    event.preventDefault()
    if (busy || editingUrl) return
    setBusy(true); setMessage('')
    try {
      const document = await onSave()
      const result = await savePublication(documentId, { slug: slug || document?.publication?.slug || '', visibility })
      setSaved(result)
      setMessage(result.visibility === 'public' ? 'Your portfolio is published.' : 'Your portfolio is private. Visitors cannot access it.')
    } catch (error) { setMessage(error.message) }
    finally { setBusy(false) }
  }
  return (
    <section id="portfolio-publication" tabIndex={-1} className="rounded-md border border-line bg-white p-5">
      <h1 tabIndex={-1} className="font-semibold">Publish & share</h1>
      <form className="mt-5 space-y-3 rounded-md border border-line p-4" onSubmit={saveUrl}>
        <label className="block text-sm font-medium">
          Portfolio URL
          <span className="mt-2 block break-all text-xs text-muted">{window.location.origin}/p/</span>
          <input aria-label="Portfolio URL" readOnly={!editingUrl} required={editingUrl} disabled={busy} minLength={3} maxLength={60} pattern="[a-z0-9][a-z0-9-]{1,58}[a-z0-9]" value={editingUrl ? draftSlug : slug} onChange={(event) => setDraftSlug(event.target.value.toLowerCase())} placeholder="Assigned automatically when you save" className="mt-2 min-h-11 w-full rounded border border-line px-3 read-only:bg-paper" />
        </label>
        {editingUrl ? <>
          <p className="text-xs leading-5 text-muted">Changing this address will replace your current link. Use 3–60 lowercase letters, numbers or hyphens.</p>
          <div className="flex flex-wrap gap-3">
            <button disabled={busy} className="button button-green">Save URL</button>
            <button type="button" disabled={busy} className="button button-outline" onClick={() => { setEditingUrl(false); setMessage('') }}>Cancel</button>
          </div>
        </> : <button type="button" disabled={busy} className="button button-outline" onClick={() => { setDraftSlug(slug); setEditingUrl(true); setMessage('') }}>Edit URL</button>}
      </form>
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <label className="block text-sm font-medium">Visibility
          <select aria-label="Visibility" value={visibility} onChange={(event) => setVisibility(event.target.value)} className="mt-2 min-h-11 w-full rounded border border-line bg-white px-3">
            <option value="private">Private — only you can preview</option>
            <option value="public">Public — anyone with the URL</option>
          </select>
        </label>
        <button disabled={busy || editingUrl} className="button button-green disabled:opacity-50">{busy ? 'Saving…' : visibility === 'public' ? 'Publish portfolio' : 'Save private portfolio'}</button>
      </form>
      {message && <p role="status" className="mt-3 text-sm">{message}</p>}
      {current?.visibility === 'public' && <div className="publication-link-buttons">
        <Link target="_blank" rel="noopener noreferrer" to={`/p/${slug}`} className="editor-nav-button">Open public portfolio</Link>
        <button type="button" className="editor-nav-button" onClick={async () => {
          try { await navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`); setMessage('Portfolio URL copied.') }
          catch { setMessage(`Copy this URL: ${window.location.origin}/p/${slug}`) }
        }}>Copy share link</button>
      </div>}
    </section>
  )
}
