import { Page, Locator } from '@playwright/test'
import { BasePage } from '~/pages/BasePage.js'

export class EditQuestionPage extends BasePage {
  // Locators for page elements
  readonly pageHeading: Locator
  readonly questionInput: Locator
  readonly hintTextInput: Locator
  readonly optionalCheckbox: Locator
  readonly giveInstructionsCheckbox: Locator
  readonly sssiCheckbox: Locator
  readonly shortDescriptionInput: Locator
  readonly declarationTextInput: Locator
  readonly minLengthInput: Locator
  readonly maxLengthInput: Locator
  readonly regexInput: Locator
  readonly classesInput: Locator
  readonly saveAndContinueButton: Locator
  readonly deleteQuestionLink: Locator
  readonly previewPageButton: Locator
  readonly previewErrorMessagesButton: Locator
  readonly addItemButton: Locator
  readonly itemTextBox: Locator
  readonly saveItemButton: Locator
  readonly radioHint: Locator
  readonly advancedFeaturesLink: Locator
  readonly uniqueIdentifierInput: Locator
  readonly cancelLink: Locator
  readonly reorderLink: Locator
  readonly doneLink: Locator
  readonly pagePreviewLabel: Locator
  readonly questionText: Locator

  constructor(page: Page) {
    super(page)

    // Initialize locators using ARIA attributes
    this.pageHeading = page.getByRole('heading', {
      name: /Edit page \d+: question \d+/
    })
    this.questionInput = page.getByRole('textbox', { name: 'Question' })
    this.hintTextInput = page.getByLabel('Hint text (optional)')
    this.optionalCheckbox = page.getByLabel('Make this question optional')
    this.giveInstructionsCheckbox = page.getByLabel(
      'Give instructions to help users answer this question'
    )
    // Accessible locator for SSSI checkbox (uses visible label)
    this.sssiCheckbox = page.getByRole('checkbox', {
      name: 'Sites of Special Scientific Interest'
    })
    this.shortDescriptionInput = page.getByLabel('Short description')
    this.declarationTextInput = page.getByLabel('Declaration text')
    this.minLengthInput = page.getByLabel('Minimum character length (optional)')
    this.maxLengthInput = page.getByLabel('Maximum character length (optional)')
    this.regexInput = page.getByLabel('Regex (optional)')
    this.classesInput = page.getByLabel('Classes (optional)')
    this.saveAndContinueButton = page.getByRole('button', {
      name: 'Save and continue'
    })
    this.deleteQuestionLink = page.getByRole('link', {
      name: 'Delete question'
    })
    this.previewPageButton = page.getByRole('button', { name: 'Preview page' })
    this.previewErrorMessagesButton = page.getByRole('button', {
      name: 'Preview error messages'
    })
    this.addItemButton = page.getByRole('button', { name: 'Add item to list' })
    this.itemTextBox = page.getByRole('textbox', { name: 'Item' })
    this.saveItemButton = page.getByRole('button', { name: 'Save item' })
    this.radioHint = page.locator('#radioHint')
    this.advancedFeaturesLink = page.getByText('Advanced features')
    this.uniqueIdentifierInput = page.getByRole('textbox', {
      name: 'Unique identifier (optional)'
    })
    this.cancelLink = page.getByRole('link', { name: 'Cancel' })
    this.reorderLink = page.getByRole('link', { name: 'Re-order' })
    this.doneLink = page.getByRole('link', { name: 'Done' })
    this.pagePreviewLabel = page.getByLabel('Page preview')
    this.questionText = page.getByText('Question')
  }

  async getPageHeadingText(): Promise<string> {
    const text = await this.pageHeading.textContent()
    return text ?? ''
  }

  async fillQuestionDetails(
    question: string,
    hintText: string,
    shortDescription: string
  ) {
    await this.questionInput.fill(question)
    await this.hintTextInput.fill(hintText)
    await this.shortDescriptionInput.fill(shortDescription)
  }

  async setOptionalCheckbox(isOptional: boolean) {
    if (isOptional) {
      await this.optionalCheckbox.check()
    } else {
      await this.optionalCheckbox.uncheck()
    }
  }

  async setGiveInstructionsCheckbox(giveInstructions: boolean) {
    if (giveInstructions) {
      await this.giveInstructionsCheckbox.check()
    } else {
      await this.giveInstructionsCheckbox.uncheck()
    }
  }

  async setSssiCheckbox(isChecked: boolean) {
    if (isChecked) {
      await this.sssiCheckbox.check()
    } else {
      await this.sssiCheckbox.uncheck()
    }
  }

  async expandAdditionalSettings() {
    const summary = this.page.getByText('Additional settings (optional)')
    const details = this.page.locator('details').filter({ has: summary })

    // Some question types (for example map questions) open the section by
    // default, and clicking it again would close it. Wait for the page to
    // render it before checking.
    await summary.waitFor()
    if (
      (await details.count()) === 1 &&
      (await details.evaluate((el: HTMLDetailsElement) => el.open))
    ) {
      return
    }

    await summary.click()
  }

  async setAnswerLimits(minLength: string, maxLength: string, regex: string) {
    await this.minLengthInput.fill(minLength)
    await this.maxLengthInput.fill(maxLength)
    await this.regexInput.fill(regex)
  }

  /**
   * Fills the minimum, maximum and exact count settings. Checkboxes and map
   * questions label these "items", file upload labels them "file count".
   * Pass undefined to leave a field untouched, or '' to clear it.
   */
  async setCountLimits(
    unit: 'items' | 'files',
    limits: { min?: string; max?: string; exact?: string }
  ) {
    const fields = this.countLimitInputs(unit)

    for (const key of ['min', 'max', 'exact'] as const) {
      const value = limits[key]
      if (value !== undefined) {
        await fields[key].fill(value)
      }
    }
  }

  countLimitInputs(unit: 'items' | 'files') {
    const labels =
      unit === 'items'
        ? {
            min: 'Minimum items (optional)',
            max: 'Maximum items (optional)',
            exact: 'Exact items (optional)'
          }
        : {
            min: 'Minimum file count (optional)',
            max: 'Maximum file count (optional)',
            exact: 'Exact file count (optional)'
          }

    return {
      min: this.page.getByLabel(labels.min, { exact: true }),
      max: this.page.getByLabel(labels.max, { exact: true }),
      exact: this.page.getByLabel(labels.exact, { exact: true })
    }
  }

  async enterDeclarationText(declarationText: string) {
    await this.declarationTextInput.fill(declarationText)
  }

  async setClasses(classes: string) {
    await this.classesInput.fill(classes)
  }

  async clickSaveAndContinue() {
    await this.saveAndContinueButton.click()
  }

  async clickDeleteQuestion() {
    await this.deleteQuestionLink.click()
  }

  async clickPreviewPage() {
    await this.previewPageButton.click()
  }

  async clickPreviewErrorMessages() {
    await this.previewErrorMessagesButton.click()
  }

  async getListItems(): Promise<string[]> {
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

  async addListItems(items: string[]): Promise<void> {
    for (const item of items) {
      await this.addItemButton.click()

      // Wait for the item input to be visible and interactable
      await this.itemTextBox.waitFor({ state: 'visible', timeout: 10000 })

      // Use fill() directly rather than click() then fill() — fill focuses and types reliably
      await this.itemTextBox.fill(item, { timeout: 5000 })

      // Click save and wait for the form to update
      await this.saveItemButton.click()

      await this.waitForNetworkIdle()
    }
  }
}
