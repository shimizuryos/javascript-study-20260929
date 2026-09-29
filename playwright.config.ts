import { defineConfig } from '@playwright/test';

const basePath = process.env.PAGES_BASE_PATH ?? '';
const port = 4173;

export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}${basePath}/`,
    trace: 'retain-on-failure',
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: {
    command: 'node scripts/serve-out.mjs',
    port,
    reuseExistingServer: !process.env.CI,
    env: { PORT: String(port), PAGES_BASE_PATH: basePath },
  },
});
