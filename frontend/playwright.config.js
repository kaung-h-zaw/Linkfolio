import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: [
    {
      command: 'LINKFOLIO_TEST_PORT=38371 node ../backend/test/e2e-server.js',
      url: 'http://127.0.0.1:38371/api/health',
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: 'LINKFOLIO_API_PROXY=http://127.0.0.1:38371 npm run dev -- --host 127.0.0.1 --port 5174 --strictPort',
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
})
