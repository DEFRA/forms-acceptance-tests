import { test } from '@playwright/test'
import { runAccessibilityCheck } from './accessibilityChecker.js'
import { RUNNER_BASE_URL, RUNNER_PATHS } from './constants.js'

test.describe('Accessibility - forms runner', () => {
  test(
    'runner form pages have no WCAG 2.2 AA violations',
    { tag: '@accessibility' },
    async ({ page }, testInfo) => {
      const namePageUrl =
        RUNNER_BASE_URL +
        RUNNER_PATHS.previewDraftForm('e2e-form', 'whats-your-name')

      await page.goto(namePageUrl)
      await runAccessibilityCheck(page, testInfo, 'runner-whats-your-name')

      await page
        .getByRole('textbox', { name: "What's your name?" })
        .fill('BOB the builder')
      await page.getByRole('button', { name: 'Continue' }).click()

      // What's your email address?
      await runAccessibilityCheck(
        page,
        testInfo,
        'runner-whats-your-email-address'
      )
      await page
        .getByRole('textbox', { name: "What's your email address?" })
        .fill('test@defra.gov.uk')
      await page.getByRole('button', { name: 'Continue' }).click()

      // What's your phone number?
      await page
        .getByRole('textbox', { name: "What's your phone number?" })
        .fill('123654789')
      await runAccessibilityCheck(
        page,
        testInfo,
        'runner-whats-your-phone-number'
      )
    }
  )
})
