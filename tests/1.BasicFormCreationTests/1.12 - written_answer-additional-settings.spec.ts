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

const test = baseTest.extend<MyFixtures>({
  formPage: async ({ page }, use) => {
    const formPage = new FormPage(page)
    await formPage.goTo()
    const formName =
      'Automated test - Playwright form ' +
      Math.random().toString().substring(0, 10)
    await formPage.enterFormName(formName)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')
    await formPage.editDraft()
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
  editQuestionPage,
  page
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
  await editQuestionPage.setAnswerLimits('50', '500', '^[A-Za-z0-9\s\.,-]+$')
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
  editQuestionPage,
  page
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
