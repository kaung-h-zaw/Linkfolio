import { freeResumeTemplateIds } from './templateCatalog.js'
import { useAuth } from './authContext'
export function useTemplateAccess() {
  const auth = useAuth()
  return (id, kind) => {
    const template = auth?.templates?.find((t) => t.id === id && t.kind === kind)
    const premium = template
      ? Boolean(template.premium)
      : ![...freeResumeTemplateIds, 'essential', 'classic', 'editorial', 'strata', 'miniport', 'bento'].includes(id)
    const enabled = template ? Boolean(template.enabled) : true
    return { premium, enabled, allowed: enabled && (!premium || auth?.user?.plan === 'premium') }
  }
}
