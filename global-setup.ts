import { chromium, type FullConfig, type Page } from '@playwright/test'
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

function getLibraryUrl() {
  const baseUrl =
    process.env.BASE_URL ??
    process.env.DESIGNER_BASE_URL ??
    'http://localhost:3000'

  return new URL('/library', baseUrl).toString()
}

async function waitForDesigner(page: Page) {
  const libraryUrl = getLibraryUrl()
  const deadline = Date.now() + STARTUP_TIMEOUT
  let lastError: unknown

  while (Date.now() < deadline) {
    try {
      await page.goto(libraryUrl, {
        timeout: RETRY_INTERVAL,
        waitUntil: 'domcontentloaded'
      })
      return
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL))
    }
  }

  throw new Error(
    `Forms Designer did not become available at ${libraryUrl} within ${STARTUP_TIMEOUT / 1000} seconds. Start the test harness or set BASE_URL to a running environment.`,
    { cause: lastError }
  )
}

async function globalSetup(_config: FullConfig) {
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
    await waitForDesigner(page)
    await loginPage.login(email, password)
    await loginPage.verifyUserLoggedIn()
    await page.context().storageState({ path: authFile })
    await browser.close()
    // eslint-disable-next-line no-console
    console.log('Logged in and saved new authentication state.')
  }
}

export default globalSetup
