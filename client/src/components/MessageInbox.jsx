import { useState } from 'react'
import { useMessages } from '../lib/messagesContext'
import { api } from '../lib/api'
import Icon from './Icon'

const timestamp = (value) => new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export default function MessageInbox() {
  const { messages, unread, loaded, error, refresh } = useMessages()
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const selected = messages.find((message) => message.id === selectedId)
  const visible = messages.filter((message) => filter === 'all' || message.status === 'unread')

  async function changeStatus(message, status) {
    if (busy) return
    setBusy(true)
    setActionError('')
    try {
      await api(`/messages/${message.id}`, { method: 'PATCH', body: { status } })
      await refresh()
    } catch (error) {
      setActionError(error.message)
    } finally {
      setBusy(false)
    }
  }
  function open(message) {
    setSelectedId(message.id)
    if (message.status === 'unread') changeStatus(message, 'read')
  }

  return (
    <section aria-label="Message inbox" className="workspace-inbox mt-8 overflow-hidden rounded-xl border border-line bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5">
        <div className="flex items-center gap-3">
          <Icon name="mail" className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">Inbox</h2>
          <span role="status" className="rounded-full bg-paper px-3 py-1 text-xs text-muted">{unread} unread</span>
        </div>
        <button type="button" onClick={() => refresh().catch(() => {})} className="button button-outline"><Icon name="refresh" className="h-4 w-4"/>Refresh inbox</button>
      </div>
      {(error || actionError) && <p role="alert" className="border-b border-line p-4 text-sm text-red-700">{actionError || error}</p>}
      {selected ? (
        <article className="p-5 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => setSelectedId(null)} className="min-h-11 text-sm font-medium text-muted hover:text-ink">← Back to inbox</button>
            <button type="button" disabled={busy} onClick={() => changeStatus(selected, selected.status === 'unread' ? 'read' : 'unread')} className="button button-outline disabled:opacity-50"><Icon name="mail" className="h-4 w-4"/>Mark as {selected.status === 'unread' ? 'read' : 'unread'}</button>
          </div>
          <h3 className="break-words text-xl font-semibold">Message from {selected.sender_name}</h3>
          <div className="mt-5 flex items-start gap-3">
            <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper font-semibold text-accent">{selected.sender_name.charAt(0).toUpperCase()}</span>
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-semibold">{selected.sender_name}</p>
              <a href={`mailto:${selected.sender_email}`} className="break-all text-sm text-muted hover:underline">{selected.sender_email}</a>
              <p className="mt-1 text-xs text-muted">Portfolio: {selected.slug || 'Unpublished'}</p>
            </div>
          </div>
          <time dateTime={selected.created_at} className="mt-3 block text-xs text-muted">{new Date(selected.created_at).toLocaleString()}</time>
          <p className="my-8 whitespace-pre-wrap break-words text-sm leading-7">{selected.message}</p>
          <a href={`mailto:${selected.sender_email}`} className="button button-green"><Icon name="mail" className="h-4 w-4" />Reply by email</a>
        </article>
      ) : (
        <>
          <div role="group" aria-label="Filter messages" className="flex gap-2 border-b border-line px-5 py-3">
            {[['all', 'All messages'], ['unread', 'Unread']].map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`min-h-10 rounded-md px-4 text-sm font-medium ${filter === value ? 'bg-paper text-ink' : 'text-muted hover:bg-paper'}`}>{label}{value === 'unread' && unread > 0 ? ` (${unread})` : ''}</button>)}
          </div>
          {!loaded && !error && <p role="status" className="p-8 text-sm text-muted">Loading messages…</p>}
          {loaded && !visible.length && <div className="px-6 py-16 text-center"><Icon name="mail" className="mx-auto h-9 w-9 text-muted" /><h3 className="mt-4 font-semibold">{filter === 'unread' ? 'You’re all caught up' : 'No messages yet'}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{filter === 'unread' ? 'New messages will appear here.' : 'Enable Contact and publish your portfolio so visitors can get in touch.'}</p></div>}
          <div className="message-card-grid">
            {visible.map((message) => <button key={message.id} type="button" aria-label={`Open message from ${message.sender_name}`} disabled={busy} onClick={() => open(message)} className={`flex w-full items-start gap-3 border-b border-line px-5 py-4 text-left last:border-b-0 hover:bg-paper disabled:opacity-60 sm:items-center ${message.status === 'unread' ? 'bg-white' : 'bg-paper/40'}`}>
              <span aria-hidden="true" className={`mt-2 h-2 w-2 shrink-0 rounded-full sm:mt-0 ${message.status === 'unread' ? 'bg-accent' : 'bg-transparent'}`} />
              <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-5">
                <span className={`block truncate text-sm sm:w-40 sm:shrink-0 ${message.status === 'unread' ? 'font-semibold' : 'text-muted'}`}>{message.sender_name}<span className="sr-only">{message.status === 'unread' ? ', unread' : ', read'}</span></span>
                <span className="block min-w-0 flex-1"><span className={`block truncate text-sm ${message.status === 'unread' ? 'font-medium' : 'text-muted'}`}>{message.message}</span><span className="mt-1 block truncate text-xs text-muted">{message.slug || 'Unpublished portfolio'}</span></span>
              </span>
              <time dateTime={message.created_at} className={`shrink-0 text-[11px] ${message.status === 'unread' ? 'font-semibold' : 'text-muted'}`}>{timestamp(message.created_at)}</time>
            </button>)}
          </div>
        </>
      )}
    </section>
  )
}
