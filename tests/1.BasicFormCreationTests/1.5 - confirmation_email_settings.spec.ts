import { FormPage } from '~/pages/FormPage.js'
import { expect, test, Page } from '@playwright/test'

/**
 * Tests the following:
 * - The confirmation emails pages can be accessed via the check your answers editor page.
 * - The confirmation email checkbox exists on the confirmation emails page.
 * - The confirmation email checkbox works as expected by enabling/disabling the confirmation emails (updates the form JSON upon save).
 * - The confirmation email input is visible in the preview panel when enabled.
 * - The confirmation email input is no longer visible in the preview panel when disabled.
 */
test('1.5.1 - ensure the confirmation email checkbox exists and works as expected', async ({ page }) => {
  // Create a form
  const formPage = new FormPage(page)
  formPage.goTo()
  const form_name = `Automated test - Playwright form ${Math.random().toString().substring(0, 10)} - Summary page`
  await formPage.enterFormName(form_name)
  await formPage.selectRadioOption('Environment Agency')
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

  // Edit draft
  await formPage.editDraft()

  // Check the summary page controller 
  // (should be SummaryPageWithConfirmationEmailController to indicate confirmation emails are enabled) 
  await checkSummaryPageControllerIs(formPage, page, 'SummaryPageWithConfirmationEmailController')

  // Edit the 'check your answers' page
  await formPage.goToPages()
  await formPage.checkYourAnswersLink.click()

  // Check the confirmation emails settings panel/page
  await expect(formPage.confirmationEmailsLink).toBeVisible()
  await formPage.confirmationEmailsLink.click()
  const disableEmailsCheckBox = page.getByLabel('Turn off the confirmation email');
  await expect(disableEmailsCheckBox).toBeVisible();
  await expect(disableEmailsCheckBox).toHaveAttribute('id', 'disableConfirmationEmail');

  // Check the confirmation email input is visible in the preview panel
  await expect(page.getByLabel('Confirmation email (optional)')).toBeVisible();

  // Disable the confirmation emails
  await disableEmailsCheckBox.click()

  // Check the confirmation email input is no longer visible in the preview panel
  await expect(page.getByLabel('Confirmation email (optional)')).not.toBeVisible();

  // Save the changes to the form
  await formPage.saveChangesButton.click()

  // Check the summary page controller 
  // (should be SummaryPageController to indicate confirmation emails are disabled) 
  await checkSummaryPageControllerIs(formPage, page, 'SummaryPageController')
})

/**
 * Checks the summary page controller is as expected by downloading the form JSON and 
 * verifying the controller in the JSON.
 * @param formPage The form page object
 * @param page The page object
 * @param expectedController The expected controller
 */
async function checkSummaryPageControllerIs(formPage: FormPage, page: Page, expectedController: string) {
  // Get the download URL from the current page URL
  const downloadUrl = formPage.constructEditorV2Url('download')

  // Fetch the form JSON directly using Playwright's request context
  const response = await page.request.get(downloadUrl)
  expect(response.ok()).toBeTruthy()
  const jsonContent = await response.text()
  const formJson = JSON.parse(jsonContent)

  // Verify the form JSON has a pages array
  expect(formJson.pages).toBeInstanceOf(Array)
  expect(formJson.pages.length).toBeGreaterThan(0)

  // Check for the summary page in the pages array has the expected controller
  const summaryPage = formJson.pages.find((p: any) =>
    p.path === '/summary'
  )
  expect(summaryPage).toBeDefined()
  expect(summaryPage.controller).toBe(expectedController)
}
