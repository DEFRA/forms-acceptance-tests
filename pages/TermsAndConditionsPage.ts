import { Page, Locator, expect } from '@playwright/test'

export class TermsAndConditionsPage {
  readonly page: Page
  readonly heading: Locator
  readonly caption: Locator
  readonly agreeCheckbox: Locator
  readonly saveAndContinueButton: Locator
  readonly cancelButton: Locator
  readonly errorBox: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', {
      level: 1,
      name: /Terms and conditions/
    })
    this.caption = page.locator('.govuk-caption-l')
    this.agreeCheckbox = page.getByRole('checkbox', {
      name: 'I agree to the data protection terms and conditions'
    })
    this.saveAndContinueButton = page.getByRole('button', {
      name: 'Save and continue'
    })
    this.cancelButton = page.getByRole('button', { name: 'Cancel' })
    this.errorBox = page.getByRole('alert')
  }

  async expectOnPage() {
    await expect(this.heading).toBeVisible()
    await expect(this.agreeCheckbox).toBeVisible()
  }

  async agreeToTerms() {
    await this.agreeCheckbox.check()
  }

  async clickSaveAndContinue() {
    await this.saveAndContinueButton.click()
  }

  async clickCancel() {
    await this.cancelButton.click()
  }

  async getErrorMessage(): Promise<string> {
    await this.errorBox.isVisible()
    return (await this.errorBox.textContent()) ?? ''
  }
}
