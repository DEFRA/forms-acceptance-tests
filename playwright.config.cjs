import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),

  timeout: 30000,
  expect: {
    timeout: 15000
  },
  workers: process.env.CI ? 1 : undefined,

  projects: [
    {
      name: 'Google Chrome',
      testDir: 'tests/',

      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: 'playwright/.auth/user.json',
        baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
        acceptDownloads: true
      }
    },
    {
      name: 'accessibility',
      testDir: 'tests/accessibility',
      use: {
        ...devices['Desktop Chrome'],
        trace: 'on',
        channel: 'chrome',
        storageState: 'playwright/.auth/user.json',
        baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
        acceptDownloads: true
      }
    }
    // Opt out of parallel tests on CI.

    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     // Use prepared auth state.
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },
  ],

  // reporter: [["allure-playwright"]]
  reporter: [['line'], ['html'], ['allure-playwright']]
})
