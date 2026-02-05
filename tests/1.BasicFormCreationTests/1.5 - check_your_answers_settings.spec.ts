import { FormPage } from '~/pages/FormPage.js'
import { expect, test, Page } from '@playwright/test'

/**
 * Tests the following:
 * - The confirmation email page can be accessed via the check your answers editor page.
 * - The confirmation email checkbox exists on the confirmation emails page.
 * - The confirmation email checkbox works as expected by enabling/disabling the confirmation emails (updates the form JSON upon save).
 * - The check your answers overview is updated accordingly.
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

  // Wait for navigation to the editor pages
  await page.waitForURL(/\/editor-v2\//)
  await page.waitForLoadState('networkidle')

  // Check the summary page controller 
  // (should be SummaryPageWithConfirmationEmailController to indicate confirmation emails are enabled) 
  await checkSummaryPageControllerIs(formPage, page, 'SummaryPageWithConfirmationEmailController')

  // Edit the 'check your answers' page
  await formPage.goToPages()
  await formPage.checkYourAnswersLink.click()

  // Check the confirmation emails settings panel/page
  await expect(formPage.confirmationEmailsLink).toBeVisible()
  const emailStatusOn = page.getByRole('link', {
    name: 'Turn off confirmation emails'
  })
  expect(emailStatusOn).toBeVisible()
  await formPage.confirmationEmailsLink.click()
  const disableEmailsCheckBox = page.getByLabel('Turn off the confirmation email');
  await expect(disableEmailsCheckBox).toBeVisible();
  await expect(disableEmailsCheckBox).toHaveAttribute('id', 'disableConfirmationEmail');

  // Disable the confirmation emails
  await disableEmailsCheckBox.click()

  // Save the changes to the form
  await formPage.saveChangesButton.click()

  // Edit the 'check your answers' page
  await formPage.checkYourAnswersLink.click()

  // Check the email status has changed
  await expect(formPage.confirmationEmailsLink).toBeVisible()
  expect(emailStatusOn).not.toBeVisible()

  // Check the summary page controller 
  // (should be SummaryPageController to indicate confirmation emails are disabled) 
  await checkSummaryPageControllerIs(formPage, page, 'SummaryPageController')
})

/**
 * Tests the following:
 * - The reference number page can be accessed via the check your answers editor page.
 * - The reference number checkbox exists on the reference number page.
 * - The reference number checkbox works as expected by enabling/disabling the reference number option (updates the form JSON upon save).
 * - The check your answers overview is updated accordingly.
 */
test('1.5.2 - ensure the reference checkbox exists and works as expected', async ({ page }) => {
  // Create a form
  const formPage = new FormPage(page)
  formPage.goTo()
  const form_name = `Automated test - Playwright form ${Math.random().toString().substring(0, 10)} - Summary page`
  await formPage.enterFormName(form_name)
  await formPage.selectRadioOption('Environment Agency')
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

  // Edit draft
  await formPage.editDraft()

  // Wait for navigation to the editor pages
  await page.waitForURL(/\/editor-v2\//)
  await page.waitForLoadState('networkidle')

  // Edit the 'check your answers' page
  await formPage.goToPages()
  await formPage.checkYourAnswersLink.click()

  // Check the reference number settings panel/page
  await expect(formPage.referenceNumberLink).toBeVisible()
  const referenceNumberStatus = page.getByRole('link', {
    name: 'Turn on the reference number'
  })
  expect(referenceNumberStatus).toBeVisible()
  await formPage.referenceNumberLink.click()
  const referenceNumberCheckBox = page.getByLabel('Turn on the reference number');
  await expect(referenceNumberCheckBox).toBeVisible();
  await expect(referenceNumberCheckBox).toHaveAttribute('id', 'enableReferenceNumber');

  // Enable the reference number
  await referenceNumberCheckBox.click()

  // Save the changes to the form
  await formPage.saveChangesButton.click()

  // Edit the 'check your answers' page
  await formPage.checkYourAnswersLink.click()

  // Check the email status has changed
  await expect(formPage.referenceNumberLink).toBeVisible()
  expect(referenceNumberStatus).not.toBeVisible()
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
