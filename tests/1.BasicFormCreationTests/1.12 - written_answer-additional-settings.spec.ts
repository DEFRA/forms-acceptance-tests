import { test as baseTest, expect } from '@playwright/test'
import { FormPage } from '~/pages/FormPage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { SelectQuestionTypePage } from '~/pages/SelectQuestionTypePage.js'
import { PageOverview } from '~/pages/PageOverview.js'
import { EditQuestionPage } from '~/pages/EditQuestionPage.js'

type MyFixtures = {
  formPage: FormPage
  selectPageTypePage: SelectPageTypePage
  selectQuestionTypePage: SelectQuestionTypePage
  pageOverview: PageOverview
  editQuestionPage: EditQuestionPage
}

let sharedFormUrl: string

const test = baseTest.extend<MyFixtures>({
  formPage: async ({ page }, use) => {
    const formPage = new FormPage(page)
    if (sharedFormUrl) {
      await page.goto(sharedFormUrl)
    }
    await use(formPage)
  },

  selectPageTypePage: async ({ page }, use) => {
    const selectPageTypePage = new SelectPageTypePage(page)
    await use(selectPageTypePage)
  },

  selectQuestionTypePage: async ({ page }, use) => {
    const selectQuestionTypePage = new SelectQuestionTypePage(page)
    await use(selectQuestionTypePage)
  },

  pageOverview: async ({ page }, use) => {
    const pageOverview = new PageOverview(page)
    await use(pageOverview)
  },

  editQuestionPage: async ({ page }, use) => {
    const editQuestionPage = new EditQuestionPage(page)
    await use(editQuestionPage)
  }
})

async function addNumbersOnlyQuestion(
  formPage: FormPage,
  selectPageTypePage: SelectPageTypePage,
  selectQuestionTypePage: SelectQuestionTypePage,
  pageOverview: PageOverview,
  question: string,
  shortDescription: string
) {
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('writtenAnswer')
  await selectQuestionTypePage.selectSubtype('numbersOnly')
  await selectQuestionTypePage.clickSaveAndContinue()
  await formPage.createWrittenAnswer(question, shortDescription)
  await pageOverview.verifySuccessBanner('Changes saved successfully')
}

async function openAdditionalSettings(
  pageOverview: PageOverview,
  editQuestionPage: EditQuestionPage,
  question: string
) {
  await pageOverview.clickChangeLinkForQuestionByName(question)
  await editQuestionPage.expandAdditionalSettings()
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()

  const formPage = new FormPage(page)
  await formPage.goTo()
  const formName =
    'Automated test - Playwright form ' +
    Math.random().toString().substring(0, 10)
  await formPage.enterFormName(formName)
  await formPage.selectRadioOption('Environment Agency')
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')
  await formPage.editDraft()

  sharedFormUrl = page.url()
  await context.close()
})

test('1.12 - short answer additional settings persist (min/max/regex/classes)', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  // Add a new page and choose short answer
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('writtenAnswer')
  await selectQuestionTypePage.selectSubtype('shortAnswer')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Create the question
  await formPage.createWrittenAnswer(
    'What is your license number?',
    'license number'
  )
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  // Open the edit panel for the question
  await pageOverview.clickChangeLinkForQuestionByName(
    'What is your license number?'
  )

  // Expand additional settings and set constraints
  await editQuestionPage.expandAdditionalSettings()
  await editQuestionPage.setAnswerLimits('5', '10', '^[A-Z0-9-]+$')
  await editQuestionPage.setClasses('govuk-input--width-10')

  // Save and verify success
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  // Re-open and verify values persisted
  await pageOverview.clickChangeLinkForQuestionByName(
    'What is your license number?'
  )
  await editQuestionPage.expandAdditionalSettings()

  await expect(editQuestionPage.minLengthInput).toHaveValue('5')
  await expect(editQuestionPage.maxLengthInput).toHaveValue('10')
  await expect(editQuestionPage.regexInput).toHaveValue('^[A-Z0-9-]+$')
  await expect(editQuestionPage.classesInput).toHaveValue(
    'govuk-input--width-10'
  )
})

test('1.12a - short answer preview shows answer-limits section and error messages', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  // Add a new short answer question
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('writtenAnswer')
  await selectQuestionTypePage.selectSubtype('shortAnswer')
  await selectQuestionTypePage.clickSaveAndContinue()

  await formPage.createWrittenAnswer('Enter your code', 'code')
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await pageOverview.clickChangeLinkForQuestionByName('Enter your code')
  await editQuestionPage.expandAdditionalSettings()

  // set answer limits
  await editQuestionPage.setAnswerLimits('3', '6', '')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  // Re-open and verify persisted field values (do not rely on the preview)
  await pageOverview.clickChangeLinkForQuestionByName('Enter your code')
  await editQuestionPage.expandAdditionalSettings()

  await expect(editQuestionPage.minLengthInput).toHaveValue('3')
  await expect(editQuestionPage.maxLengthInput).toHaveValue('6')
  await expect(editQuestionPage.regexInput).toHaveValue('')
})

// Additional short-answer test with regex
test('1.12d - short answer additional settings persist including regex', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  // Add a new short answer question
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('writtenAnswer')
  await selectQuestionTypePage.selectSubtype('shortAnswer')
  await selectQuestionTypePage.clickSaveAndContinue()

  await formPage.createWrittenAnswer('Enter your code regex', 'code-regex')
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await pageOverview.clickChangeLinkForQuestionByName('Enter your code regex')
  await editQuestionPage.expandAdditionalSettings()

  // set answer limits including a regex
  await editQuestionPage.setAnswerLimits('2', '4', '^[0-9]{2,4}$')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  // Re-open and verify values persisted
  await pageOverview.clickChangeLinkForQuestionByName('Enter your code regex')
  await editQuestionPage.expandAdditionalSettings()

  await expect(editQuestionPage.minLengthInput).toHaveValue('2')
  await expect(editQuestionPage.maxLengthInput).toHaveValue('4')
  await expect(editQuestionPage.regexInput).toHaveValue('^[0-9]{2,4}$')
})

// Long answer tests
test('1.12b - long answer additional settings persist (min/max/regex/classes)', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  // Add a new page and choose long answer
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('writtenAnswer')
  await selectQuestionTypePage.selectSubtype('longAnswer')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Create the question
  await formPage.createWrittenAnswer('Describe your experience', 'experience')
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  // Open the edit panel for the question
  await pageOverview.clickChangeLinkForQuestionByName(
    'Describe your experience'
  )

  // Expand additional settings and set constraints
  await editQuestionPage.expandAdditionalSettings()
  await editQuestionPage.setAnswerLimits('50', '500', '^[A-Za-z0-9,-]+$')
  await editQuestionPage.setClasses('govuk-textarea--large')

  // Save and verify success
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  // Re-open and verify values persisted
  await pageOverview.clickChangeLinkForQuestionByName(
    'Describe your experience'
  )
  await editQuestionPage.expandAdditionalSettings()

  await expect(editQuestionPage.minLengthInput).toHaveValue('50')
  await expect(editQuestionPage.maxLengthInput).toHaveValue('500')
  const regexValue = await editQuestionPage.regexInput.inputValue()
  await expect(regexValue).toContain('A-Za-z0-9')
  await expect(editQuestionPage.classesInput).toHaveValue(
    'govuk-textarea--large'
  )
})

test('1.12c - long answer preview shows answer-limits section and error messages', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  // Add a new long answer question
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('writtenAnswer')
  await selectQuestionTypePage.selectSubtype('longAnswer')
  await selectQuestionTypePage.clickSaveAndContinue()

  await formPage.createWrittenAnswer('Tell us about your project', 'project')
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await pageOverview.clickChangeLinkForQuestionByName(
    'Tell us about your project'
  )
  await editQuestionPage.expandAdditionalSettings()

  // set answer limits
  await editQuestionPage.setAnswerLimits('20', '200', '')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  // Re-open and and check values persisted
  await pageOverview.clickChangeLinkForQuestionByName(
    'Tell us about your project'
  )
  await expect(editQuestionPage.minLengthInput).toHaveValue('20')
})

test('1.12e - numbers only additional settings persist (min/max)', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await addNumbersOnlyQuestion(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    pageOverview,
    'What is your phone number?',
    'phone number'
  )

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'What is your phone number?'
  )
  await expect(editQuestionPage.regexInput).toBeHidden()

  await editQuestionPage.setAnswerLimits('10', '15')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'What is your phone number?'
  )
  await expect(editQuestionPage.minLengthInput).toHaveValue('10')
  await expect(editQuestionPage.maxLengthInput).toHaveValue('15')
})

test('1.12f - numbers only CSS classes persist', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await addNumbersOnlyQuestion(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    pageOverview,
    'Enter your reference number',
    'reference number'
  )

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Enter your reference number'
  )
  await editQuestionPage.setClasses('govuk-input--width-10')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Enter your reference number'
  )
  await expect(editQuestionPage.classesInput).toHaveValue(
    'govuk-input--width-10'
  )
})

test('1.12g - numbers only preview shows answer limits', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await addNumbersOnlyQuestion(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    pageOverview,
    'Enter your account number',
    'account number'
  )

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Enter your account number'
  )
  await editQuestionPage.setAnswerLimits('6', '8')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Enter your account number'
  )
  await expect(editQuestionPage.minLengthInput).toHaveValue('6')
  await expect(editQuestionPage.maxLengthInput).toHaveValue('8')
  await expect(editQuestionPage.previewPageButton).toBeVisible()

  await editQuestionPage.clickPreviewPage()
  await expect(editQuestionPage.pagePreviewLabel).toBeVisible()
})

test('1.12h - numbers only combined additional settings persist', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await addNumbersOnlyQuestion(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    pageOverview,
    'Enter your sort code',
    'sort code'
  )

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Enter your sort code'
  )
  await editQuestionPage.setAnswerLimits('6', '6')
  await editQuestionPage.setClasses('govuk-input--width-5')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Enter your sort code'
  )
  await expect(editQuestionPage.minLengthInput).toHaveValue('6')
  await expect(editQuestionPage.maxLengthInput).toHaveValue('6')
  await expect(editQuestionPage.classesInput).toHaveValue(
    'govuk-input--width-5'
  )
})

test('1.12i - numbers only accepts a zero minimum length', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await addNumbersOnlyQuestion(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    pageOverview,
    'Enter an optional numeric code',
    'optional numeric code'
  )

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Enter an optional numeric code'
  )
  await editQuestionPage.setAnswerLimits('0', '10')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Enter an optional numeric code'
  )
  await expect(editQuestionPage.minLengthInput).toHaveValue('0')
  await expect(editQuestionPage.maxLengthInput).toHaveValue('10')
})

test('1.12j - numbers only accepts a large min and max range', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await addNumbersOnlyQuestion(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    pageOverview,
    'Enter a large numeric identifier',
    'large numeric identifier'
  )

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Enter a large numeric identifier'
  )
  await editQuestionPage.setAnswerLimits('1', '9999')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Enter a large numeric identifier'
  )
  await expect(editQuestionPage.minLengthInput).toHaveValue('1')
  await expect(editQuestionPage.maxLengthInput).toHaveValue('9999')
})

test('1.12k - numbers only min and max persist with optional flag', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await addNumbersOnlyQuestion(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    pageOverview,
    'Enter your employee number if known',
    'employee number'
  )

  await pageOverview.clickChangeLinkForQuestionByName(
    'Enter your employee number if known'
  )
  await editQuestionPage.setOptionalCheckbox(true)
  await editQuestionPage.expandAdditionalSettings()
  await editQuestionPage.setAnswerLimits('4', '12')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await pageOverview.clickChangeLinkForQuestionByName(
    'Enter your employee number if known'
  )
  await expect(editQuestionPage.optionalCheckbox).toBeChecked()
  await editQuestionPage.expandAdditionalSettings()
  await expect(editQuestionPage.minLengthInput).toHaveValue('4')
  await expect(editQuestionPage.maxLengthInput).toHaveValue('12')
})

test('1.12l - numbers only additional settings can be cleared', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await addNumbersOnlyQuestion(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    pageOverview,
    'Enter a temporary numeric token',
    'temporary numeric token'
  )

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Enter a temporary numeric token'
  )
  await editQuestionPage.setAnswerLimits('3', '9')
  await editQuestionPage.setClasses('govuk-input--width-10')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Enter a temporary numeric token'
  )
  await editQuestionPage.setAnswerLimits('', '')
  await editQuestionPage.setClasses('')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Enter a temporary numeric token'
  )
  await expect(editQuestionPage.minLengthInput).toHaveValue('')
  await expect(editQuestionPage.maxLengthInput).toHaveValue('')
  await expect(editQuestionPage.classesInput).toHaveValue('')
})

test('1.12m - numbers only min and max persist with hint text', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await addNumbersOnlyQuestion(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    pageOverview,
    'Enter your National Insurance number digits',
    'ni number digits'
  )

  await pageOverview.clickChangeLinkForQuestionByName(
    'Enter your National Insurance number digits'
  )
  await editQuestionPage.hintTextInput.fill('Enter digits only, with no spaces')
  await editQuestionPage.expandAdditionalSettings()
  await editQuestionPage.setAnswerLimits('9', '9')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await pageOverview.clickChangeLinkForQuestionByName(
    'Enter your National Insurance number digits'
  )
  await expect(editQuestionPage.hintTextInput).toHaveValue(
    'Enter digits only, with no spaces'
  )
  await editQuestionPage.expandAdditionalSettings()
  await expect(editQuestionPage.minLengthInput).toHaveValue('9')
  await expect(editQuestionPage.maxLengthInput).toHaveValue('9')
})

test('1.12n - numbers only error preview is available with answer limits', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await addNumbersOnlyQuestion(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    pageOverview,
    'Enter your PIN',
    'pin'
  )

  await openAdditionalSettings(pageOverview, editQuestionPage, 'Enter your PIN')
  await editQuestionPage.setAnswerLimits('4', '6')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await openAdditionalSettings(pageOverview, editQuestionPage, 'Enter your PIN')
  await expect(editQuestionPage.minLengthInput).toHaveValue('4')
  await expect(editQuestionPage.maxLengthInput).toHaveValue('6')
  await expect(editQuestionPage.previewErrorMessagesButton).toBeVisible()

  await editQuestionPage.clickPreviewErrorMessages()
  await expect(editQuestionPage.pagePreviewLabel).toBeVisible()
})

test('1.12o - numbers only minimum length can be set without a maximum', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await addNumbersOnlyQuestion(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    pageOverview,
    'Minimum ID digits',
    'minimum id digits'
  )

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Minimum ID digits'
  )
  await editQuestionPage.setAnswerLimits('2', '')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Minimum ID digits'
  )
  await expect(editQuestionPage.minLengthInput).toHaveValue('2')
  await expect(editQuestionPage.maxLengthInput).toHaveValue('')
})

test('1.12p - numbers only maximum length can be set without a minimum', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await addNumbersOnlyQuestion(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    pageOverview,
    'Maximum characters allowed',
    'maximum characters allowed'
  )

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Maximum characters allowed'
  )
  await editQuestionPage.setAnswerLimits('', '10')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await openAdditionalSettings(
    pageOverview,
    editQuestionPage,
    'Maximum characters allowed'
  )
  await expect(editQuestionPage.minLengthInput).toHaveValue('')
  await expect(editQuestionPage.maxLengthInput).toHaveValue('10')
})
