import { test as baseTest, expect } from '~/fixtures/main.js'
import { FormPage } from '~/pages/FormPage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { SelectQuestionTypePage } from '~/pages/SelectQuestionTypePage.js'
import { PageOverview } from '~/pages/PageOverview.js'
import { EditQuestionPage } from '~/pages/EditQuestionPage.js'
import { QuestionNumberRangeFields } from '~/pages/QuestionNumberRangeFields.js'
import { createDraftForm } from '~/tests/utils/createDraftForm.js'

type MyFixtures = {
  formPage: FormPage
  selectPageTypePage: SelectPageTypePage
  selectQuestionTypePage: SelectQuestionTypePage
  pageOverview: PageOverview
  editQuestionPage: EditQuestionPage
  numberFields: QuestionNumberRangeFields
}

const NUMBER_QUESTION = 'How many sites do you manage?'

const test = baseTest.extend<MyFixtures>({
  formPage: async ({ page }, use, testInfo) => {
    const { formPage } = await createDraftForm(page, testInfo)
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
  },

  // Adds a Numbers only question and leaves its additional settings open.
  numberFields: async (
    {
      formPage,
      selectPageTypePage,
      selectQuestionTypePage,
      pageOverview,
      editQuestionPage
    },
    use
  ) => {
    await formPage.addNewPageButton.click()
    await selectPageTypePage.choosePageType('question')
    await selectQuestionTypePage.selectQuestionType('writtenAnswer')
    await selectQuestionTypePage.selectSubtype('numbersOnly')
    await selectQuestionTypePage.clickSaveAndContinue()
    await formPage.createWrittenAnswer(NUMBER_QUESTION, 'number of sites')
    await pageOverview.verifySuccessBanner('Changes saved successfully')
    await pageOverview.clickChangeLinkForQuestionByName(NUMBER_QUESTION)
    await editQuestionPage.expandAdditionalSettings()

    await use(editQuestionPage.numberRange)
  }
})

async function saveAndReopenNumberQuestion(
  pageOverview: PageOverview,
  editQuestionPage: EditQuestionPage
) {
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')
  await pageOverview.clickChangeLinkForQuestionByName(NUMBER_QUESTION)
  await editQuestionPage.expandAdditionalSettings()
}

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
  await editQuestionPage.answerLimits.setLimits('5', '10', '^[A-Z0-9-]+$')
  await editQuestionPage.answerLimits.setClasses('govuk-input--width-10')

  // Save and verify success
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  // Re-open and verify values persisted
  await pageOverview.clickChangeLinkForQuestionByName(
    'What is your license number?'
  )
  await editQuestionPage.expandAdditionalSettings()

  await expect(editQuestionPage.answerLimits.minLengthInput).toHaveValue('5')
  await expect(editQuestionPage.answerLimits.maxLengthInput).toHaveValue('10')
  await expect(editQuestionPage.answerLimits.regexInput).toHaveValue(
    '^[A-Z0-9-]+$'
  )
  await expect(editQuestionPage.answerLimits.classesInput).toHaveValue(
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
  await editQuestionPage.answerLimits.setLimits('3', '6', '')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  // Re-open and verify persisted field values (do not rely on the preview)
  await pageOverview.clickChangeLinkForQuestionByName('Enter your code')
  await editQuestionPage.expandAdditionalSettings()

  await expect(editQuestionPage.answerLimits.minLengthInput).toHaveValue('3')
  await expect(editQuestionPage.answerLimits.maxLengthInput).toHaveValue('6')
  await expect(editQuestionPage.answerLimits.regexInput).toHaveValue('')
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
  await editQuestionPage.answerLimits.setLimits('2', '4', '^[0-9]{2,4}$')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  // Re-open and verify values persisted
  await pageOverview.clickChangeLinkForQuestionByName('Enter your code regex')
  await editQuestionPage.expandAdditionalSettings()

  await expect(editQuestionPage.answerLimits.minLengthInput).toHaveValue('2')
  await expect(editQuestionPage.answerLimits.maxLengthInput).toHaveValue('4')
  await expect(editQuestionPage.answerLimits.regexInput).toHaveValue(
    '^[0-9]{2,4}$'
  )
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
  await editQuestionPage.answerLimits.setLimits('50', '500', '^[A-Za-z0-9,-]+$')
  await editQuestionPage.answerLimits.setClasses('govuk-textarea--large')

  // Save and verify success
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  // Re-open and verify values persisted
  await pageOverview.clickChangeLinkForQuestionByName(
    'Describe your experience'
  )
  await editQuestionPage.expandAdditionalSettings()

  await expect(editQuestionPage.answerLimits.minLengthInput).toHaveValue('50')
  await expect(editQuestionPage.answerLimits.maxLengthInput).toHaveValue('500')
  const regexValue = await editQuestionPage.answerLimits.regexInput.inputValue()
  await expect(regexValue).toContain('A-Za-z0-9')
  await expect(editQuestionPage.answerLimits.classesInput).toHaveValue(
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
  await editQuestionPage.answerLimits.setLimits('20', '200', '')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  // Re-open and and check values persisted
  await pageOverview.clickChangeLinkForQuestionByName(
    'Tell us about your project'
  )
  await expect(editQuestionPage.answerLimits.minLengthInput).toHaveValue('20')
})

test('1.12e - numbers only lowest and highest number persist', async ({
  numberFields,
  pageOverview,
  editQuestionPage
}) => {
  await numberFields.setLowestNumber('10')
  await numberFields.setHighestNumber('15')

  await saveAndReopenNumberQuestion(pageOverview, editQuestionPage)

  await expect(numberFields.lowestNumberInput).toHaveValue('10')
  await expect(numberFields.highestNumberInput).toHaveValue('15')
})

test('1.12f - numbers only does not offer character length or regex settings', async ({
  numberFields,
  editQuestionPage
}) => {
  await expect(numberFields.lowestNumberInput).toBeVisible()
  await expect(editQuestionPage.answerLimits.minLengthInput).toBeHidden()
  await expect(editQuestionPage.answerLimits.maxLengthInput).toBeHidden()
  await expect(editQuestionPage.answerLimits.regexInput).toBeHidden()
})

test('1.12g - numbers only precision, prefix, suffix and classes persist', async ({
  numberFields,
  pageOverview,
  editQuestionPage
}) => {
  await numberFields.setPrecision('2')
  await numberFields.setPrefix('£')
  await numberFields.setSuffix('per item')
  await editQuestionPage.answerLimits.setClasses('govuk-input--width-10')

  await saveAndReopenNumberQuestion(pageOverview, editQuestionPage)

  await expect(numberFields.precisionInput).toHaveValue('2')
  await expect(numberFields.prefixInput).toHaveValue('£')
  await expect(numberFields.suffixInput).toHaveValue('per item')
  await expect(editQuestionPage.answerLimits.classesInput).toHaveValue(
    'govuk-input--width-10'
  )
})

test('1.12h - numbers only accepts negative and zero limits', async ({
  numberFields,
  pageOverview,
  editQuestionPage
}) => {
  await numberFields.setLowestNumber('-10')
  await numberFields.setHighestNumber('0')

  await saveAndReopenNumberQuestion(pageOverview, editQuestionPage)

  await expect(numberFields.lowestNumberInput).toHaveValue('-10')
  await expect(numberFields.highestNumberInput).toHaveValue('0')
})

test('1.12i - numbers only accepts a lowest number equal to the highest', async ({
  numberFields,
  pageOverview,
  editQuestionPage
}) => {
  await numberFields.setLowestNumber('6')
  await numberFields.setHighestNumber('6')

  await saveAndReopenNumberQuestion(pageOverview, editQuestionPage)

  await expect(numberFields.lowestNumberInput).toHaveValue('6')
  await expect(numberFields.highestNumberInput).toHaveValue('6')
})

test('1.12j - numbers only lowest number can be set without a highest', async ({
  numberFields,
  pageOverview,
  editQuestionPage
}) => {
  await numberFields.setLowestNumber('2')

  await saveAndReopenNumberQuestion(pageOverview, editQuestionPage)

  await expect(numberFields.lowestNumberInput).toHaveValue('2')
  await expect(numberFields.highestNumberInput).toHaveValue('')
})

test('1.12k - numbers only highest number can be set without a lowest', async ({
  numberFields,
  pageOverview,
  editQuestionPage
}) => {
  await numberFields.setHighestNumber('10')

  await saveAndReopenNumberQuestion(pageOverview, editQuestionPage)

  await expect(numberFields.lowestNumberInput).toHaveValue('')
  await expect(numberFields.highestNumberInput).toHaveValue('10')
})

test('1.12l - numbers only limits persist on an optional question', async ({
  numberFields,
  pageOverview,
  editQuestionPage
}) => {
  await editQuestionPage.setOptionalCheckbox(true)
  await numberFields.setLowestNumber('4')
  await numberFields.setHighestNumber('12')

  await saveAndReopenNumberQuestion(pageOverview, editQuestionPage)

  await expect(editQuestionPage.optionalCheckbox).toBeChecked()
  await expect(numberFields.lowestNumberInput).toHaveValue('4')
  await expect(numberFields.highestNumberInput).toHaveValue('12')
})

test('1.12m - numbers only additional settings can be cleared', async ({
  numberFields,
  pageOverview,
  editQuestionPage
}) => {
  await numberFields.setLowestNumber('3')
  await numberFields.setHighestNumber('9')
  await numberFields.setPrecision('1')
  await numberFields.setPrefix('£')
  await numberFields.setSuffix('Kg')
  await saveAndReopenNumberQuestion(pageOverview, editQuestionPage)

  await numberFields.setLowestNumber('')
  await numberFields.setHighestNumber('')
  await numberFields.setPrecision('')
  await numberFields.setPrefix('')
  await numberFields.setSuffix('')
  await saveAndReopenNumberQuestion(pageOverview, editQuestionPage)

  await expect(numberFields.lowestNumberInput).toHaveValue('')
  await expect(numberFields.highestNumberInput).toHaveValue('')
  await expect(numberFields.precisionInput).toHaveValue('')
  await expect(numberFields.prefixInput).toHaveValue('')
  await expect(numberFields.suffixInput).toHaveValue('')
})

test('1.12n - numbers only rejects a lowest number above the highest', async ({
  numberFields,
  editQuestionPage
}) => {
  await numberFields.setLowestNumber('10')
  await numberFields.setHighestNumber('5')
  await editQuestionPage.clickSaveAndContinue()

  await expect(editQuestionPage.errorSummary).toContainText(
    'Lowest number cannot be more than the highest number'
  )
})

test('1.12o - numbers only rejects limits that are not whole numbers', async ({
  numberFields,
  editQuestionPage
}) => {
  await numberFields.setLowestNumber('1.5')
  await numberFields.setHighestNumber('2.5')
  await editQuestionPage.clickSaveAndContinue()

  await expect(editQuestionPage.errorSummary).toContainText(
    'Lowest number must be a whole number'
  )
  await expect(editQuestionPage.errorSummary).toContainText(
    'Highest number must be a whole number'
  )
})

test('1.12p - numbers only rejects precision above the maximum', async ({
  numberFields,
  editQuestionPage
}) => {
  await numberFields.setPrecision('6')
  await editQuestionPage.clickSaveAndContinue()

  await expect(editQuestionPage.errorSummary).toContainText(
    'Enter a whole number between 0 and 5'
  )
})
