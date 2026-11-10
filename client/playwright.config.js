import { defineConfig } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { env } from 'node:process'

const databasePath = join(tmpdir(), `linkfolio-browser-${randomUUID()}.sqlite`)
export default defineConfig({
  testDir: './tests',
  workers: 1,
  timeout: 90_000,
  reporter: 'list',
  metadata: { databasePath },
  globalTeardown: './tests/cleanup.js',
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1440, height: 1000 },
    acceptDownloads: true,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && node ../server/index.js',
    url: 'http://localhost:4173/api/health',
    timeout: 60_000,
    reuseExistingServer: false,
    env: {
      PORT: '4173',
      APP_ORIGIN: 'http://localhost:4173',
      DATABASE_PATH: databasePath,
      DATABASE_URL: env.TEST_DATABASE_URL || '',
      NODE_ENV: 'test',
      DEMO_PAYMENTS: 'true',
      STRIPE_SECRET_KEY: '',
      SMTP_URL: '',
    },
  },
})
