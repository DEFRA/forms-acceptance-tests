import { Page, Locator } from '@playwright/test'
import { selectOptionOrFailFast } from '~/tests/utils/selectOptionSafely.js'
import { raceAgainstAccessDenied } from '~/tests/utils/raceAgainstAccessDenied.js'

export class LibraryPage {
  readonly page: Page
  readonly createNewFormButton: Locator
  readonly searchInput: Locator
  readonly deleteButton: Locator
  readonly formsTable: Locator
  readonly clearFiltersButton: Locator
  // Sorting locators
  readonly sortSelect: Locator
  readonly sortButton: Locator

  constructor(page: Page) {
    this.page = page
    this.createNewFormButton = page.getByRole('button', {
      name: 'Create a new form'
    })
    this.searchInput = page.getByRole('textbox', { name: 'Form name' })
    this.deleteButton = page.getByRole('link', { name: 'Delete draft' })
    this.formsTable = page.getByRole('table')
    this.clearFiltersButton = page
      .getByRole('button', { name: 'Clear filters' })
      .first()
    // Sorting locators
    this.sortSelect = page.locator('#sort-select')
    this.sortButton = page.getByRole('button', { name: 'Sort forms' })
  }

  async goto() {
    await this.page.goto('/library')
  }

  async searchForm(formName: string) {
    await this.searchInput.fill(formName)
    await this.page.keyboard.press('Enter')
  }

  async clickCreateForm() {
    await raceAgainstAccessDenied(this.page, () =>
      this.createNewFormButton.click()
    )
  }

  async clearFilters() {
    await raceAgainstAccessDenied(this.page, () =>
      this.clearFiltersButton.click()
    )
  }

  async deleteForm() {
    // Click the delete button
    await raceAgainstAccessDenied(this.page, () => this.deleteButton.click())
    // Confirm deletion
    await raceAgainstAccessDenied(this.page, () =>
      this.page.getByRole('button', { name: 'Delete form' }).click()
    )
  }

  // Method to select a sort option and trigger sorting
  async sortBy(optionValue: string) {
    await selectOptionOrFailFast(this.page, this.sortSelect, optionValue)
    await raceAgainstAccessDenied(this.page, () => this.sortButton.click())
  }

  // Method to get the list of form names in the table (desktop view)
  async getFormNames(): Promise<string[]> {
    return this.page
      .locator('table.app-display-from-desktop tbody tr td:first-child a')
      .allTextContents()
  }
}
