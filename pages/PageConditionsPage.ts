import { Page, Locator, expect } from '@playwright/test'

/**
 * The page reached from a page's "Manage conditions" button, used to control
 * whether that page is shown to a user based on their previous answers.
 */
export class PageConditionsPage {
  readonly page: Page
  readonly addExistingRadio: Locator
  readonly createNewRadio: Locator
  readonly conditionSelect: Locator
  readonly addExistingButton: Locator

  constructor(page: Page) {
    this.page = page
    this.addExistingRadio = page.locator('#conditionChoiceAddExisting')
    this.createNewRadio = page.locator('#conditionChoiceCreateNew')
    this.conditionSelect = page.locator('#selectPageCondition')
    this.addExistingButton = page.getByRole('button', {
      name: 'Add existing condition'
    })
  }

  async addExistingCondition(conditionName: string) {
    await this.addExistingRadio.check()
    await this.conditionSelect.selectOption({ label: conditionName })
    await this.addExistingButton.click()
  }

  async assertConditionApplied(conditionName: string) {
    await expect(this.page.getByText(conditionName)).toBeVisible()
  }
}
