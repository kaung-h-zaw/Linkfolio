import { useAppAppearance } from '../lib/appAppearanceContext'
import Icon from './Icon'

export default function AppThemeControl() {
  const {preference,setPreference}=useAppAppearance()
  return <section className="account-appearance rounded-lg border border-line bg-white p-6" aria-labelledby="account-appearance-title">
    <h2 id="account-appearance-title" className="text-xl font-semibold">Appearance</h2>
    <p className="mt-2 text-sm text-muted">Choose how Linkfolio looks on this device.</p>
    <div className="account-appearance-options" role="group" aria-label="App appearance">
      {[['light','Light','sun'],['dark','Dark','moon'],['system','System','window']].map(([value,label,icon])=><button key={value} type="button" aria-pressed={preference===value} onClick={()=>setPreference(value)}><Icon name={icon} className="h-5 w-5"/><span>{label}</span></button>)}
    </div>
    <p className="account-appearance-note">Changes apply immediately and are saved on this device.</p>
  </section>
}
