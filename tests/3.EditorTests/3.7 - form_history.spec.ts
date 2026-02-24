import { test, expect } from '@playwright/test'
import {
  addWrittenQuestionPage,
  createDraftFormWithDefaults
} from '~/tests/3.EditorTests/utils.js'

test('should show draft edit history after adding questions across edit sessions', async ({
  page
}) => {
  test.slow() // as we have to wait for the history to update
  const { formName, formPage, selectPageTypePage, selectQuestionTypePage } =
    await createDraftFormWithDefaults(page, 'History test form')

  // First edit session: add 2 questions.
  await addWrittenQuestionPage(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    'Question one?',
    'Q1'
  )
  await addWrittenQuestionPage(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    'Question two?',
    'Q2'
  )

  // back to overview and edit again.
  await page.getByRole('link', { name: 'Back to form overview' }).click()
  await expect(page.getByRole('button', { name: 'Edit draft' })).toBeVisible()

  // second edit session: add 1 more question foi history
  await formPage.editDraft()
  await addWrittenQuestionPage(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    'Question three?',
    'Q3'
  )

  // Verify history from form overview via the Form history page.
  await page.getByRole('link', { name: 'Back to form overview' }).click()
  await expect(page.getByRole('link', { name: 'Form history' })).toBeVisible()
  await page.getByRole('link', { name: 'Form history' }).click()

  await expect(page).toHaveURL(/\/history$/)
  await expect(
    page.getByRole('heading', { name: /Form history/ })
  ).toBeVisible()

  // as history can take some time to update, polling the page for a min
  await expect
    .poll(
      async () => {
        await page.reload()
        return await page.locator('main').innerText()
      },
      {
        timeout: 60000,
        intervals: [2000, 3000, 5000]
      }
    )
    .toMatch(/Form created|Draft edited|Edited the draft form/)

  const historyText = await page.locator('main').innerText()
  expect(historyText).toMatch(/Form created/)
  expect(historyText).toMatch(/Draft edited|Edited the draft form/)
  expect(historyText).toContain(`Created a new form named '${formName}'`)

  // overview page
  await page.getByRole('link', { name: 'Back to form overview' }).click()

  // get the history panel
  const historyPanel = page
    .getByRole('heading', { name: 'History', exact: true })
    .locator('../..')
  const historyPanelText = await historyPanel.innerText()
  expect(historyPanelText).toMatch(/Form created/)
  expect(historyPanelText).toMatch(/Draft edited|Edited the draft form/)
})
