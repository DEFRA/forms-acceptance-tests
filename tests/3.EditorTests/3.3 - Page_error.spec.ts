import { expect, test, TestInfo } from '@playwright/test'
import { FormPage } from '../../pages/FormPage'
import { SelectPageTypePage } from '../../pages/SelectPageTypePage'
test('3.3.1 - should error when adding a page with a duplicate name', async ({
  page
}, testInfo) => {
  //create a form
  const formPage = new FormPage(page)
  const selectPageTypePage = new SelectPageTypePage(page)
  formPage.goTo()
  const form_name =
    'Automated test - Playwright form ' +
    Math.random().toString().substring(0, 10)

  await formPage.enterFormName(form_name)
  await formPage.selectRadioOption('Environment Agency')
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

  // Edit draft
  await formPage.editDraft()

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
