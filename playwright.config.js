// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Spins up the static site with `npm start` on port 8080 and runs the test
 * suite against it. Screenshots produced by the suite land in `docs/screenshots/`.
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: 'http://127.0.0.1:8080',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 800 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // iphone.spec.js is mobile-only; don't run it under desktop chromium.
      testIgnore: /iphone\.spec\.js$/,
    },
    {
      // Small-screen coverage (GitHub issue #2). Emulates an iPhone 13
      // (390 × 844, WebKit, touch enabled, mobile UA) so we exercise the
      // widget the way a phone visitor would. Run just this project with:
      //   npx playwright test --project=iphone
      name: 'iphone',
      use: { ...devices['iPhone 13'] },
      testMatch: /iphone\.spec\.js$/,
    },
  ],

  webServer: {
    command: 'npm start',
    url: 'http://127.0.0.1:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
