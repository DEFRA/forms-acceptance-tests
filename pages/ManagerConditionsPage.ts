import { Page, Locator, expect } from '@playwright/test'
import { raceAgainstAccessDenied } from '~/tests/utils/raceAgainstAccessDenied.js'

export class ManagerConditionsPage {
  readonly page: Page
  readonly heading: Locator
  readonly noConditionsMessage: Locator
  readonly conditionsManagerLink: Locator
  readonly andCreateText: Locator
  readonly createNewConditionLink: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: /Manage conditions/i })
    this.noConditionsMessage = page.getByText(
      'No conditions available to use. Create a new condition.'
    )
    this.conditionsManagerLink = page.getByRole('link', {
      name: 'conditions manager'
    })
    this.andCreateText = page.getByText('and create a condition.')
    this.createNewConditionLink = page.getByRole('link', {
      name: 'Create new condition'
    })
  }

  async assertOnManagerConditionsPage() {
    await expect(this.heading).toBeVisible()
  }

  async verifyNoConditionsState() {
    await expect(this.noConditionsMessage).toBeVisible()
    await expect(this.conditionsManagerLink).toBeVisible()
    await expect(this.andCreateText).toBeVisible()
  }

  async goToCreateNewCondition() {
    await raceAgainstAccessDenied(this.page, () =>
      this.conditionsManagerLink.click()
    )
    await this.clickCreateNewConditions()
  }

  async clickCreateNewConditions() {
    await raceAgainstAccessDenied(this.page, () =>
      this.createNewConditionLink.click()
    )
  }

  async getPageHeadingText(): Promise<string> {
    return (await this.heading.textContent())?.trim() || ''
  }
}
