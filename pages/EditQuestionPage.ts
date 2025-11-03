import { Page, Locator } from '@playwright/test'

export class EditQuestionPage {
  readonly page: Page

  // Locators for page elements
  readonly pageHeading: Locator
  readonly questionInput: Locator
  readonly hintTextInput: Locator
  readonly optionalCheckbox: Locator
  readonly shortDescriptionInput: Locator
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
    this.pageHeading = page.getByRole('heading', { name: 'Edit question 1' })
    this.questionInput = page.getByRole('textbox', { name: 'Question' })
    this.hintTextInput = page.getByLabel('Hint text (optional)')
    this.optionalCheckbox = page.getByLabel('Make this question optional')
    this.shortDescriptionInput = page.getByLabel('Short description')
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
    this.addItemButton = page.getByRole('button', { name: 'Add item' })
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

  async setAnswerLimits(minLength: string, maxLength: string, regex: string) {
    await this.minLengthInput.fill(minLength)
    await this.maxLengthInput.fill(maxLength)
    await this.regexInput.fill(regex)
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

  // async compareLists(list1: string[], list2: string[]): Promise<boolean> {
  //     if (JSON.stringify(list1) === JSON.stringify(list2)) {
  //         console.log('Both lists have the same items:', list1);
  //         return true;
  //     } else {
  //         console.log('The lists have different items.');
  //         console.log('list1:', list1);
  //         console.log('list2:', list2);
  //         return false;
  //     }
  // }

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
