import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  workers: 1,
  timeout: 90_000,
  reporter: 'list',
  globalSetup: './tests/build.js',
  use: {
    actionTimeout: 15_000,
    viewport: { width: 1440, height: 1000 },
    acceptDownloads: true,
    trace: 'retain-on-failure',
  },
})
