import { Page, TestInfo } from '@playwright/test'
import { FormPage } from '~/pages/FormPage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { SelectQuestionTypePage } from '~/pages/SelectQuestionTypePage.js'
import { createDraftForm } from '~/tests/utils/createDraftForm.js'

export async function addWrittenQuestionPage(
  formPage: FormPage,
  selectPageTypePage: SelectPageTypePage,
  selectQuestionTypePage: SelectQuestionTypePage,
  questionText: string,
  shortDescription: string
) {
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('writtenAnswer')
  await selectQuestionTypePage.selectSubtype('shortAnswer')
  await selectQuestionTypePage.clickSaveAndContinue()
  await formPage.createWrittenAnswer(questionText, shortDescription)
  await formPage.clickBackToAddEditPages()
}

export async function createDraftFormWithDefaults(
  page: Page,
  formNamePrefix: string,
  testInfo: TestInfo
) {
  const { formName, formPage } = await createDraftForm(page, testInfo, {
    formNamePrefix
  })
  const selectPageTypePage = new SelectPageTypePage(page)
  const selectQuestionTypePage = new SelectQuestionTypePage(page)

  return {
    formName,
    formPage,
    selectPageTypePage,
    selectQuestionTypePage
  }
}
