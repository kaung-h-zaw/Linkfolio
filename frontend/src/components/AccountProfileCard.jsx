import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import ChangePasswordDialog from './ChangePasswordDialog'

export default function AccountProfileCard({ user, busy, onSave, className = '' }) {
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [editing,setEditing] = useState(false)
  const [name,setName] = useState(user.fullName)
  const [saving,setSaving] = useState(false)
  const input = useRef(null)
  const editButton = useRef(null)
  const pending = busy || saving

  useEffect(() => {
    if (editing) {input.current?.focus();input.current?.select()}
  },[editing])

  function finish() {
    setEditing(false)
    requestAnimationFrame(() => editButton.current?.focus({preventScroll:true}))
  }
  function cancel() {
    if (pending) return
    setName(user.fullName)
    finish()
  }

  return <><form className={`account-profile-card rounded-lg border border-line bg-white p-6 ${className}`} onSubmit={async event => {
    event.preventDefault()
    if (!editing || pending || !name.trim()) return
    setSaving(true)
    try {
      const saved = await onSave(name.trim())
      if (saved !== false) finish()
    } finally {setSaving(false)}
  }} onKeyDown={event => {if(event.key === 'Escape' && editing && !pending){event.preventDefault();cancel()}}}>
    <div className="account-card-heading"><span className="account-card-icon"><Icon name="user" className="h-4 w-4"/></span><div><h2 className="text-xl font-semibold">Profile details</h2><p className="mt-1 text-sm text-muted">Your account identity and sign-in email.</p></div></div>
    {editing ? <label className="block text-sm font-medium">Full name<input ref={input} name="fullName" required maxLength={120} disabled={saving} value={name} onChange={event => setName(event.target.value)} className="mt-2 min-h-12 w-full rounded border border-line px-3"/></label> : <p className="account-email-row"><span>Full name</span><strong>{user.fullName}</strong></p>}
    <p className="account-email-row"><span>Email address</span><strong title={user.email}>{user.email}</strong></p>
    <div className="account-profile-actions">
      {editing ? <><button type="submit" disabled={pending || !name.trim()} className="button button-green"><Icon name="save" className="h-4 w-4"/>{saving ? 'Saving…' : 'Save account'}</button><button type="button" disabled={pending} onClick={cancel} className="button button-outline">Cancel</button></> : <button ref={editButton} type="button" disabled={pending} onClick={() => {setName(user.fullName);setEditing(true)}} className="button button-outline"><Icon name="edit" className="h-4 w-4"/>Edit profile</button>}
      <button type="button" onClick={() => setPasswordOpen(true)} className="text-sm text-ink underline underline-offset-4 hover:text-accent">Change your password</button>
    </div>
  </form>{passwordOpen && <ChangePasswordDialog onClose={() => setPasswordOpen(false)} />}</>
}
