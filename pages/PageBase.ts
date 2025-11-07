import { randomUUID } from 'node:crypto'
import { Locator, Page } from '@playwright/test'

export class PageBase {
  readonly page: Page
  readonly addNewPageButton: Locator

  constructor(page: Page) {
    this.page = page
    this.addNewPageButton = page.getByRole('button', { name: 'Add new page' })
  }

  async clickAddNewPage() {
    await this.addNewPageButton.click()
    await this.page.waitForLoadState()
  }

  generateNewFormName(baseName?: string) {
    const formBaseName = baseName ? baseName : 'Automated test - Playwright form'
    return `${formBaseName} ${randomUUID()}`
  }

  async waitUntilReady() {
    await this.page.waitForLoadState()
    // Wait for network to be idle to ensure the item is fully saved
    await this.page
      .waitForLoadState('load', { timeout: 5000 })
      .catch(() => {
        // If networkidle times out, continue anyway
    })
  }
}