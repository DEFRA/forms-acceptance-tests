import { Page, Locator } from '@playwright/test'
import { BasePage } from '~/pages/BasePage.js'
import { QuestionAnswerLimitsFields } from '~/pages/QuestionAnswerLimitsFields.js'
import { QuestionNumberRangeFields } from '~/pages/QuestionNumberRangeFields.js'
import { QuestionDateRangeFields } from '~/pages/QuestionDateRangeFields.js'
import { QuestionListFields } from '~/pages/QuestionListFields.js'
import { raceAgainstAccessDenied } from '~/tests/utils/raceAgainstAccessDenied.js'

export class EditQuestionPage extends BasePage {
  // Field sections for question-type-specific controls
  readonly answerLimits: QuestionAnswerLimitsFields
  readonly numberRange: QuestionNumberRangeFields
  readonly dateRange: QuestionDateRangeFields
  readonly listFields: QuestionListFields

  // Locators for elements common to every question type
  readonly pageHeading: Locator
  readonly questionInput: Locator
  readonly hintTextInput: Locator
  readonly optionalCheckbox: Locator
  readonly giveInstructionsCheckbox: Locator
  readonly sssiCheckbox: Locator
  readonly shortDescriptionInput: Locator
  readonly declarationTextInput: Locator

  readonly saveAndContinueButton: Locator
  readonly deleteQuestionLink: Locator
  readonly previewPageButton: Locator
  readonly previewErrorMessagesButton: Locator
  readonly advancedFeaturesLink: Locator
  readonly uniqueIdentifierInput: Locator
  readonly cancelLink: Locator
  readonly reorderLink: Locator
  readonly doneLink: Locator
  readonly pagePreviewLabel: Locator
  readonly questionText: Locator
  readonly errorSummary: Locator

  constructor(page: Page) {
    super(page)

    this.answerLimits = new QuestionAnswerLimitsFields(page)
    this.numberRange = new QuestionNumberRangeFields(page)
    this.dateRange = new QuestionDateRangeFields(page)
    this.listFields = new QuestionListFields(page)

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
    this.advancedFeaturesLink = page.getByText('Advanced features')
    this.uniqueIdentifierInput = page.getByRole('textbox', {
      name: 'Unique identifier (optional)'
    })
    this.cancelLink = page.getByRole('link', { name: 'Cancel' })
    this.reorderLink = page.getByRole('link', { name: 'Re-order' })
    this.doneLink = page.getByRole('link', { name: 'Done' })
    this.pagePreviewLabel = page.getByLabel('Page preview')
    this.questionText = page.getByText('Question')
    // data-module excludes the example error summary in the preview panel
    this.errorSummary = page.locator(
      '.govuk-error-summary[data-module="govuk-error-summary"]'
    )
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
    const summary = this.page.locator('summary', {
      hasText: 'Additional settings (optional)'
    })
    const details = this.page.locator('details').filter({ has: summary })

    // The section is already open once settings have been saved, and clicking
    // it then would close it.
    await raceAgainstAccessDenied(this.page, async () => {
      if ((await details.getAttribute('open')) === null) {
        await summary.click()
      }
    })
  }

  async enterDeclarationText(declarationText: string) {
    await this.declarationTextInput.fill(declarationText)
  }

  async clickSaveAndContinue() {
    await raceAgainstAccessDenied(this.page, () =>
      this.saveAndContinueButton.click()
    )
  }

  async clickDeleteQuestion() {
    await raceAgainstAccessDenied(this.page, () =>
      this.deleteQuestionLink.click()
    )
  }

  async clickPreviewPage() {
    await raceAgainstAccessDenied(this.page, () =>
      this.previewPageButton.click()
    )
  }

  async clickPreviewErrorMessages() {
    await raceAgainstAccessDenied(this.page, () =>
      this.previewErrorMessagesButton.click()
    )
  }
}
