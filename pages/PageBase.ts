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
    await this.page.waitForLoadState()
    // await setTimeout(1000)
  }
}