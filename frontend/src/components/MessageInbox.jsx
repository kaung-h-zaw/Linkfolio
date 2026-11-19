import { useState } from 'react'
import { useMessages } from '../lib/messagesContext'
import { api } from '../services/api'
import Icon from './Icon'
import './messageInbox.css'
import ConfirmDialog from './ConfirmDialog'

const timestamp = (value) => new Date(value).toLocaleString(undefined, { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })

export default function MessageInbox() {
  const { messages, unread, loaded, error, refresh } = useMessages()
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [copiedEmail, setCopiedEmail] = useState('')
  const [query, setQuery] = useState('')
  const [checkedIds, setCheckedIds] = useState([])
  const [confirmAction, setConfirmAction] = useState(null)
  const selected = messages.find((message) => message.id === selectedId)
  const inbox = messages.filter((message) => !message.deleted_at)
  const trash = messages.filter((message) => message.deleted_at)
  const folderMessages = filter === 'trash' ? trash : inbox.filter((message) => filter === 'all' || message.status === 'unread')
  const visible = folderMessages.filter((message) => `${message.sender_name} ${message.sender_email} ${message.message} ${message.slug || ''}`.toLowerCase().includes(query.trim().toLowerCase()))
  const checked = visible.filter((message) => checkedIds.includes(message.id))
  const allChecked = visible.length > 0 && checked.length === visible.length
  const detailMessages = filter === 'trash' ? trash : inbox
  const detailIndex = detailMessages.findIndex((message) => message.id === selectedId)

  async function bulkAction(action) {
    if (busy || !checked.length) return
    setBusy(true); setActionError('')
    try {
      await Promise.all(checked.map((message) => api(`/messages/${message.id}`, action === 'trash' ? { method:'DELETE' } : { method:'PATCH', body:action === 'restore' ? { action:'restore' } : { status:'read' } })))
      setCheckedIds([])
    } catch (failure) { setActionError(failure.message) }
    finally {
      await refresh().catch(() => {})
      setBusy(false)
    }
  }

  async function run(path, options, after) {
    if (busy) return
    setBusy(true); setActionError('')
    try {
      await api(path, options)
      await refresh()
      after?.()
    } catch (actionFailure) { setActionError(actionFailure.message) }
    finally { setBusy(false) }
  }
  async function runConfirmed(path, after) {
    if (busy) return
    setBusy(true); setActionError('')
    try {
      await api(path, { method:'DELETE' })
      await refresh()
      after?.()
    } catch (actionFailure) {
      setActionError(actionFailure.message)
      throw actionFailure
    } finally { setBusy(false) }
  }
  const changeStatus = (message, status) => run(`/messages/${message.id}`, { method:'PATCH', body:{ status } })
  const moveToTrash = (message) => run(`/messages/${message.id}`, { method:'DELETE' }, () => setSelectedId(null))
  const restore = (message) => run(`/messages/${message.id}`, { method:'PATCH', body:{ action:'restore' } }, () => setSelectedId(null))
  const destroy = (message) => {
    setConfirmAction({
      title: 'Delete this message permanently?',
      description: 'This message will be permanently deleted. This action cannot be undone.',
      onConfirm: () => runConfirmed(`/messages/${message.id}/permanent`, () => setSelectedId(null)),
    })
  }
  const emptyTrash = () => {
    if (!trash.length) return
    setConfirmAction({
      title: 'Empty Trash?',
      description: `Permanently delete ${trash.length} ${trash.length === 1 ? 'message' : 'messages'} from Trash? This action cannot be undone.`,
      onConfirm: () => runConfirmed('/messages/trash', () => setSelectedId(null)),
    })
  }
  function open(message) {
    setCopiedEmail('')
    setSelectedId(message.id)
    if (!message.deleted_at && message.status === 'unread') changeStatus(message, 'read')
  }
  async function copyEmail(email) {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedEmail(email)
      setActionError('')
    } catch {
      setActionError('Could not copy the email address. Select and copy it from the sender details.')
    }
  }

  return <section aria-label="Message inbox" className="workspace-inbox message-inbox-redesign gmail-inbox">
    <header className="message-inbox-header">
      <div className="mail-panel-title"><Icon name="mail"/><div><h1>Messages</h1><p>{unread > 99 ? '99+' : unread} unread {unread === 1 ? 'message' : 'messages'}</p></div></div>
      <label className="mail-search"><Icon name="mail" className="h-4 w-4"/><input type="search" aria-label="Search messages" placeholder="Search messages" value={query} onChange={(event) => { setQuery(event.target.value); setCheckedIds([]); setSelectedId(null) }}/></label>
    </header>

    <div className="message-mail-layout" data-detail={selected ? 'true' : undefined}>
        {!selected && <div className="mail-toolbar">
          <input type="checkbox" aria-label="Select all visible messages" checked={allChecked} disabled={busy || !visible.length} onChange={() => setCheckedIds(allChecked ? [] : visible.map((message) => message.id))}/>
          <button type="button" className="mail-labeled-action" title="Refresh messages" aria-label="Refresh messages" disabled={busy} onClick={() => refresh().catch(() => {})}><Icon name="refresh" className="h-4 w-4"/><span>Refresh</span></button>
          {checked.length > 0 && <><span>{checked.length} selected</span><button type="button" className="mail-labeled-action" disabled={busy} title={filter === 'trash' ? 'Restore selected' : 'Move selected to Trash'} aria-label={filter === 'trash' ? 'Restore selected messages' : 'Move selected messages to Trash'} onClick={() => bulkAction(filter === 'trash' ? 'restore' : 'trash')}><Icon name={filter === 'trash' ? 'undo' : 'trash'} className="h-4 w-4"/><span>{filter === 'trash' ? 'Restore' : 'Move to Trash'}</span></button>{filter !== 'trash' && <button type="button" className="mail-labeled-action" disabled={busy} title="Mark selected as read" aria-label="Mark selected messages as read" onClick={() => bulkAction('read')}><Icon name="mail" className="h-4 w-4"/><span>Mark as read</span></button>}</>}
          {filter === 'trash' && trash.length > 0 && <button type="button" className="mail-empty-trash" disabled={busy} onClick={emptyTrash}>Empty Trash</button>}
          <span className="mail-result-count">{visible.length ? `1–${visible.length} of ${visible.length}` : '0 messages'}</span>
        </div>}
      <aside className="message-folder-rail">
        <nav aria-label="Message folders">{[
          ['all','Inbox',inbox.length], ['unread','Unread',unread], ['trash','Trash',trash.length],
        ].map(([value,label,count]) => <button key={value} type="button" aria-current={filter === value ? 'page' : undefined} onClick={() => { setFilter(value); setSelectedId(null); setCheckedIds([]) }}><Icon name={value === 'trash' ? 'trash' : value === 'unread' ? 'mail' : 'inbox'} className="h-4 w-4"/><span>{label}</span>{count > 0 && <strong title={`${count} messages`}>{count > 99 ? '99+' : count}</strong>}</button>)}</nav>
      </aside>
      {filter === 'trash' && <p className="mail-retention-note">Messages in Trash are permanently deleted after 30 days.</p>}
      <section className="message-list-panel" aria-label={filter === 'trash' ? 'Trash messages' : 'Inbox messages'}>
        {(error || actionError) && <p role="alert" className="message-inbox-error">{actionError || error}</p>}
        {!loaded && !error && <p role="status" className="message-empty-state">Loading messages…</p>}
        {loaded && !visible.length && <div className="message-empty-state"><Icon name={filter === 'trash' ? 'trash' : 'mail'} /><h3>{filter === 'trash' ? 'Trash is empty' : filter === 'unread' ? 'You’re all caught up' : 'No messages yet'}</h3><p>{filter === 'trash' ? 'Deleted messages will stay here for up to 30 days.' : filter === 'unread' ? 'There are no unread messages.' : 'New portfolio contact messages will appear here.'}</p></div>}
        <div className="message-list">{visible.map((message) => <div className="message-list-row" data-checked={checkedIds.includes(message.id) || undefined} data-unread={!message.deleted_at && message.status === 'unread' || undefined} key={message.id}>
          <input type="checkbox" className="mail-row-checkbox" aria-label={`Select message from ${message.sender_name}: ${message.message.slice(0,40)}`} disabled={busy} checked={checkedIds.includes(message.id)} onChange={() => setCheckedIds((ids) => ids.includes(message.id) ? ids.filter((id) => id !== message.id) : [...ids,message.id])}/>
          <button type="button" disabled={busy} onClick={() => open(message)} className="message-open-button">
            <span className="message-row-sender"><span className="mail-sender-name"><strong>{message.sender_name}</strong>{!message.deleted_at && message.status === 'unread' && <span className="mail-unread-badge">Unread</span>}</span><span>{message.sender_email}</span></span>
            <span className="message-row-summary"><strong>{message.message.replace(/\s+/g,' ')}</strong></span>
            <time dateTime={message.created_at}>{timestamp(message.created_at)}</time>
          </button>
          {message.deleted_at ? <button type="button" disabled={busy} onClick={() => restore(message)} className="message-row-action" aria-label={`Restore message from ${message.sender_name}`} title="Restore"><Icon name="undo" className="h-4 w-4"/></button> : <button type="button" disabled={busy} onClick={() => moveToTrash(message)} className="message-row-action" aria-label={`Move message from ${message.sender_name} to Trash`} title="Move to Trash"><Icon name="trash" className="h-4 w-4"/></button>}
        </div>)}</div>
      </section>

      <section className="message-preview-pane" aria-label="Message preview">
        {selected ? <article className="message-detail-card">
          <div className="mail-detail-actions">
            <button type="button" className="mail-labeled-action" onClick={() => setSelectedId(null)} title="Back to messages" aria-label="Back to messages"><Icon name="back"/><span>Back</span></button>
            <span className="mail-action-divider"/>
            {selected.deleted_at ? <>
              <button type="button" className="mail-labeled-action" disabled={busy} onClick={() => restore(selected)} title="Restore message" aria-label="Restore message"><Icon name="undo"/><span>Restore</span></button>
              <button type="button" className="mail-labeled-action" disabled={busy} onClick={() => destroy(selected)} title="Delete forever" aria-label="Delete forever"><Icon name="trash"/><span>Delete forever</span></button>
            </> : <>
              <button type="button" className="mail-labeled-action" disabled={busy} onClick={() => moveToTrash(selected)} title="Move to Trash" aria-label="Move to Trash"><Icon name="trash"/><span>Move to Trash</span></button>
              <button type="button" className="mail-labeled-action" disabled={busy} onClick={() => changeStatus(selected, selected.status === 'unread' ? 'read' : 'unread')} title={`Mark as ${selected.status === 'unread' ? 'read' : 'unread'}`} aria-label={`Mark as ${selected.status === 'unread' ? 'read' : 'unread'}`}><Icon name="mail"/><span>Mark as {selected.status === 'unread' ? 'read' : 'unread'}</span></button>
            </>}
            <div className="mail-detail-navigation"><span>{detailIndex + 1} of {detailMessages.length}</span><button type="button" disabled={busy || detailIndex <= 0} onClick={() => open(detailMessages[detailIndex - 1])} title="Previous message" aria-label="Previous message"><Icon name="back"/></button><button type="button" disabled={busy || detailIndex >= detailMessages.length - 1} onClick={() => open(detailMessages[detailIndex + 1])} title="Next message" aria-label="Next message"><Icon name="arrow"/></button></div>
          </div>
          {(error || actionError) && <p role="alert" className="message-inbox-error">{actionError || error}</p>}
          <div className="mail-detail-content">
            <div className="mail-detail-subject"><h2>Portfolio enquiry</h2><span>{selected.deleted_at ? 'Trash' : 'Inbox'}</span></div>
            <div className="message-detail-sender"><span>{selected.sender_name.charAt(0).toUpperCase()}</span><div><div className="mail-sender-line"><h3>{selected.sender_name}</h3><a href={`mailto:${selected.sender_email}`}>&lt;{selected.sender_email}&gt;</a></div><details className="mail-sender-metadata"><summary>to me <Icon name="down" className="h-3 w-3"/></summary><dl><dt>From</dt><dd>{selected.sender_email}</dd><dt>Portfolio</dt><dd>{selected.slug || 'Unpublished'}</dd><dt>Received</dt><dd>{new Date(selected.created_at).toLocaleString()}</dd></dl></details></div><time dateTime={selected.created_at}>{new Date(selected.created_at).toLocaleString(undefined, { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' })}</time></div>
            <div className="message-detail-body"><p>{selected.message}</p></div>
            <div className="mail-detail-reply"><button type="button" onClick={() => copyEmail(selected.sender_email)} className="button button-outline"><Icon name={copiedEmail === selected.sender_email ? 'check' : 'copy'} className="h-4 w-4"/>{copiedEmail === selected.sender_email ? 'Email copied' : 'Copy email'}</button><span role="status" className="mail-copy-status">{copiedEmail === selected.sender_email ? 'Email address copied to clipboard.' : selected.sender_email}</span></div>
          </div>
        </article> : <div className="message-preview-empty"><span><Icon name="mail"/></span><h3>Select a message</h3><p>Choose a message from the list to read it here.</p></div>}
      </section>
    </div>
    {confirmAction && <ConfirmDialog {...confirmAction} onClose={() => setConfirmAction(null)} />}
  </section>
}
