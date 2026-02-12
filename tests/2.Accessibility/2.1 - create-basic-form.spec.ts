import { test } from '~/fixtures/main.js'
import { runAccessibilityCheck } from './accessibilityChecker.js'

test.describe('Accessibility - create a form with short answer field', () => {
  test(
    'form creation journey has no WCAG 2.2 AA violations',
    { tag: '@accessibility' },
    async ({ app }, testInfo) => {
      test.setTimeout(240_000) // 4 minutes, as this is a long flow with many steps
      const { libraryPage } = app
      const { page } = libraryPage

      // Navigate to library and start creating a form
      await libraryPage.goto()
      await libraryPage.clickCreateForm()

      const formName =
        'Automated test - Playwright form ' +
        Math.random().toString().substring(0, 6)

      await page
        .getByRole('textbox', { name: 'Enter a name for your form' })
        .fill(formName)

      await runAccessibilityCheck(page, testInfo, 'create-form-enter-name')

      // Continue through the form creation wizard
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('radio', { name: 'Defra' }).check()
      await page.getByRole('button', { name: 'Continue' }).click()

      await page.getByRole('textbox', { name: 'Name of team' }).fill('Team A')
      await page
        .getByRole('textbox', { name: 'Shared team email address' })
        .fill('test@test.gov.uk')

      await page.getByRole('button', { name: 'Save and continue' }).click()

      // Form overview page — page navigates here after team details save
      await runAccessibilityCheck(page, testInfo, 'form-overview')

      // Edit draft
      await page.getByRole('button', { name: 'Edit draft' }).click()

      await runAccessibilityCheck(page, testInfo, 'form-editor-v2')

      // Add a new question page
      await page.getByRole('button', { name: 'Add new page' }).click()
      await page.getByRole('radio', { name: 'Question page' }).check()
      await page.getByRole('button', { name: 'Save and continue' }).click()

      await page.getByRole('radio', { name: 'Written answer' }).check()
      await page
        .getByRole('radio', { name: 'Short answer (a single line)' })
        .check()

      await runAccessibilityCheck(
        page,
        testInfo,
        'form-editor-create-short-answer'
      )

      await page.getByRole('button', { name: 'Save and continue' }).click()
      await page.locator('#question').fill('What is your name?')

      await page
        .getByRole('textbox', { name: 'Short description' })
        .fill('Your name')
      await page.getByRole('button', { name: 'Save and continue' }).click()

      await runAccessibilityCheck(
        page,
        testInfo,
        'form-page-preview-short-answer'
      )
    }
  )
})
