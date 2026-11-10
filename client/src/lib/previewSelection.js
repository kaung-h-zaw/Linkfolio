import { createContext } from 'react'

// Editor-only selection; public pages and PDF exports use the empty default.
export const PreviewSelectionContext = createContext('')
