import { test, expect } from '~/fixtures/main.js'
import {
  addWrittenQuestionPage,
  createDraftFormWithDefaults
} from '~/tests/3.EditorTests/utils.js'
import { raceAgainstAccessDenied } from '~/tests/utils/raceAgainstAccessDenied.js'

test('should show draft edit history after adding questions across edit sessions', async ({
  page
}, testInfo) => {
  // Explicit budget rather than test.slow()'s 3x multiplier (45s): the
  // history-consistency poll below is itself allowed up to 60s, so the
  // overall test needs comfortably more than that plus setup time.
  test.setTimeout(120_000)
  const { formName, formPage, selectPageTypePage, selectQuestionTypePage } =
    await createDraftFormWithDefaults(page, 'History test form', testInfo)

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

  // As history can take some time to update, poll until the edit-session
  // entries actually show up. "Form created" is present from the very first
  // load, so it can't be part of this match — including it let the poll
  // exit immediately, before the edit entries this test is waiting for had
  // any chance to appear.
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
    .toMatch(/Draft edited|Edited the draft form/)

  const historyText = await raceAgainstAccessDenied(page, () =>
    page.locator('main').innerText()
  )
  expect(historyText).toMatch(/Form created/)
  expect(historyText).toMatch(/Draft edited|Edited the draft form/)
  expect(historyText).toContain(`Created a new form named '${formName}'`)

  // overview page
  await page.getByRole('link', { name: 'Back to form overview' }).click()

  // get the history panel
  const historyPanel = page
    .getByRole('heading', { name: 'History', exact: true })
    .locator('../..')
  const historyPanelText = await raceAgainstAccessDenied(page, () =>
    historyPanel.innerText()
  )
  expect(historyPanelText).toMatch(/Form created/)
  expect(historyPanelText).toMatch(/Draft edited|Edited the draft form/)
})
