import { Page } from '@playwright/test'

export class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async waitForNetworkIdle() {
    // Wait for network to be idle to ensure the item is fully saved
    await this.page
      .waitForLoadState('networkidle', { timeout: 500 })
      .catch(() => {
        // If networkidle times out, continue anyway
      })
  }
}
