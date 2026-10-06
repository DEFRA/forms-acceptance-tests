import { expect, test } from '@playwright/test'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { createDraftForm } from '~/tests/utils/createDraftForm.js'
test('3.3.1 - should error when adding a page with a duplicate name', async ({
  page
}, testInfo) => {
  // create a form
  const { formPage } = await createDraftForm(page, testInfo)
  const selectPageTypePage = new SelectPageTypePage(page)

  // Add a new question page

  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await formPage.addNewQuestionPage('What is your name?', 'Your name')
  const successBanner1 = await formPage.successBannerIsDisplayed()
  await expect(successBanner1).toBeVisible()
  await formPage.clickBackToAddEditPages()

  // Add a new question page with a duplicate name

  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await formPage.addNewQuestionPage(
    'What is your name?',
    'Your name is being duplicated'
  )
  const errorBanner = await formPage.errorDuplicatePageTitle()
  await expect(errorBanner).toBeVisible()
})
