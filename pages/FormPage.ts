import { Page, Locator } from '@playwright/test'

export class FormPage {
  readonly page: Page

  // Locators
  readonly teamNameInput: Locator
  readonly teamEmailInput: Locator
  readonly saveAndContinueButton: Locator
  readonly saveChangesButton: Locator
  readonly editDraftButton: Locator
  readonly addNewPageButton: Locator
  readonly questionPageRadio: Locator
  readonly writtenAnswerRadio: Locator
  readonly shortAnswerRadio: Locator
  readonly questionInput: Locator
  readonly shortDescriptionInput: Locator
  readonly declarationTextInput: Locator
  readonly addAnotherQuestionButton: Locator
  readonly errorBox: Locator
  readonly formName: Locator
  readonly continueBtn: Locator
  readonly successBanner: Locator
  readonly migrateButton: Locator
  readonly enterEmailAddressLink: Locator
  readonly changeEmailAddressLink: Locator
  readonly changeSupportEmailLink: Locator
  readonly enterPhoneNumberLink: Locator
  readonly changePhoneNumberLink: Locator
  readonly enterEmailAddressForSupportLink: Locator
  readonly enterOnlineContactLinkForSupportLink: Locator
  readonly enterWhatHappensNextLink: Locator
  readonly enterLinkToPrivacyNoticeLink: Locator
  readonly emailAddressForSupportInput: Locator
  readonly supportPhoneInput: Locator
  readonly changeSubmissionGuidance: Locator
  readonly backToAddEditPages: Locator
  readonly changeTeamNameLink: Locator
  readonly pageHeadingAndGuidanceCheckbox: Locator
  readonly checkYourAnswersLink: Locator
  readonly confirmationEmailsLink: Locator

  constructor(page: Page) {
    this.page = page

    // Initialise locators
    this.teamNameInput = page.getByRole('textbox', { name: 'Name of team' })
    this.teamEmailInput = page.getByRole('textbox', {
      name: 'Shared team email address'
    })
    this.saveAndContinueButton = page.getByRole('button', {
      name: 'Save and continue'
    })
    this.saveChangesButton = page.getByRole('button', { name: 'Save changes' })
    this.editDraftButton = page.getByRole('button', { name: 'Edit draft' })
    this.addNewPageButton = page.getByRole('button', { name: 'Add new page' })
    this.questionPageRadio = page.getByRole('radio', { name: 'Question page' })
    this.writtenAnswerRadio = page.getByRole('radio', {
      name: 'Written answer'
    })
    this.shortAnswerRadio = page.getByRole('radio', {
      name: 'Short answer (a single line)'
    })
    this.questionInput = page.locator('#question')
    this.shortDescriptionInput = page.getByRole('textbox', {
      name: 'Short description'
    })
    this.declarationTextInput = page.getByRole('textbox', {
      name: 'Declaration text'
    })
    this.addAnotherQuestionButton = page.getByRole('button', {
      name: 'Add another question'
    })
    this.formName = page.getByRole('textbox', {
      name: 'Enter a name for your form'
    })
    this.continueBtn = page.getByRole('button', { name: 'Continue' })
    this.successBanner = page.getByLabel('Environment Agency')
    this.errorBox = page.getByRole('alert')
    this.migrateButton = page.getByRole('button', {
      name: 'Switch to new editor'
    })
    this.enterEmailAddressLink = page.getByRole('link', {
      name: 'Enter email address',
      exact: true
    })
    this.changeEmailAddressLink = page.getByRole('link', {
      name: /Change.*email address/i
    })
    this.changeSupportEmailLink = page.getByRole('link', {
      name: 'Change   contact email'
    })
    this.enterPhoneNumberLink = page.getByRole('link', {
      name: 'Enter phone number for support',
      exact: true
    })
    this.changePhoneNumberLink = page.getByRole('link', {
      name: /Change.*contact phone/i
    })
    this.enterEmailAddressForSupportLink = page.getByRole('link', {
      name: 'Enter email address for support',
      exact: true
    })
    this.enterWhatHappensNextLink = page.getByRole('link', {
      name: 'Enter what happens next'
    })
    this.changeSubmissionGuidance = page.getByRole('link', {
      name: 'Change submission guidance'
    })
    this.enterLinkToPrivacyNoticeLink = page.getByRole('link', {
      name: 'Enter link to privacy notice'
    })

    this.enterOnlineContactLinkForSupportLink = page.getByRole('link', {
      name: 'Enter online contact link for support',
      exact: true
    })
    this.supportPhoneInput = page.getByRole('textbox', {
      name: 'What’s the phone number and'
    })
    this.backToAddEditPages = page.getByRole('link', {
      name: 'Back to add and edit pages'
    })
    this.emailAddressForSupportInput = page.getByRole('textbox', {
      name: /email address for support/i
    })
    this.changeTeamNameLink = page.getByRole('link', {
      name: 'Change   teamName'
    })

    this.pageHeadingAndGuidanceCheckbox = page.getByRole('checkbox', {
      name: 'Add a page heading'
    })
    this.checkYourAnswersLink = page.locator(
      'a[href$="/check-answers-settings"]'
    )
    // Use explicit regex otherwise may match additional elements on the page
    this.confirmationEmailsLink = page.getByRole('link', {
      name: /Confirmation email/
    })
  }

  async successBannerIsDisplayed() {
    return this.page.locator('text=Changes saved successfully')
  }

  async errorDuplicatePageTitle() {
    return this.page.getByRole('link', { name: 'Question or page heading' })
  }

  async successBannerEmailUpdatedIsDisplayed() {
    return this.page.locator(
      'text=Email address for sending submitted forms has been updated'
    )
  }

  async goTo() {
    await this.page.goto('/create/title')
  }

  async clickMigrate() {
    await this.migrateButton.click()
  }

  async clickBackToAddEditPages() {
    await this.backToAddEditPages.click()
  }

  async selectRadioOption(value: string) {
    const radioOption = this.page.locator(
      `input[type="radio"][value="${value}"]`
    )
    await radioOption.check()
    await this.clickContinueBtn()
  }

  async clickContinueBtn() {
    await this.continueBtn.click()
  }

  async enterFormName(formName: string) {
    await this.formName.fill(formName)
    await this.clickContinueBtn()
  }

  async fillTeamDetails(teamName: string, email: string) {
    await this.teamNameInput.fill(teamName)
    await this.teamEmailInput.fill(email)
    await this.saveAndContinueButton.click()
  }

  async editDraft() {
    await this.editDraftButton.click()
  }

  async goToConditionsPage() {
    await this.page.goto(
      this.page.url().replace('editor-v2/pages', '') + 'editor-v2/conditions'
    )
  }

  /**
   * Constructs the editor-v2 based URL (http(s)://{form-url}/editor-v2/{path})
   */
  constructEditorV2Url(path: string) {
    const url = this.page.url()
    const editorBaseUrl = url.split('/editor-v2')[0]
    return `${editorBaseUrl}/editor-v2/${path}`
  }

  /**
   * Navigates to the editor-v2 based path (http(s)://{form-url}/editor-v2/{path})
   */
  async goToEditorV2Page(path: string) {
    await this.page.goto(this.constructEditorV2Url(path))
  }

  /**
   * Navigates to the pages page (http(s)://{form-url}/editor-v2/pages)
   */
  async goToPages() {
    await this.goToEditorV2Page('pages')
  }

  async addNewQuestionPage(question: string, description: string) {
    await this.writtenAnswerRadio.check()
    await this.shortAnswerRadio.check()
    await this.saveAndContinueButton.click()
    await this.questionInput.fill(question)
    await this.shortDescriptionInput.fill(description)
    await this.saveAndContinueButton.click()
  }

  async createWrittenAnswer(question: string, description: string) {
    await this.questionInput.fill(question)
    await this.shortDescriptionInput.fill(description)
    await this.saveAndContinueButton.click()
  }

  async createFileUpload(question: string, description: string) {
    // Fill the question and description
    await this.questionInput.fill(question)
    await this.shortDescriptionInput.fill(description)

    //select all file types
    await this.page.getByRole('checkbox', { name: 'Documents' }).check()
    await this.page.getByRole('checkbox', { name: 'PDF' }).check()
    await this.page.getByRole('checkbox', { name: 'DOC', exact: true }).check()
    await this.page.getByRole('checkbox', { name: 'DOCX' }).check()
    await this.page.getByRole('checkbox', { name: 'ODT' }).check()
    await this.page.getByRole('checkbox', { name: 'TXT' }).check()

    await this.page.getByRole('checkbox', { name: 'Images' }).check()
    await this.page.getByRole('checkbox', { name: 'JPG' }).check()
    await this.page.getByRole('checkbox', { name: 'PNG' }).check()

    await this.page.getByRole('checkbox', { name: 'Tabular data' }).check()
    await this.page.getByRole('checkbox', { name: 'XLS', exact: true }).check()
    await this.page.getByRole('checkbox', { name: 'XLSX' }).check()
    await this.page.getByRole('checkbox', { name: 'CSV' }).check()
    await this.page.getByRole('checkbox', { name: 'ODS' }).check()

    // Click Save and Continue
    await this.saveAndContinueButton.click()
  }

  async addAnotherQuestion() {
    await this.addAnotherQuestionButton.click()
  }

  async checkErrorIsDisplayed() {
    await this.errorBox.isVisible()
    await this.errorBox.highlight()
  }

  async previewForm() {
    throw new Error('Method not implemented.')
  }

  async getErrorMessage(): Promise<string> {
    await this.errorBox.isVisible()
    return (await this.errorBox.textContent()) ?? ''
  }

  async clickChangeTeamNameLink() {
    await this.changeTeamNameLink.click()
  }

  async setPageHeading(headingText: string) {
    await this.pageHeadingAndGuidanceCheckbox.check()
    await this.saveChangesButton.click()
  }
}
