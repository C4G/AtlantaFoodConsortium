import { defineConfig, devices } from '@playwright/test';
import './e2e/load-env';

/** Account injection for e2e test */
export const AUTH_FILES = {
  admin: 'e2e/.auth/admin.json',
  supplier: 'e2e/.auth/supplier.json',
  nonprofit: 'e2e/.auth/nonprofit.json',
} as const;

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: './e2e/results',

  // THis here is setup to run sequentially
  fullyParallel: false,
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,

  reporter: [['html', { outputFolder: 'e2e/report', open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:3000',
    headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  globalSetup: './e2e/global.setup.ts',
  globalTeardown: './e2e/global.teardown.ts',

  projects: [
    {
      name: 'e2e-flow',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
