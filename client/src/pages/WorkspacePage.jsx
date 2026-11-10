import Icon from '../components/Icon'
import WorkspaceHeader from '../components/WorkspaceHeader'
import DashboardCards from '../components/DashboardCards'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import RemovePremiumDialog from '../components/RemovePremiumDialog'
import PortfolioAnalytics from '../components/PortfolioAnalytics'
import MessageInbox from '../components/MessageInbox'
import SetupSidebar from '../components/SetupSidebar'
import { useAuth } from '../lib/authContext'
import { api } from '../lib/api'
import { readResumes, readLegacyResumes, saveResume } from '../lib/resumeStorage'

const titles = {
  dashboard: 'Your dashboard',
  analytics: 'Portfolio analytics',
  messages: 'Contact messages',
  account: 'Your account',
  premium: 'Upgrade to Premium',
  admin: 'Administration',
}
const endpoints = {
  dashboard: '/analytics',
  analytics: '/analytics',
  premium: '/billing',
  admin: '/admin',
}

export default function WorkspacePage({ view = 'dashboard' }) {
  const { user, setUser, refreshTemplates, logout } = useAuth()
  const [params] = useSearchParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [checkout, setCheckout] = useState(null)
  const [removePremiumOpen, setRemovePremiumOpen] = useState(false)
  useEffect(() => {
    let active = true
    async function load() {
      try {
        if (view === 'premium' && params.get('session_id')) {
          const result = await api('/billing/verify', {
            method: 'POST',
            body: { sessionId: params.get('session_id') },
          })
          if (active) {
            setUser(result.user)
            setNotice(
              result.user.plan === 'premium'
                ? 'Payment confirmed. Premium is active.'
                : 'Your payment is still processing. Refresh to check again.',
            )
          }
        }
        const result = endpoints[view] ? await api(endpoints[view]) : {}
        if (view === 'dashboard') result.messages = (await api('/messages')).messages
        if (active) {
          setData(result)
          setError('')
        }
      } catch (e) {
        if (active) setError(e.message)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [view, attempt, params, setUser])
  async function action(work, success) {
    if (busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await work()
      if (view === 'admin') await refreshTemplates()
      if (success) setNotice(success)
      setAttempt((n) => n + 1)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  async function importDrafts() {
    const drafts = readLegacyResumes()
    if (!drafts.length) {
      setNotice('There are no browser drafts to import.')
      return
    }
    let count = 0
    try {
      for (const draft of drafts) {
        if (readResumes().some((record) => record.id === draft.id)) continue
        await saveResume(draft)
        count++
      }
    } catch (e) {
      throw new Error(
        `Imported ${count} drafts. ${e.message} Your original browser drafts are still available.`,
        { cause: e },
      )
    }
    setNotice(`Imported ${count} drafts. Your original browser copies are still available.`)
  }
  const records = readResumes()
  const analytics = data?.analytics || []
  return (
    <div data-workspace-view={view} className="app-workspace min-h-dvh bg-paper md:flex">
      <SetupSidebar active={view} mobileCompact />
      <main className={`min-w-0 flex-1 p-5 sm:p-8 lg:p-10 workspace-main ${view === 'dashboard' ? 'dashboard-main' : ''}`}>
        <WorkspaceHeader title={titles[view]} icon={{ dashboard:'window',analytics:'eye',messages:'mail',account:'user',premium:'spark',admin:'skills' }[view]} description={view === 'dashboard' ? `Welcome back, ${user.fullName}` : undefined} />
        {error && (
          <div
            role="alert"
            className="mt-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
            <button onClick={() => setAttempt((n) => n + 1)} className="ml-4 underline">
              Try again
            </button>
          </div>
        )}
        {notice && (
          <p role="status" className="mt-6 rounded border border-line bg-white p-4 text-sm">
            {notice}
          </p>
        )}
        {!data && !error && (
          <p className="mt-8" role="status">
            Loading…
          </p>
        )}
        {view === 'dashboard' && data && <DashboardCards records={records} analytics={analytics} messages={data.messages || []} busy={busy} onImportDrafts={() => action(importDrafts)} />}
        {view === 'analytics' && data && <PortfolioAnalytics analytics={analytics} onRefresh={async () => setData(await api('/analytics'))} />}
        {view === 'messages' && <MessageInbox />}
        {view === 'account' && (
          <div className="account-card-grid">
          <form
            className="space-y-5 rounded-lg border border-line bg-white p-6"
            onSubmit={(event) => {
              event.preventDefault()
              const fullName = new FormData(event.currentTarget).get('fullName')
              action(async () => {
                const result = await api('/account', { method: 'PATCH', body: { fullName } })
                setUser(result.user)
              }, 'Account name updated. Edit your saved resumes to update the name shown on them.')
            }}
          >
            <h2 className="text-xl font-semibold">Profile details</h2>
            <label className="block text-sm font-medium">
              Full name
              <input
                name="fullName"
                required
                maxLength={120}
                defaultValue={user.fullName}
                className="mt-2 min-h-12 w-full rounded border border-line px-3"
              />
            </label>
            <p className="text-sm">Email: {user.email}</p>
            <button disabled={busy} className="button button-green">
              <Icon name="save" className="h-4 w-4"/>Save account
            </button>
            <Link to="/forgot-password" className="block text-sm text-accent underline">
              Change your password
            </Link>
          </form>
          <section className="rounded-lg border border-line bg-white p-6">
            <h2 className="text-xl font-semibold">Your plan</h2>
            <p className="mt-3 text-base font-medium">{user.plan === 'premium' ? 'Premium' : 'Free'} account</p>
            <p className="mt-2 text-sm leading-6 text-muted">{user.plan === 'premium' ? 'Switching to Free keeps your saved work.' : 'More saved work and Premium templates.'}</p>
            {user.plan === 'premium' ? <button type="button" disabled={busy} onClick={() => setRemovePremiumOpen(true)} className="button button-outline mt-5 disabled:opacity-50">Remove Premium</button> : <Link to="/premium" className="button button-green mt-5">Upgrade to Premium</Link>}
          </section>
          <section className="rounded-lg border border-line bg-white p-6">
            <h2 className="text-xl font-semibold">Sign out</h2>
            
            <button type="button" disabled={busy} onClick={() => action(async () => { await logout() })} className="button button-outline mt-5 disabled:opacity-50"><Icon name="logout" className="h-4 w-4"/>Sign out</button>
          </section>
          {removePremiumOpen && <RemovePremiumDialog onClose={() => setRemovePremiumOpen(false)} onConfirm={async () => {
            const result = await api('/billing/downgrade', { method: 'POST' })
            setUser(result.user)
            setNotice('Premium removed. Your account is now on the Free plan.')
          }} />}
          </div>
        )}
        {view === 'premium' && data && (
          <>
            {params.get('cancelled') && (
              <p role="status" className="mt-6 text-sm">
                Checkout cancelled. Your plan has not changed.
              </p>
            )}
            <div className="plan-card-grid">
              {data.plans.filter((plan) => plan.id === 'premium').map((plan) => (
                <section key={plan.id} className="rounded-lg border border-line bg-white p-6">
                  <h2 className="text-xl font-semibold">{plan.name}</h2>
                  <p className="mt-3 text-sm leading-7">
                    {plan.resume_limit} {plan.resume_limit === 1 ? 'resume from scratch' : 'resumes from scratch'} ·{' '}
                    {plan.portfolio_limit} {plan.portfolio_limit === 1 ? 'portfolio' : 'portfolios'} · Unlimited imports
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {plan.id === 'premium'
                      ? 'Premium templates and more room for your work.'
                      : 'Free templates, PDF export, publishing, contact messages and analytics.'}
                  </p>
                  {user.plan === plan.id ? (
                    <div className="mt-5"><p className="font-semibold text-accent">Premium is active</p><Link to="/account" className="button button-outline mt-4">Manage your plan in Account</Link></div>
                  ) : (
                    plan.id === 'premium' && (
                      <button
                        disabled={busy || !plan.enabled || data.provider === 'unconfigured'}
                        onClick={() =>
                          action(async () => {
                            const result = await api('/billing/checkout', { method: 'POST' })
                            if (result.provider === 'stripe') window.location.assign(result.url)
                            else setCheckout(result.id)
                          })
                        }
                        className="button button-green mt-5 disabled:opacity-50"
                      >
                        {data.provider === 'demo' ? 'Try demo upgrade' : 'Continue to payment'}
                      </button>
                    )
                  )}
                </section>
              ))}
              <section className="plan-benefits-card rounded-lg border border-line bg-white p-6"><h2 className="text-xl font-semibold">More room for your work</h2><ul className="mt-5 space-y-4 text-sm text-muted"><li>Premium resume and portfolio templates</li><li>More saved resumes and portfolio websites</li><li>PDF exports and portfolio publishing</li></ul><Link to="/account" className="button button-outline mt-6">Manage your account</Link></section>
            </div>
            <p className="workspace-note-card mt-5 text-sm text-muted">
              {data.provider === 'demo'
                ? 'Local demonstration: no card details or money are collected. Demo upgrades are disabled in production.'
                : data.provider === 'stripe'
                  ? 'A one-time Premium purchase. The configured price is displayed on Stripe Checkout.'
                  : 'The payment gateway has not been configured. Premium checkout is unavailable.'}
            </p>
            {checkout && (
              <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6">
                <h2 className="font-semibold">Demo checkout</h2>
                <p className="mt-2 text-sm">Choose an outcome to demonstrate the payment flow.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {[
                    ['success', 'Simulate successful payment'],
                    ['failed', 'Simulate failed payment'],
                  ].map(([outcome, label]) => (
                    <button
                      key={outcome}
                      disabled={busy}
                      className="button button-outline"
                      onClick={() =>
                        action(async () => {
                          const result = await api(`/billing/demo/${checkout}`, {
                            method: 'POST',
                            body: { outcome },
                          })
                          setUser(result.user)
                          setCheckout(null)
                          setNotice(
                            result.status === 'paid'
                              ? 'Demo payment successful. Premium is active.'
                              : 'Demo payment failed. Your plan has not changed.',
                          )
                        })
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
        {view === 'admin' && data && (
          <>
            <div className="admin-stat-grid mt-8 grid gap-3 sm:grid-cols-3">
              {Object.entries(data.report).map(([label, number]) => (
                <p key={label} className="rounded border border-line bg-white p-4 text-sm">
                  <span className="capitalize">{label.replace(/([A-Z])/g, ' $1')}</span>
                  <strong className="mt-2 block text-2xl">{number}</strong>
                </p>
              ))}
            </div>
            <h2 className="mt-8 text-xl font-semibold">User accounts</h2>
            <div className="admin-account-grid mt-4 space-y-3">
              {data.users.map((account) => (
                <div
                  key={account.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded border border-line bg-white p-4"
                >
                  <div>
                    <p className="font-semibold">{account.fullName}</p>
                    <p className="break-all text-xs text-muted">
                      {account.email} · {account.plan} · {account.role} ·{' '}
                      {account.disabled ? 'Disabled' : 'Active'}
                    </p>
                  </div>
                  {account.role !== 'admin' && (
                    <button
                      disabled={busy}
                      className="button button-outline"
                      onClick={() =>
                        action(() =>
                          api(`/admin/users/${account.id}`, {
                            method: 'PATCH',
                            body: { disabled: !account.disabled },
                          }),
                        )
                      }
                    >
                      {account.disabled ? 'Enable account' : 'Disable account'}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <h2 className="mt-8 text-xl font-semibold">Templates</h2>
            <div className="admin-template-grid mt-4 grid gap-3 lg:grid-cols-2">
              {data.templates.map((template) => (
                <div
                  key={`${template.kind}-${template.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded border border-line bg-white p-4"
                >
                  <p className="text-sm">
                    {template.name} · {template.kind}
                  </p>
                  <div className="flex gap-4">
                    {[
                      ['enabled', 'Enabled'],
                      ['premium', 'Premium'],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={Boolean(template[key])}
                          disabled={busy}
                          onChange={(event) =>
                            action(() =>
                              api(`/admin/templates/${template.kind}/${template.id}`, {
                                method: 'PATCH',
                                body: {
                                  enabled: Boolean(template.enabled),
                                  premium: Boolean(template.premium),
                                  [key]: event.target.checked,
                                },
                              }),
                            )
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <h2 className="mt-8 text-xl font-semibold">Plan limits</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {data.plans.filter((plan) => plan.id === 'premium').map((plan) => (
                <PlanForm
                  key={`${plan.id}-${attempt}`}
                  plan={plan}
                  busy={busy}
                  onSave={(body) =>
                    action(
                      () => api(`/admin/plans/${plan.id}`, { method: 'PATCH', body }),
                      'Plan settings updated.',
                    )
                  }
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
function PlanForm({ plan, busy, onSave }) {
  return (
    <form
      className="space-y-3 rounded border border-line bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault()
        const fields = new FormData(event.currentTarget)
        onSave({
          resumeLimit: Number(fields.get('resumeLimit')),
          portfolioLimit: Number(fields.get('portfolioLimit')),
          enabled: fields.has('enabled'),
        })
      }}
    >
      <h3 className="font-semibold">{plan.name}</h3>
      {[
        ['resumeLimit', 'Resume limit', plan.resume_limit],
        ['portfolioLimit', 'Portfolio limit', plan.portfolio_limit],
      ].map(([name, label, value]) => (
        <label key={name} className="block text-sm">
          {label}
          <input
            name={name}
            type="number"
            min={1}
            max={100}
            required
            defaultValue={value}
            className="ml-3 min-h-10 w-20 rounded border border-line px-2"
          />
        </label>
      ))}
      <label className="flex items-center gap-2 text-sm">
        <input name="enabled" type="checkbox" defaultChecked={Boolean(plan.enabled)} />
        Allow upgrades
      </label>
      <button disabled={busy} className="button button-outline">
        Save limits
      </button>
    </form>
  )
}
