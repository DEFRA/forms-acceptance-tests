import { randomUUID } from 'node:crypto'
import { Locator, Page } from '@playwright/test'
import { setTimeout } from 'timers/promises'

export class PageBase {
  readonly page: Page
  readonly addNewPageButton: Locator
  readonly saveAndContinueButton: Locator

  constructor(page: Page) {
    this.page = page
    this.addNewPageButton = page.getByRole('button', { name: 'Add new page' })
    this.saveAndContinueButton = page.getByRole('button', {
      name: 'Save and continue'
    })
  }

  async clickAddNewPage() {
    await this.addNewPageButton.click({ timeout: 10000 })
    await this.waitUntilReady()
  }

  async clickSaveAndContinue() {
    await this.saveAndContinueButton.click({ timeout: 10000 })
    await this.waitUntilReady()
  }


  generateNewFormName(baseName?: string) {
    const formBaseName = baseName ? baseName : 'Automated test - Playwright form'
    return `${formBaseName} ${randomUUID()}`
  }

  async waitUntilReady() {
    // try {
    //  await this.page.waitForLoadState('load', { timeout: 10000 })
    // } catch {
      // Ignore
      // try {
      //   await this.page.waitForLoadState('networkidle', { timeout: 5000 })
      // } catch {
        // Ignore
        // console.log('Wait timeout')
      }
    // }
    // await setTimeout(2000)
  // }
}