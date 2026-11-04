import { Page, Locator } from '@playwright/test'
import { BasePage } from '~/pages/BasePage.js'
import { raceAgainstAccessDenied } from '~/tests/utils/raceAgainstAccessDenied.js'

export class QuestionListFields extends BasePage {
  readonly addItemButton: Locator
  readonly itemTextBox: Locator
  readonly saveItemButton: Locator
  readonly radioHint: Locator

  constructor(page: Page) {
    super(page)

    this.addItemButton = page.getByRole('button', { name: 'Add item to list' })
    this.itemTextBox = page.getByRole('textbox', { name: 'Item' })
    this.saveItemButton = page.getByRole('button', { name: 'Save item' })
    this.radioHint = page.locator('#radioHint')
  }

  async getItems(): Promise<string[]> {
    const listItems = await this.page
      .locator('li.app-reorderable-list__item .option-label-display')
      .allTextContents()
    return listItems.map((item) => item.trim())
  }

  async addAutoCompleteOptions(options: string[]): Promise<void> {
    // Autocomplete questions use a single textarea where each option is on its
    // own line, rather than the "Add list item" repeater used by other lists.
    await this.page.locator('#autoCompleteOptions').fill(options.join('\n'))
  }

  async addItems(items: string[]): Promise<void> {
    for (const item of items) {
      await raceAgainstAccessDenied(this.page, () => this.addItemButton.click())

      // Wait for the item input to be visible and interactable
      await this.itemTextBox.waitFor({ state: 'visible', timeout: 10000 })

      // Use fill() directly rather than click() then fill() — fill focuses and types reliably
      await this.itemTextBox.fill(item, { timeout: 5000 })

      // Click save and wait for the item to appear in the rendered list,
      // confirming the save round-trip completed before adding the next one
      await raceAgainstAccessDenied(this.page, () =>
        this.saveItemButton.click()
      )
      await this.page
        .locator('li.app-reorderable-list__item .option-label-display', {
          hasText: item
        })
        .waitFor({ state: 'visible', timeout: 10000 })
    }
  }
}
