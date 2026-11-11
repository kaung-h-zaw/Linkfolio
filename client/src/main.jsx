import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './portfolioThemes.css'
import './portfolioImageStyles.css'
import './appTheme.css'
import './editorWorkspace.css'
import './resumeThemes.css'
import App from './App.jsx'
import AppAppearanceProvider from './components/AppAppearanceProvider'
import './appAppearance.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppAppearanceProvider><App /></AppAppearanceProvider>
  </StrictMode>,
)
