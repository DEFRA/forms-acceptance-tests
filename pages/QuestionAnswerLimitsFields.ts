import { Page, Locator } from '@playwright/test'
import { BasePage } from '~/pages/BasePage.js'

export class QuestionAnswerLimitsFields extends BasePage {
  readonly minLengthInput: Locator
  readonly maxLengthInput: Locator
  readonly regexInput: Locator
  readonly classesInput: Locator

  constructor(page: Page) {
    super(page)

    this.minLengthInput = page.getByLabel('Minimum character length (optional)')
    this.maxLengthInput = page.getByLabel('Maximum character length (optional)')
    this.regexInput = page.getByLabel('Regex (optional)')
    this.classesInput = page.getByLabel('Classes (optional)')
  }

  async setLimits(minLength: string, maxLength: string, regex?: string) {
    await this.minLengthInput.fill(minLength)
    await this.maxLengthInput.fill(maxLength)
    if (regex !== undefined) {
      await this.regexInput.fill(regex)
    }
  }

  async setClasses(classes: string) {
    await this.classesInput.fill(classes)
  }
}
