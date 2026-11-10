import { createRequire } from 'node:module'

// Reuse the client's installed lint tooling; keep a single ESLint dependency.
const require = createRequire(new URL('./client/package.json', import.meta.url))
const js = require('@eslint/js')
const globals = require('globals')

export default [
  {
    files: ['server/**/*.js'],
    ignores: ['server/node_modules/**', 'server/data/**'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
    rules: js.configs.recommended.rules,
  },
  {
    files: ['shared/**/*.mjs', 'scripts/**/*.mjs', 'eslint.config.mjs'],
    languageOptions: { globals: globals.node },
    rules: js.configs.recommended.rules,
  },
]
