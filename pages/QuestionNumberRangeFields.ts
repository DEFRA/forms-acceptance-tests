import { Page, Locator } from '@playwright/test'
import { BasePage } from '~/pages/BasePage.js'

export class QuestionNumberRangeFields extends BasePage {
  readonly lowestNumberInput: Locator
  readonly highestNumberInput: Locator
  readonly precisionInput: Locator
  readonly prefixInput: Locator
  readonly suffixInput: Locator

  constructor(page: Page) {
    super(page)

    this.lowestNumberInput = page.getByLabel(
      'Lowest number users can enter (optional)'
    )
    this.highestNumberInput = page.getByLabel(
      'Highest number users can enter (optional)'
    )
    this.precisionInput = page.getByLabel('Precision (optional)')
    this.prefixInput = page.getByLabel('Prefix (optional)')
    this.suffixInput = page.getByLabel('Suffix (optional)')
  }

  async setLowestNumber(lowestNumber: string): Promise<void> {
    await this.lowestNumberInput.fill(lowestNumber)
  }

  async setHighestNumber(highestNumber: string): Promise<void> {
    await this.highestNumberInput.fill(highestNumber)
  }

  async setPrecision(precision: string): Promise<void> {
    await this.precisionInput.fill(precision)
  }

  async setPrefix(prefix: string): Promise<void> {
    await this.prefixInput.fill(prefix)
  }

  async setSuffix(suffix: string): Promise<void> {
    await this.suffixInput.fill(suffix)
  }
}
