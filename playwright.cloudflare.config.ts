import { defineConfig } from '@playwright/test';

/** Cloudflare Workers (静的ファイル + /api + D1) をローカルで動かして、ログインと同期を確かめる E2E */
export default defineConfig({
  testDir: 'e2e-cloudflare',
  timeout: 90_000,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-cloudflare' }]]
    : 'list',
  use: {
    baseURL: 'http://localhost:8787/',
    trace: 'retain-on-failure',
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: {
    command: 'node scripts/dev-cloudflare.mjs',
    url: 'http://localhost:8787/api/me',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
