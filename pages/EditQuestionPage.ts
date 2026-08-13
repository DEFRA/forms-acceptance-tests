import { Page, Locator, expect } from '@playwright/test'

export class EditQuestionPage {
  readonly page: Page

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
    this.page = page

    // Initialize locators using ARIA attributes
    this.pageHeading = page.getByRole('heading', {
      name: /Edit page \d+: question \d+/
    })
    this.questionInput = page.locator('input#question')
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
    // Fail fast if the page has been closed
    if (this.page.isClosed && this.page.isClosed()) {
      throw new Error('Cannot manipulate SSSI checkbox: page is already closed')
    }

    // Prefer the stable id for the checkbox (unique and deterministic)
    const sssi = this.page.locator('input#mapLayers')

    // If not visible, try to reveal the Additional settings panel.
    // Use the explicit affordance that the app exposes (toggle button or heading).
    if (!(await sssi.isVisible())) {
      const editorSection = this.page.locator('section:has(input#question)')
      const toggle = editorSection.getByRole('button', {
        name: /Additional settings/i
      })
      if ((await toggle.count()) > 0) {
        const expanded =
          (await toggle.first().getAttribute('aria-expanded')) === 'true'
        if (!expanded) await toggle.first().click()
      } else {
        const heading = editorSection.getByText(
          'Additional settings (optional)'
        )
        if ((await heading.count()) > 0)
          await heading
            .first()
            .click()
            .catch(() => {})
      }
    }

    const attachedTimeout = 10000
    await sssi
      .waitFor({ state: 'attached', timeout: attachedTimeout })
      .catch(() => {
        throw new Error(
          `SSSI checkbox (input#mapLayers) not attached after ${attachedTimeout}ms`
        )
      })
    await sssi.scrollIntoViewIfNeeded()
    await sssi
      .waitFor({ state: 'visible', timeout: attachedTimeout })
      .catch(() => {
        throw new Error(
          `SSSI checkbox (input#mapLayers) not visible after ${attachedTimeout}ms`
        )
      })

    // Interact
    if (isChecked) {
      await sssi.check()
    } else {
      await sssi.uncheck()
    }
  }

  async expectSssiCheckboxChecked(isChecked: boolean) {
    if (isChecked) {
      await expect(this.sssiCheckbox).toBeChecked()
    } else {
      await expect(this.sssiCheckbox).not.toBeChecked()
    }
  }

  async ensureLocationFormatIsNationalGrid() {
    // If the page already shows the selected type, do nothing.
    if (
      (await this.page
        .getByText('Location: National Grid field number', { exact: false })
        .count()) > 0
    ) {
      const visible = await this.page
        .getByText('Location: National Grid field number', { exact: false })
        .isVisible()
      if (visible) return
    }

    // Open the change-type UI and select National Grid location type, then save.
    const changeLink = this.page.getByRole('link', {
      name: /Change type of question/i
    })
    if ((await changeLink.count()) === 0) {
      throw new Error('Change type link not found on Edit question page')
    }

    // Click the Change link — allow a short pause for either a panel open or navigation
    await changeLink.first().click()

    // Wait for the radio option to appear (longer timeout to allow navigation/panel animation)
    const nationalRadio = this.page.getByRole('radio', {
      name: 'Location: National Grid field number'
    })
    const radioTimeout = 10000
    await nationalRadio
      .waitFor({ state: 'visible', timeout: radioTimeout })
      .catch(() => {
        throw new Error(
          `National Grid radio not visible after ${radioTimeout}ms - change panel may not have opened or page did not navigate as expected`
        )
      })
    await nationalRadio.check()

    // Save changes
    const saveButton = this.page.getByRole('button', {
      name: /Save( and continue)?/i
    })
    if ((await saveButton.count()) === 0) {
      throw new Error('Save button not found after selecting location type')
    }
    await saveButton.first().click()

    // Wait for the page to update to the selected location type
    const waitTimeout = 5000
    await this.page
      .getByText('Location: National Grid field number', { exact: false })
      .waitFor({ state: 'visible', timeout: waitTimeout })
      .catch(() => {
        throw new Error(
          `Page did not update to National Grid location type within ${waitTimeout}ms`
        )
      })
  }

  async expandAdditionalSettings() {
    await this.page.getByText('Additional settings (optional)').click()
  }

  async setAnswerLimits(minLength: string, maxLength: string, regex: string) {
    await this.minLengthInput.fill(minLength)
    await this.maxLengthInput.fill(maxLength)
    await this.regexInput.fill(regex)
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
      await this.itemTextBox.click()
      await this.itemTextBox.fill(item)

      // Click save and wait for the form to update
      await this.saveItemButton.click()

      // Wait for the item to be saved - wait for the item text box to be cleared or add item button to be visible again
      await this.page.waitForTimeout(2000)
      // Wait for network to be idle to ensure the item is fully saved
      await this.page
        .waitForLoadState('networkidle', { timeout: 5000 })
        .catch(() => {
          // If networkidle times out, continue anyway
        })
    }
  }

  // async addFruitListItems() {
  //     const fruits = ['apple', 'banana', 'grapes'];
  //     await this.addListItems(fruits);
  // }
}
