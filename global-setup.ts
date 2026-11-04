import { chromium, type FullConfig } from '@playwright/test'
import path from 'node:path'
import { LoginPage } from '~/pages/LoginPage.js'
import dotenv from 'dotenv'
import fs from 'node:fs'

dotenv.config()

const __dirname = path.dirname('playwright/.auth/user.json')

const authFile = path.join(__dirname, 'user.json')
const TWENTY_MINUTES = 20 * 60 * 1000
const STARTUP_TIMEOUT = 30_000
const RETRY_INTERVAL = 2_000
const REQUEST_TIMEOUT = 5_000

function getLibraryUrl(config: FullConfig) {
  // Use the URL the tests will use, so login and tests hit the same host.
  const baseUrl = config.projects[0]?.use.baseURL ?? 'http://localhost:3000'

  return new URL('/library', baseUrl).toString()
}

async function waitForDesigner(libraryUrl: string) {
  const deadline = Date.now() + STARTUP_TIMEOUT
  let lastError: unknown

  while (Date.now() < deadline) {
    try {
      // Don't follow redirects: a redirect to login means the designer is up,
      // and the login provider's speed shouldn't affect this check.
      const response = await fetch(libraryUrl, {
        redirect: 'manual',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      })

      if (response.status < 500) {
        return
      }

      lastError = new Error(`Received HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL))
  }

  throw new Error(
    `Forms Designer did not become available at ${libraryUrl} within ${STARTUP_TIMEOUT / 1000} seconds. Start the test harness or set BASE_URL to a running environment.`,
    { cause: lastError }
  )
}

async function globalSetup(config: FullConfig) {
  const libraryUrl = getLibraryUrl(config)
  await waitForDesigner(libraryUrl)

  let shouldLogin = true
  if (fs.existsSync(authFile)) {
    const stats = fs.statSync(authFile)
    const now = Date.now()
    const mtime = stats.mtime.getTime()
    if (now - mtime < TWENTY_MINUTES) {
      // user.json is fresh, no need to login again
      shouldLogin = false
      // eslint-disable-next-line no-console
      console.log('Using existing authentication state.')
    }
  }

  if (shouldLogin) {
    const browser = await chromium.launch()
    const page = await browser.newPage()
    const displayName = process.env.AUTH_DISPLAY_NAME
    const email = process.env.AUTH_EMAIL
    const password = process.env.AUTH_PASSWORD

    if (!email || !password || !displayName) {
      throw new Error(
        'Authentication credentials not found in environment variables.'
      )
    }

    const loginPage = new LoginPage(page, displayName)
    await page.goto(libraryUrl)
    await loginPage.login(email, password)
    await loginPage.verifyUserLoggedIn()
    await page.context().storageState({ path: authFile })
    await browser.close()
    // eslint-disable-next-line no-console
    console.log('Logged in and saved new authentication state.')
  }
}

export default globalSetup
