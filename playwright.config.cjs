import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  timeout: 10000,
  workers: process.env.CI ? 1 : undefined,

  projects: [
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: 'playwright/.auth/user.json',
        baseURL: process.env.BASE_URL ?? 'http://localhost:3000'
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
