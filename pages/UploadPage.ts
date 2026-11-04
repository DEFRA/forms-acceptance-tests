import { Page, Locator, expect } from '@playwright/test'
import { raceAgainstAccessDenied } from '~/tests/utils/raceAgainstAccessDenied.js'

export class UploadPage {
  readonly page: Page
  readonly mainHeading: Locator
  readonly downloadCopyLink: Locator
  readonly fileInput: Locator
  readonly uploadButton: Locator
  readonly cancelButton: Locator

  constructor(page: Page) {
    this.page = page
    this.mainHeading = page.getByRole('heading', { name: /Upload a form/i })
    this.downloadCopyLink = page.getByRole('link', { name: 'download a copy' })
    this.fileInput = page.locator('[name="file"]')
    this.uploadButton = page.getByRole('button', { name: 'Upload form' })
    this.cancelButton = page.getByRole('button', { name: 'Cancel' })
  }

  async clickDownloadCopyLink() {
    await raceAgainstAccessDenied(this.page, () =>
      this.downloadCopyLink.click()
    )
  }

  async uploadFormFile(filePath: string) {
    await this.fileInput.evaluate(
      `element => element.style.setProperty('display', 'block')`
    )
    await this.fileInput.setInputFiles(filePath)
    await expect(
      this.page.getByText('1 file uploaded', { exact: true })
    ).toBeVisible()
  }

  async clickCancel() {
    await raceAgainstAccessDenied(this.page, () => this.cancelButton.click())
  }

  async verifyMainHeading() {
    await expect(this.mainHeading).toBeVisible()
  }
}
