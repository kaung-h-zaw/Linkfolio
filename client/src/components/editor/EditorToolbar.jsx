import LogoMark from '../LogoMark'
import Icon from '../Icon'
import { Link } from 'react-router-dom'
import ResumeDownloadButton from '../ResumeDownloadButton'

export default function EditorToolbar({ mode = 'resume', navigation, onHome, onPreview, isPreview = false, previewButtonRef, onSave, resumeName, saveStatus, profile }) {
  const portfolio = mode === 'portfolio'
  return <header className="app-editor-toolbar editor-navigation-bar calm-editor-bar z-20 shrink-0">
    <div className="editor-toolbar-main">
      <Link to={portfolio?'/dashboard':'/setup'} onClick={onHome} aria-label="Home" className="editor-nav-button editor-back-link"><LogoMark className="toolbar-home-logo" /><span>Home</span></Link>
      {navigation}
      <div className="editor-document-meta"><span title={resumeName}>{resumeName}</span><span role="status">{saveStatus || 'Not saved yet'}</span></div>


      <div className={`editor-toolbar-actions ${portfolio ? 'is-portfolio' : ''}`}>

        {!portfolio && profile && <ResumeDownloadButton profile={profile} label="Download PDF" shortLabel="PDF" showIcon buttonClassName="editor-nav-button" />}
        <button type="button" ref={previewButtonRef} onClick={onPreview} aria-controls="editor-preview" aria-pressed={isPreview} aria-label={isPreview ? 'Back to editor' : 'Preview'} title={isPreview ? 'Back to editor' : 'Preview'} className="editor-nav-button"><Icon name="eye" className="h-4 w-4" /><span className="toolbar-preview-label">{isPreview ? 'Back to editor' : 'Preview'}</span></button>
        <button type="button" disabled={!onSave} onClick={onSave} title={`Save ${mode} to your account`} className="editor-nav-button editor-save-button"><Icon name="save" className="h-4 w-4" /><span>Save</span></button>
      </div>
    </div>

  </header>
}
