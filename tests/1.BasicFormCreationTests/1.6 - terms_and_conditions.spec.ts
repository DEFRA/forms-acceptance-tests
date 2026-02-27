import { test, expect } from '@playwright/test'
import { FormPage } from '~/pages/FormPage.js'
import { TermsAndConditionsPage } from '~/pages/TermsAndConditionsPage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { PrivacyNoticePage } from '~/pages/PrivacyNoticePage.js'

test('1.6.1 - should navigate to terms and conditions page and agree', async ({
  page
}) => {
  // Create a form
  const formPage = new FormPage(page)
  await formPage.goTo()
  const form_name =
    'Automated test - Playwright form ' +
    Math.random().toString().substring(0, 10)

  await formPage.enterFormName(form_name)
  await formPage.selectRadioOption('Environment Agency')
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

  // Verify T&C shows as 'Incomplete' on the overview page
  const incompleteLink = page.getByRole('link', { name: 'Incomplete' })
  await expect(incompleteLink).toBeVisible()

  // Click the 'Incomplete' link to navigate to T&C page
  await incompleteLink.click()
  await page.waitForURL('**/edit/terms-and-conditions')

  // Verify T&C page is displayed
  const termsAndConditionsPage = new TermsAndConditionsPage(page)
  await termsAndConditionsPage.expectOnPage()

  // Agree to terms and conditions
  await termsAndConditionsPage.agreeToTerms()
  await termsAndConditionsPage.clickSaveAndContinue()

  // Verify redirected back to overview with success notification
  await page.waitForURL('**/library/**')
  await expect(page.getByText('Terms and conditions accepted')).toBeVisible()

  // Verify T&C now shows as 'Agreed'
  await expect(page.getByText('Agreed')).toBeVisible()
})

test('1.6.2 - should show validation error when checkbox is not checked', async ({
  page
}) => {
  // Create a form
  const formPage = new FormPage(page)
  await formPage.goTo()
  const form_name =
    'Automated test - Playwright form ' +
    Math.random().toString().substring(0, 10)

  await formPage.enterFormName(form_name)
  await formPage.selectRadioOption('Environment Agency')
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

  // Navigate to T&C page
  const incompleteLink = page.getByRole('link', { name: 'Incomplete' })
  await incompleteLink.click()
  await page.waitForURL('**/edit/terms-and-conditions')

  // Submit without checking the checkbox
  const termsAndConditionsPage = new TermsAndConditionsPage(page)
  await termsAndConditionsPage.clickSaveAndContinue()

  // Verify validation error is displayed in the error summary
  await expect(
    page.getByRole('link', {
      name: 'You must confirm you meet the terms and conditions to continue'
    })
  ).toBeVisible()
})

test('1.6.3 - should cancel and return to form overview', async ({ page }) => {
  // Create a form
  const formPage = new FormPage(page)
  await formPage.goTo()
  const form_name =
    'Automated test - Playwright form ' +
    Math.random().toString().substring(0, 10)

  await formPage.enterFormName(form_name)
  await formPage.selectRadioOption('Environment Agency')
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

  // Navigate to T&C page
  const incompleteLink = page.getByRole('link', { name: 'Incomplete' })
  await incompleteLink.click()
  await page.waitForURL('**/edit/terms-and-conditions')

  // Click cancel
  const termsAndConditionsPage = new TermsAndConditionsPage(page)
  await termsAndConditionsPage.clickCancel()

  // Verify redirected back to overview
  await page.waitForURL('**/library/**')

  // Verify T&C still shows as 'Incomplete'
  await expect(page.getByRole('link', { name: 'Incomplete' })).toBeVisible()
})

test('1.6.4 - should require terms and conditions before publishing a new form', async ({
  page
}) => {
  test.setTimeout(120_000)
  // Create a form with all required metadata
  const formPage = new FormPage(page)
  await formPage.goTo()
  const form_name =
    'Automated test - Playwright form ' +
    Math.random().toString().substring(0, 10)

  await formPage.enterFormName(form_name)
  await formPage.selectRadioOption('Environment Agency')
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

  // Edit draft and add a question page
  await formPage.editDraft()

  const selectPageTypePage = new SelectPageTypePage(page)
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await formPage.addNewQuestionPage('What is your name?', 'Your name')

  // Navigate back to overview
  const nav = page.getByRole('navigation')
  await nav.getByRole('link', { name: 'Overview' }).click()
  await page.waitForURL('**/library/**')

  // Fill required overview fields

  // Email address for support
  await page
    .getByRole('link', { name: 'Enter email address for support' })
    .click()
  await page
    .getByRole('textbox', { name: 'Email address' })
    .fill('support@defra.gov.uk')
  await page
    .getByRole('textbox', { name: 'Response time' })
    .fill('We aim to respond within 2 working days')
  await page.getByRole('button', { name: 'Save and continue' }).click()

  // Submission guidance
  await page.getByRole('link', { name: 'Enter what happens next' }).click()
  await page
    .getByRole('textbox', {
      name: 'What will happen after a user submits a form?'
    })
    .fill(
      "We'll send you an email to let you know the outcome. You'll usually get a response within 10 working days."
    )
  await page.getByRole('button', { name: 'Save and continue' }).click()

  // Privacy notice
  await page.getByRole('link', { name: 'Add privacy notice' }).click()
  const privacyNoticePage = new PrivacyNoticePage(page)
  await privacyNoticePage.selectPrivacyNoticeType('link')
  await privacyNoticePage.fillPrivacyNoticeUrl(
    'https://www.gov.uk/help/privacy-notice'
  )
  await privacyNoticePage.clickSaveAndContinue()

  // Notification email
  await page
    .getByRole('link', { name: 'Enter email address', exact: true })
    .click()
  await page
    .getByRole('textbox', {
      name: 'What email address should submitted forms be sent to?'
    })
    .fill('submissions@defra.gov.uk')
  await page.getByRole('button', { name: 'Save and continue' }).click()

  // Phone number for support
  await page
    .getByRole('link', { name: 'Enter phone number for support' })
    .click()
  await page.getByRole('textbox', { name: 'phone' }).fill('01234 567890')
  await page.getByRole('button', { name: 'Save and continue' }).click()

  // Online contact link for support
  await page
    .getByRole('link', { name: 'Enter online contact link for support' })
    .click()
  await page
    .getByRole('textbox', { name: 'Contact link', exact: true })
    .fill('https://www.defra.gov.uk/contact')
  await page
    .getByRole('textbox', { name: 'Text to describe the contact link' })
    .fill('Online contact form')
  await page.getByRole('button', { name: 'Save and continue' }).click()
  await page.waitForURL('**/library/**')

  // Agree to terms and conditions
  const incompleteLink = page.getByRole('link', { name: 'Incomplete' })
  await incompleteLink.click()
  await page.waitForURL('**/edit/terms-and-conditions')

  const termsAndConditionsPage = new TermsAndConditionsPage(page)
  await termsAndConditionsPage.agreeToTerms()
  await termsAndConditionsPage.clickSaveAndContinue()
  await page.waitForURL('**/library/**')

  // Verify T&C shows as 'Agreed'
  await expect(page.getByText('Agreed')).toBeVisible()

  // Make draft live
  await page.getByRole('button', { name: 'Make draft live' }).click()
  await page.waitForURL('**/make-draft-live**')
  await page.getByRole('button', { name: 'Make draft live' }).click()

  // Verify form is now live
  await page.waitForURL('**/library/**')
  await page.getByText('Live').first().waitFor()
})
