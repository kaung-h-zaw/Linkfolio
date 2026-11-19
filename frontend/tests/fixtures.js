import { test as base, expect } from '@playwright/test'
import { fork } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// Each test gets its own accounts, documents, rate limits and ephemeral port.
// No dotenv/configured database or external payment/email/AI credentials load.
export const test = base.extend({
  production: [false, { option: true }],
  baseURL: async ({ production }, provide) => {
    // Native Node runs the backend separately from Playwright's module loader.
    const server = fork(fileURLToPath(new URL('./server.js', import.meta.url)), [production ? 'production' : 'test'], {
      execArgv: [],
      env: { NODE_ENV: 'test' },
      stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
    })
    let errors = ''
    server.stderr.on('data', (chunk) => { errors += chunk })
    try {
      const url = await new Promise((resolve, reject) => {
        server.once('message', (message) => resolve(message.baseURL))
        server.once('error', reject)
        server.once('exit', (code) => reject(new Error(`Test server exited (${code}): ${errors}`)))
      })
      await provide(url)
    } finally {
      if (server.exitCode === null && server.signalCode === null) {
        await new Promise((resolve) => {
          const timeout = setTimeout(() => server.kill('SIGKILL'), 5000)
          server.once('exit', () => { clearTimeout(timeout); resolve() })
          server.kill('SIGTERM')
        })
      }
    }
  },
})

export { expect }
