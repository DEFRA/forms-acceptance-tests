import { expect, test as base, TestInfo } from '@playwright/test'
import { FormPage } from '~/pages/FormPage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { PageOverview } from '~/pages/PageOverview.js'
import { EditConditionPage } from '~/pages/EditConditionPage.js'

// Custom fixture for form creation
const test = base.extend<{
  formSetup: {
    formPage: FormPage
    selectPageTypePage: SelectPageTypePage
    pageOverview: PageOverview
    formName: string
  }
}>({
  async formSetup({ page }, use) {
    const formPage = new FormPage(page)
    const selectPageTypePage = new SelectPageTypePage(page)
    const pageOverview = new PageOverview(page)
    await formPage.goTo()
    const formName =
      'Automated test - Playwright form ' +
      Math.random().toString().substring(0, 10)
    await formPage.enterFormName(formName)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')
    await formPage.editDraft()
    await formPage.addNewPageButton.click()
    await selectPageTypePage.choosePageType('question')
    await formPage.addNewQuestionPage('What is your name?', 'Your name')
    await use({ formPage, selectPageTypePage, pageOverview, formName })
  }
})

test('3.1.1 - Conditions Manager should display no conditions', async ({
  page,
  formSetup
}, testInfo) => {
  test.setTimeout(30000)
  const { formPage, pageOverview } = formSetup
  const successBanner = await formPage.successBannerIsDisplayed()
  await expect(successBanner).toBeVisible()
  await expect(pageOverview.manageConditionsButton).toBeVisible()
  await pageOverview.clickConditionsTab()
  await pageOverview.verifyNoConditionsState()
})

test('3.1.2 - should create a condition', async ({ page, formSetup }) => {
  test.setTimeout(30000)
  const { pageOverview } = formSetup
  await expect(pageOverview.manageConditionsButton).toBeVisible()
  await pageOverview.manageConditionsButton.click()
  await pageOverview.goToCreateNewCondition()
  const editConditionPage = new EditConditionPage(page)
  await editConditionPage.selectQuestion('Page 1: What is your name?')
  await editConditionPage.selectOperator('Is')
  const valueInput = page.locator('input[name="items[0][value]"]')
  if (await valueInput.isVisible()) {
    await valueInput.fill('Bob')
  }
  await editConditionPage.setConditionName('Name is Bob')
  await editConditionPage.saveCondition()

  const editQuestionPage = new EditConditionPage(page)
  await expect(editQuestionPage.pageHeading).toBeVisible()
})

test('should display all key elements on EditQuestionPage', async ({
  formSetup,
  page
}) => {
  const { pageOverview } = formSetup
  const editQuestionPage = new EditConditionPage(page)
  await expect(pageOverview.manageConditionsButton).toBeVisible()
  await pageOverview.manageConditionsButton.click()
  await pageOverview.goToCreateNewCondition()

  await expect(editQuestionPage.pageHeading).toBeVisible()
  await expect(editQuestionPage.selectQuestionButton).toBeVisible()

  // await expect(editQuestionPage.questionInput).toBeVisible();
  // await expect(editQuestionPage.hintTextInput).toBeVisible();
  // await expect(editQuestionPage.optionalCheckbox).toBeVisible();
  // await expect(editQuestionPage.shortDescriptionInput).toBeVisible();
  // await expect(editQuestionPage.minLengthInput).toBeVisible();
  // await expect(editQuestionPage.maxLengthInput).toBeVisible();
  // await expect(editQuestionPage.regexInput).toBeVisible();
  // await expect(editQuestionPage.classesInput).toBeVisible();
  // await expect(editQuestionPage.saveAndContinueButton).toBeVisible();
  // await expect(editQuestionPage.deleteQuestionLink).toBeVisible();
  // await expect(editQuestionPage.previewPageButton).toBeVisible();
  // await expect(editQuestionPage.previewErrorMessagesButton).toBeVisible();
  // await expect(editQuestionPage.addItemButton).toBeVisible();
  // await expect(editQuestionPage.itemTextBox).toBeVisible();
  // await expect(editQuestionPage.saveItemButton).toBeVisible();
  // await expect(editQuestionPage.radioHint).toBeVisible();
  // await expect(editQuestionPage.advancedFeaturesLink).toBeVisible();
  // await expect(editQuestionPage.uniqueIdentifierInput).toBeVisible();
  await expect(editQuestionPage.cancelLink).toBeVisible()
  // await expect(editQuestionPage.reorderLink).toBeVisible();
  // await expect(editQuestionPage.doneLink).toBeVisible();
  // await expect(editQuestionPage.pagePreviewLabel).toBeVisible();
  // await expect(editQuestionPage.questionText).toBeVisible();

  // await expect(editQuestionPage.operatorDropdown).toBeVisible();
})
