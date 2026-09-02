import { Page, expect } from '@playwright/test'

export class SubmissionPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async verifyMainHeading(referenceNumber: string) {
    const mainHeading = this.page.getByRole('heading', {
      name: referenceNumber
    })
    await expect(mainHeading).toBeVisible()
  }

  async verifyLede(body: string) {
    const lede = this.page.getByText(body)
    await expect(lede).toBeVisible()
  }

  async verifySectionHeading(name: string) {
    await expect(
      this.page.getByRole('heading', {
        name
      })
    ).toBeVisible()
  }

  async verifySummaryListItem(key: string, value: string) {
    const summaryKey = this.page
      .locator('dt.govuk-summary-list__key', {
        hasText: key
      })
      .first()
    const summaryValue = this.page
      .locator('dd.govuk-summary-list__value', {
        hasText: value
      })
      .first()

    await expect(summaryKey).toBeVisible()
    await expect(summaryValue).toBeVisible()
  }

  async verifySummaryCount(count: number) {
    const summaries = this.page.locator('dl.govuk-summary-list')
    await expect(await summaries.count()).toBe(count)
  }

  async verifyRepeaterSummaryCount(count: number) {
    const summaries = this.page.locator('div.govuk-summary-card')
    await expect(await summaries.count()).toBe(count)
  }

  async verifyMapReviewLinkCount(count: number) {
    const links = this.page.locator(
      '.govuk-summary-list__actions .govuk-link',
      {
        hasText: 'Review map'
      }
    )
    await expect(await links.count()).toBe(count)
  }

  async verifyFilesDownloadLinkCount(count: number) {
    const links = this.page.locator(
      '.govuk-summary-list__actions .govuk-link',
      {
        hasText: 'Download files'
      }
    )
    await expect(await links.count()).toBe(count)
  }
}
