import { createContext, useContext } from 'react'
export const AppAppearanceContext = createContext({preference:'system',mode:'light',setPreference:()=>{}})
export function useAppAppearance() { return useContext(AppAppearanceContext) }
export const APP_APPEARANCE_KEY = 'linkfolio.appearance'
export const validAppearance = value => ['light','dark','system'].includes(value) ? value : 'system'
