import { Link } from 'react-router-dom'
import Icon from './Icon'
import AppThemeControl from './AppThemeControl'

export default function AdminSettings({ user, busy, onSave, onLogout }) {
  return <div className="admin-settings-grid">
    <div className="admin-settings-column">
      <form className="account-profile-card admin-panel" onSubmit={event => {event.preventDefault();onSave(new FormData(event.currentTarget).get('fullName'))}}>
        <div className="account-card-heading"><span className="account-card-icon"><Icon name="user" className="h-4 w-4"/></span><div><h2>Profile details</h2><p>Your account identity and sign-in email.</p></div></div>
        <label className="admin-settings-name">Full name<input name="fullName" required maxLength={120} defaultValue={user.fullName}/></label>
        <p className="account-email-row"><span>Email address</span><strong title={user.email}>{user.email}</strong></p>
        <div className="account-profile-actions"><button disabled={busy} className="button button-green"><Icon name="save"/>Save account</button><Link to="/forgot-password" className="admin-settings-password">Change your password</Link></div>
      </form>
      <section className="account-signout-card"><div><h2>Sign out</h2><p>End your session on this device.</p></div><button type="button" disabled={busy} className="button button-outline" onClick={onLogout}><Icon name="logout"/>Sign out</button></section>
    </div>
    <div className="admin-settings-column">
      <section className="admin-panel admin-access-card"><div className="account-card-heading"><span className="account-card-icon"><Icon name="skills" className="h-4 w-4"/></span><div><h2>Your access</h2><p>Your role in Linkfolio.</p></div></div><div className="account-plan-status"><span className="account-plan-dot" aria-hidden="true"/>Administrator</div><p className="admin-settings-access-note">Manage user accounts, templates, subscription plans, and system reports.</p></section>
      <AppThemeControl/>
    </div>
  </div>
}
