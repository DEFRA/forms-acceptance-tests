import { chromium, FullConfig } from '@playwright/test'
import path from 'path'
import { LoginPage } from './pages/LoginPage.js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const __dirname = path.dirname('playwright/.auth/user.json')

const authFile = path.join(__dirname, 'user.json')
const TWENTY_MINUTES = 20 * 60 * 1000

async function globalSetup(_config: FullConfig) {
    let shouldLogin = true
    if (fs.existsSync(authFile)) {
        const stats = fs.statSync(authFile)
        const now = Date.now()
        const mtime = stats.mtime.getTime()
        if (now - mtime < TWENTY_MINUTES) {
            // user.json is fresh, no need to login again
            shouldLogin = false
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
            throw new Error('Authentication credentials not found in environment variables.')
        }

        const loginPage = new LoginPage(page, displayName)
        await page.goto('http://localhost:3000/library')
        await loginPage.login(email, password)
        await loginPage.verifyUserLoggedIn()
        await page.context().storageState({ path: authFile })
        await browser.close()
        console.log('Logged in and saved new authentication state.')
    }
}

export default globalSetup
