import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'default',
      testMatch: /typing\.spec\.js/,
      use: {
        baseURL: 'http://localhost:3000',
      },
    },
    {
      name: 'static',
      testMatch: /static-build\.spec\.js/,
      use: {
        baseURL: 'http://localhost:3001',
      },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'npm run preview:static',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
