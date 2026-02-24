import { Page } from '@playwright/test'
import { FormPage } from '~/pages/FormPage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { SelectQuestionTypePage } from '~/pages/SelectQuestionTypePage.js'

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
  formNamePrefix: string
) {
  const formPage = new FormPage(page)
  const selectPageTypePage = new SelectPageTypePage(page)
  const selectQuestionTypePage = new SelectQuestionTypePage(page)

  await formPage.goTo()

  const formName =
    `${formNamePrefix} ` + Math.random().toString().substring(2, 10)

  await formPage.enterFormName(formName)
  await formPage.selectRadioOption('Environment Agency')
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')
  await formPage.editDraft()

  return {
    formName,
    formPage,
    selectPageTypePage,
    selectQuestionTypePage
  }
}
