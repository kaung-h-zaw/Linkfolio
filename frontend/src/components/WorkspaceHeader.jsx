import Icon from './Icon'

export default function WorkspaceHeader({ title, description, icon = 'window', actions, children }) {
  return <header className="workspace-page-header"><div className="workspace-heading-group"><span className="workspace-heading-icon" aria-hidden="true"><Icon name={icon} /></span><div><h1 tabIndex={-1}>{title}</h1>{description && <p>{description}</p>}{children}</div></div>{actions && <div className="workspace-heading-actions">{actions}</div>}</header>
}
