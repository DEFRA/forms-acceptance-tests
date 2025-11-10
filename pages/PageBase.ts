import { randomUUID } from 'node:crypto'
import { Locator, Page } from '@playwright/test'
import { setTimeout } from 'timers/promises'

export class PageBase {
  readonly page: Page
  readonly addNewPageButton: Locator

  constructor(page: Page) {
    this.page = page
    this.addNewPageButton = page.getByRole('button', { name: 'Add new page' })
  }

  async clickAddNewPage() {
    await this.addNewPageButton.click()
    await this.waitUntilReady()
  }

  generateNewFormName(baseName?: string) {
    const formBaseName = baseName ? baseName : 'Automated test - Playwright form'
    return `${formBaseName} ${randomUUID()}`
  }

  async waitUntilReady() {
    // try {
    //   await this.page.waitForLoadState('load', { timeout: 5000 })
    // } catch {
      // Ignore
      try {
        await this.page.waitForLoadState('networkidle', { timeout: 5000 })
      } catch {
        // Ignore
      }
    // }
    // await setTimeout(2000)
  }
}