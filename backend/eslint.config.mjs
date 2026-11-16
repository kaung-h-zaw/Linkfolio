import { createRequire } from 'node:module'

// Reuse the client's installed lint tooling; keep a single ESLint dependency.
const require = createRequire(new URL('../frontend/package.json', import.meta.url))
const js = require('@eslint/js')
const globals = require('globals')

export default [
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**', 'data/**'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
    rules: js.configs.recommended.rules,
  },
  {
    files: ['**/*.mjs'],
    languageOptions: { globals: globals.node },
    rules: js.configs.recommended.rules,
  },
]
