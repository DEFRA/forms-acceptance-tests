import { test, expect } from '@playwright/test'
import { FormPage } from '~/pages/FormPage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { SelectQuestionTypePage } from '~/pages/SelectQuestionTypePage.js'

async function addWrittenQuestionPage(
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

test('should assign pages to Section One and Section Two', async ({ page }) => {
  const formPage = new FormPage(page)
  const selectPageTypePage = new SelectPageTypePage(page)
  const selectQuestionTypePage = new SelectQuestionTypePage(page)

  await formPage.goTo()

  const formName =
    'Sections assignment form ' + Math.random().toString().substring(2, 10)

  await formPage.enterFormName(formName)
  await formPage.selectRadioOption('Environment Agency')
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')
  await formPage.editDraft()

  await addWrittenQuestionPage(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    'Question One',
    'Q1 desc'
  )

  await addWrittenQuestionPage(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    'Question Two',
    'Q2 desc'
  )

  await addWrittenQuestionPage(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    'Question Three',
    'Q3 desc'
  )

  await page.getByRole('link', { name: 'Edit (Check your answers)' }).click()
  await expect(page).toHaveURL(/\/check-answers-settings$/)

  await page.getByRole('link', { name: 'Sections', exact: true }).click()
  await expect(page).toHaveURL(/\/check-answers-settings\/sections$/)

  await page
    .getByRole('textbox', { name: 'Section heading' })
    .fill('Section One')
  await page.getByRole('button', { name: '+ Add section heading' }).click()

  await page
    .getByRole('textbox', { name: 'Section heading' })
    .fill('Section Two')
  await page.getByRole('button', { name: '+ Add section heading' }).click()

  const questionOneRow = page.locator('li', { hasText: 'Question One' }).first()
  await questionOneRow.locator('select').selectOption({ label: 'Section One' })
  await questionOneRow.getByRole('button', { name: 'Assign' }).click()

  const questionTwoRow = page.locator('li', { hasText: 'Question Two' }).first()
  await questionTwoRow.locator('select').selectOption({ label: 'Section One' })
  await questionTwoRow.getByRole('button', { name: 'Assign' }).click()

  const questionThreeRow = page
    .locator('li', { hasText: 'Question Three' })
    .first()
  await questionThreeRow
    .locator('select')
    .selectOption({ label: 'Section Two' })
  await questionThreeRow.getByRole('button', { name: 'Assign' }).click()

  const sectionOneAssigned = page
    .getByRole('heading', { name: 'Section 1: Section One' })
    .locator('../..')
  await expect(sectionOneAssigned).toContainText('Question One')
  await expect(sectionOneAssigned).toContainText('Question Two')

  const sectionTwoAssigned = page.getByRole('heading', {
    name: 'Section 2: Section Two',
    exact: true
  })

  const sectionTwoParent = sectionTwoAssigned.locator('../..')
  await expect(sectionTwoParent).toContainText('Question Three')

  const previewPanel = page.locator('[role="tabpanel"]')
  await expect(previewPanel).toContainText('Section One')
  await expect(previewPanel).toContainText('Question One')
  await expect(previewPanel).toContainText('Question Two')
  await expect(previewPanel).toContainText('Section Two')
  await expect(previewPanel).toContainText('Question Three')
})

test('should reassign a question from Section One to Section Two', async ({
  page
}) => {
  const formPage = new FormPage(page)
  const selectPageTypePage = new SelectPageTypePage(page)
  const selectQuestionTypePage = new SelectQuestionTypePage(page)

  await formPage.goTo()

  const formName =
    'Sections reassign form ' + Math.random().toString().substring(2, 10)

  await formPage.enterFormName(formName)
  await formPage.selectRadioOption('Environment Agency')
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')
  await formPage.editDraft()

  await addWrittenQuestionPage(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    'Question One',
    'Q1 desc'
  )

  await addWrittenQuestionPage(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    'Question Two',
    'Q2 desc'
  )

  await addWrittenQuestionPage(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    'Question Three',
    'Q3 desc'
  )

  await page.getByRole('link', { name: 'Edit (Check your answers)' }).click()
  await page.getByRole('link', { name: 'Sections', exact: true }).click()
  await expect(page).toHaveURL(/\/check-answers-settings\/sections$/)

  await page
    .getByRole('textbox', { name: 'Section heading' })
    .fill('Section One')
  await page.getByRole('button', { name: '+ Add section heading' }).click()

  await page
    .getByRole('textbox', { name: 'Section heading' })
    .fill('Section Two')
  await page.getByRole('button', { name: '+ Add section heading' }).click()

  const questionOneRow = page.locator('li', { hasText: 'Question One' }).first()
  await questionOneRow.locator('select').selectOption({ label: 'Section One' })
  await questionOneRow.getByRole('button', { name: 'Assign' }).click()

  const questionTwoRow = page.locator('li', { hasText: 'Question Two' }).first()
  await questionTwoRow.locator('select').selectOption({ label: 'Section One' })
  await questionTwoRow.getByRole('button', { name: 'Assign' }).click()

  const questionThreeRow = page
    .locator('li', { hasText: 'Question Three' })
    .first()
  await questionThreeRow
    .locator('select')
    .selectOption({ label: 'Section Two' })
  await questionThreeRow.getByRole('button', { name: 'Assign' }).click()

  const sectionOneAssigned = page.getByRole('heading', {
    name: 'Section 1: Section One',
    exact: true
  })

  const sectionTwoAssigned = page.getByRole('heading', {
    name: 'Section 2: Section Two',
    exact: true
  })

  const sectionOneParent = sectionOneAssigned.locator('../..')
  const sectionTwoParent = sectionTwoAssigned.locator('../..')

  await expect(sectionOneParent).toContainText('Question One')
  await expect(sectionOneParent).toContainText('Question Two')

  await sectionOneAssigned
    .locator('../..')
    .locator('li', { hasText: 'Question Two' })
    .getByRole('button', { name: 'Unassign' })
    .click()

  const questionTwoUnassignedRow = page
    .locator('li', { hasText: 'Question Two' })
    .first()
  await questionTwoUnassignedRow
    .locator('select')
    .selectOption({ label: 'Section Two' })
  await questionTwoUnassignedRow.getByRole('button', { name: 'Assign' }).click()

  await expect(sectionOneParent).toContainText('Question One')
  await expect(sectionOneParent).not.toContainText('Question Two')

  await expect(sectionTwoParent).toContainText('Question Two')
  await expect(sectionTwoParent).toContainText('Question Three')

  const previewPanel = page.locator('[role="tabpanel"]')
  await expect(previewPanel).toContainText('Section One')
  await expect(previewPanel).toContainText('Question One')
  await expect(previewPanel).toContainText('Section Two')
  await expect(previewPanel).toContainText('Question Two')
  await expect(previewPanel).toContainText('Question Three')
})
