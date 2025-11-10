import { test } from '@playwright/test'
import { runAccessibilityCheck } from './accessibilityChecker.js'

test.beforeEach(async({ page }) => {
  await page.context().clearCookies({ name: 'formsSession' })
  await page.context().clearCookies({ name: 'csrfToken' })
})


test.skip('2.1 - Accessiblity - should create a new form with short answer field', {
  tag: '@accessibility',
},
  async ({ page }, testInfo) => {
    await page.goto('/library')
    await page.getByRole('button', { name: 'Create a new form' }).click()

    const form_name = 'Automated test - Playwright form ' + Math.random().toString().substring(0, 6)
    await page.getByRole('textbox', { name: 'Enter a name for your form' }).fill(form_name)
    await runAccessibilityCheck(page, testInfo, 'Enter a name for your form')

    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('radio', { name: 'Defra' }).check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('textbox', { name: 'Name of team' }).fill('Team A')
    await page.getByRole('textbox', { name: 'Shared team email address' }).fill('test@test.gov.uk')

    await page.getByRole('button', { name: 'Save and continue' }).click()
    await page.getByRole('heading', { name: form_name }).click()

    //form overview
    await runAccessibilityCheck(page, testInfo, 'form overview')


    await page.getByRole('button', { name: 'Edit draft' }).click()

    //form editor v2 form page
    await runAccessibilityCheck(page, testInfo, 'form editor v2 form page')
    await page.getByRole('button', { name: 'Add new page' }).click()

    await page.getByRole('radio', { name: 'Question page' }).check()
    await page.getByRole('button', { name: 'Save and continue' }).click()
    await page.getByRole('radio', { name: 'Written answer' }).check()
    await page.getByRole('radio', { name: 'Short answer (a single line)' }).check()

    //form editor create short answer
    await runAccessibilityCheck(page, testInfo, 'form editor create short answer')
    await page.getByRole('button', { name: 'Save and continue' }).click()
    await page.locator('#question').fill('What is your name?')

    await page.getByRole('textbox', { name: 'Short description' }).click()
    await page.getByRole('textbox', { name: 'Short description' }).fill('Your name')
    await page.getByRole('button', { name: 'Save and continue' }).click()

    //form editor create short answer
    await runAccessibilityCheck(page, testInfo, 'form page preview for short answer')
  })
