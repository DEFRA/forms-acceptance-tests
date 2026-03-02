import { expect, Page, test } from '@playwright/test'
import {
  addWrittenQuestionPage,
  createDraftFormWithDefaults
} from '~/tests/3.EditorTests/utils.js'

async function createDraftWithTwoQuestions(page: Page) {
  const { formPage, selectPageTypePage, selectQuestionTypePage } =
    await createDraftFormWithDefaults(page, 'CSAT feedback toggle')

  await addWrittenQuestionPage(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    'What is your name?',
    'Name'
  )

  await addWrittenQuestionPage(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    'What is your favourite colour?',
    'Colour'
  )
}

async function openUserFeedbackSettings(page: Page) {
  await page.getByRole('link', { name: 'Edit (Check your answers)' }).click()
  await expect(page).toHaveURL(/\/check-answers-settings$/)

  await page.getByRole('link', { name: 'User feedback', exact: true }).click()
  await expect(page).toHaveURL(/\/check-answers-settings\/user-feedback$/)
}

async function getPreviewUrlFromOverview(page: Page) {
  await page.getByRole('link', { name: 'Back to form overview' }).click()
  await expect(page).toHaveURL(/\/library\/[^/?#]+$/)

  const previewUrl = await page
    .locator('dt:has-text("Preview link") + dd a')
    .first()
    .getAttribute('href')

  expect(previewUrl).toBeTruthy()

  return previewUrl as string
}

async function submitPreviewForm(page: Page, previewUrl: string) {
  await page.goto(previewUrl)
  await expect(page).toHaveURL(/\/form\/preview\/draft\//)

  await page
    .getByRole('textbox', { name: /What is your name\?/i })
    .fill('Test User')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page
    .getByRole('textbox', { name: /What is your favourite colour\?/i })
    .fill('Blue')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: 'Submit' }).click()
}

test('should not redirect to GOV.UK feedback page when "Remove GOV.UK feedback page" is checked', async ({
  page
}: {
  page: Page
}) => {
  await createDraftWithTwoQuestions(page)
  await openUserFeedbackSettings(page)

  await page
    .getByRole('checkbox', { name: 'Remove GOV.UK feedback page' })
    .check()
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page).toHaveURL(/\/pages$/)

  const previewUrl = await getPreviewUrlFromOverview(page)
  await submitPreviewForm(page, previewUrl)

  await expect(page).toHaveURL(/\/status(?:\/|\?|$)/)
  await expect(
    page.getByRole('link', { name: 'What do you think of this service?' })
  ).toHaveCount(0)
})

test('should redirect to GOV.UK feedback page when "Remove GOV.UK feedback page" is unchecked (default)', async ({
  page
}) => {
  test.setTimeout(180_000)

  await createDraftWithTwoQuestions(page)
  await openUserFeedbackSettings(page)

  const removeFeedbackCheckbox = page.getByRole('checkbox', {
    name: 'Remove GOV.UK feedback page'
  })
  await expect(removeFeedbackCheckbox).not.toBeChecked()

  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page).toHaveURL(/\/pages$/)

  const previewUrl = await getPreviewUrlFromOverview(page)
  await submitPreviewForm(page, previewUrl)

  await expect(page).toHaveURL(/\/status(?:\/|\?|$)/)
  const feedbackLink = page.getByRole('link', {
    name: 'What do you think of this service?'
  })
  await expect(feedbackLink).toBeVisible()
})
