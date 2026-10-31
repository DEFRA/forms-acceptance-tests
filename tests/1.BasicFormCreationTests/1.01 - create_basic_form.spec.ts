import { expect, test } from '@playwright/test'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { createDraftForm } from '~/tests/utils/createDraftForm.js'

test('1.1.1 - should create a new form with short answer field', async ({
  page
}, testInfo) => {
  // create a form
  const { formPage } = await createDraftForm(page, testInfo)
  const selectPageTypePage = new SelectPageTypePage(page)

  // Add a new question page

  await formPage.addNewPageButton.click()
  await selectPageTypePage.verifyPageStructure()
  await selectPageTypePage.choosePageType('question')
  await formPage.addNewQuestionPage('What is your name?', 'Your name')
  expect(formPage.successBannerIsDisplayed())
})
test('1.1.2 - Missing page heading error when adding second question', async ({
  page
}, testInfo) => {
  // create a form
  const { formPage } = await createDraftForm(page, testInfo)
  const selectPageTypePage = new SelectPageTypePage(page)

  // Add a new question page
  await formPage.addNewPageButton.click()
  await selectPageTypePage.chooseQuestionPage()
  await formPage.addNewQuestionPage('What is your name?', 'Your name')

  // Add another question
  await formPage.addAnotherQuestion()
  await formPage.checkErrorIsDisplayed()
})
test('1.1.3- Missing a page type "What kind of page do you need"', async ({
  page
}, testInfo) => {
  // create a form
  const { formPage } = await createDraftForm(page, testInfo)
  const selectPageTypePage = new SelectPageTypePage(page)

  // Add a new question page
  await formPage.addNewPageButton.click()
  await selectPageTypePage.clickSaveAndContinue()
  // await selectQuestionType.checkErrorIsDisplayed()
})
