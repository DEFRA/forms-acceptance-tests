import { Page, Locator } from '@playwright/test'
import { BasePage } from '~/pages/BasePage.js'

export class QuestionDateRangeFields extends BasePage {
  readonly dateRangeHint: Locator
  readonly firstDateFieldset: Locator
  readonly secondDateFieldset: Locator
  readonly maxDaysInPastInput: Locator
  readonly maxDaysInFutureInput: Locator

  constructor(page: Page) {
    super(page)

    this.dateRangeHint = page.getByText(
      'If the date must be between two dates (optional)'
    )
    this.firstDateFieldset = page
      .locator('fieldset')
      .filter({ hasText: 'First date' })
      .first()
    this.secondDateFieldset = page
      .locator('fieldset')
      .filter({ hasText: 'Second date' })
      .first()
    this.maxDaysInPastInput = page.getByLabel('Max days in the past (optional)')
    this.maxDaysInFutureInput = page.getByLabel(
      'Max days in the future (optional)'
    )
  }

  async setDateFieldset(
    fieldset: Locator,
    parts: { day?: string; month?: string; year?: string }
  ) {
    if (parts.day !== undefined) {
      await fieldset.getByLabel('Day').fill(parts.day)
    }
    if (parts.month !== undefined) {
      await fieldset.getByLabel('Month').fill(parts.month)
    }
    if (parts.year !== undefined) {
      await fieldset.getByLabel('Year').fill(parts.year)
    }
  }

  async setFirstDate(parts: { day?: string; month?: string; year?: string }) {
    await this.setDateFieldset(this.firstDateFieldset, parts)
  }

  async setSecondDate(parts: { day?: string; month?: string; year?: string }) {
    await this.setDateFieldset(this.secondDateFieldset, parts)
  }

  async setMaxDaysLimits(maxDaysInPast: string, maxDaysInFuture: string) {
    await this.maxDaysInPastInput.fill(maxDaysInPast)
    await this.maxDaysInFutureInput.fill(maxDaysInFuture)
  }
}
