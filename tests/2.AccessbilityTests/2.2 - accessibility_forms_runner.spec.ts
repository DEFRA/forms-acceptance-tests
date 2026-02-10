import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { runAccessibilityCheck } from './accessibilityChecker.js'

const host_url = process.env.RUNNER_HOST_URL || 'http://localhost:3009'

test.describe('@accessibility', () => {
  test.skip('2.2.1 - Forms Runner Accessibility', async ({
    page
  }, testInfo) => {
    await page.goto(host_url + '/form/preview/draft/e2e-form/whats-your-name')

    await runAccessibilityCheck(page, testInfo, "What's your name")
    await page.getByRole('textbox', { name: "What's your name?" }).click()
    await page
      .getByRole('textbox', { name: "What's your name?" })
      .fill('BOB the builder')
    await page.getByRole('button', { name: 'Continue' }).click()

    await page
      .getByRole('textbox', { name: "What's your email address?" })
      .click()
    await runAccessibilityCheck(page, testInfo, "What's your email address")
    await page
      .getByRole('textbox', { name: "What's your email address?" })
      .fill('test@defra.gov.uk')
    await page.getByRole('button', { name: 'Continue' }).click()

    await page
      .getByRole('textbox', { name: "What's your phone number?" })
      .fill('123654789')
    await runAccessibilityCheck(page, testInfo, "What's your phone number")
  })
})
