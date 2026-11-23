import Icon from './Icon'
import AppThemeControl from './AppThemeControl'
import AccountProfileCard from './AccountProfileCard'

export default function AdminSettings({ user, busy, onSave, onLogout }) {
  return <div className="admin-settings-grid">
    <AccountProfileCard user={user} busy={busy} onSave={onSave} className="admin-panel"/>
    <AppThemeControl/>
    <section className="account-signout-card admin-access-card"><div><h2>Your access</h2><p>Manage users, templates, plans, and reports.</p></div><span className="admin-badge is-active">Administrator</span></section>
    <section className="account-signout-card"><div><h2>Sign out</h2><p>End your session on this device.</p></div><button type="button" disabled={busy} className="button button-outline" onClick={onLogout}><Icon name="logout"/>Sign out</button></section>
  </div>
}
