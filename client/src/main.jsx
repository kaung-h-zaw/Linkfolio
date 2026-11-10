import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './portfolioThemes.css'
import './portfolioImageStyles.css'
import './appTheme.css'
import './editorWorkspace.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
