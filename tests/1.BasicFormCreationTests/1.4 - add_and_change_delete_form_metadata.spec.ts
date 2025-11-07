import { test, expect } from '@playwright/test'
import { FormPage } from '~/pages/FormPage.js'
import { LibraryPage } from '~/pages/LibraryPage.js'
import { faker } from '@faker-js/faker'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { PrivacyNoticePage } from '~/pages/PrivacyNoticePage.js'
import { TeamDetailsPage } from '~/pages/TeamDetailsPage.js'

test.beforeEach(async({ page }) => {
  await page.context().clearCookies({ name: 'formsSession' })
})

// This test will create a form, expand it, add 'Submitted forms sent to', and then delete the form


// New test: enter an email address by clicking on text 'Enter email address'
test('1.4.1 - should add an email address for form submissions', async ({ page }) => {
    //create a form
    const formPage = new FormPage(page)
    const selectPageTypePage = new SelectPageTypePage(page)
    formPage.goTo()
    const form_name = formPage.generateNewFormName()

    await formPage.enterFormName(form_name)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')



    const submissionsEmail = 'submissions@test.gmail.com'
    await formPage.enterEmailAddressLink.click()

    // Find the email input (assuming it's a textbox)
    const emailInput = page.getByRole('textbox', { name: /email address/i })
    await emailInput.fill(submissionsEmail)
    await formPage.saveAndContinueButton.click()
    await formPage.waitUntilReady()


    // Verify the email was entered (e.g., appears on the page or in a summary)
    expect((await formPage.successBannerEmailUpdatedIsDisplayed()).isVisible).toBeTruthy()
    expect(await page.getByText(submissionsEmail).isVisible()).toBeTruthy()
})

test('1.4.2 - should update email address for form submissions', async ({ page }) => {
    //create a form
    const formPage = new FormPage(page)
    const selectPageTypePage = new SelectPageTypePage(page)
    formPage.goTo()
    const form_name = formPage.generateNewFormName()

    await formPage.enterFormName(form_name)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')


    const submissionsEmail = 'submissions@test.gov.uk'
    await formPage.enterEmailAddressLink.click()

    const emailInput = page.getByRole('textbox', { name: /email address/i })
    await emailInput.fill(submissionsEmail)
    await formPage.saveAndContinueButton.click()
    await formPage.waitUntilReady()


    // Verify the email was entered (e.g., appears on the page or in a summary)
    expect((await formPage.successBannerEmailUpdatedIsDisplayed()).isVisible).toBeTruthy()
    expect(await page.getByText(submissionsEmail).isVisible()).toBeTruthy()


    await formPage.changeEmailAddressLink.click()

    // Update the email address
    await emailInput.fill('new-admin@test.gov.uk')
    await formPage.saveAndContinueButton.click()
    await formPage.waitUntilReady()

    // Assert the new email is visible
    await expect(page.getByText('new-admin@test.gov.uk')).toBeVisible({ timeout: 10000 })
})

test('1.4.3 - should delete an existing draft form', async ({ page }) => {
    const libraryPage = new LibraryPage(page)
    const formPage = new FormPage(page)
    await libraryPage.goto()
    const formName = 'Automated test - Playwright form ' + faker.string.uuid()
    await libraryPage.clickCreateForm()
    await formPage.enterFormName(formName)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')


    await libraryPage.deleteForm()

    await page.getByRole('textbox', { name: 'Form name' }).fill(formName)
    await page.getByRole('textbox', { name: 'Form name' }).press('Enter')

    const searchResult = await page.getByRole('heading', { name: 'There are no matching forms' })
    await expect(searchResult).toBeVisible()

})

test('1.4.4 - should add a phone number for support', async ({ page }) => {
    // Create a form
    const formPage = new FormPage(page)
    formPage.goTo()
    const form_name = formPage.generateNewFormName()
    await formPage.enterFormName(form_name)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

    // Use locator from FormPage.ts for 'Enter phone number for support' link
    const supportPhone = '01234 567890'
    await formPage.enterPhoneNumberLink.click()

    // Find the phone input (assuming it's a textbox)
    const phoneInput = page.getByRole('textbox', { name: /phone number/i })
    await phoneInput.fill(supportPhone)
    await formPage.saveAndContinueButton.click()

    // Verify the phone number was entered (e.g., appears on the page or in a summary)
    await expect(page.getByText(supportPhone)).toBeVisible()
})

test('1.4.5 - should update phone number for support', async ({ page }) => {
    // Create a form
    const formPage = new FormPage(page)
    formPage.goTo()
    const form_name = formPage.generateNewFormName()

    await formPage.enterFormName(form_name)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

    // Add initial phone number for support
    const initialPhone = '01234 567890'
    await formPage.enterPhoneNumberLink.click()
    await formPage.supportPhoneInput.fill(initialPhone)
    await formPage.saveAndContinueButton.click()
    await formPage.waitUntilReady()
    await expect(page.getByText(initialPhone)).toBeVisible()

    // Update the phone number for support
    const updatedPhone = '09876 543210'
    await formPage.changePhoneNumberLink.click()
    await formPage.supportPhoneInput.fill(updatedPhone)
    await formPage.saveAndContinueButton.click()
    await formPage.waitUntilReady()
    await expect(page.getByText(updatedPhone)).toBeVisible()
})

test('1.4.6 - should add email address for support', async ({ page }) => {
    // Create a form
    const formPage = new FormPage(page)
    formPage.goTo()
    const form_name = formPage.generateNewFormName()

    await formPage.enterFormName(form_name)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

    // Add email address for support
    const supportEmail = 'support@email.com'
    await formPage.enterEmailAddressForSupportLink.click()
    await page.getByRole('textbox', { name: 'Email address' }).click()
    await page.getByRole('textbox', { name: 'Email address' }).fill(supportEmail)
    await page.getByRole('textbox', { name: 'Response time' }).fill('We aim to respond within 10 working days')

    await formPage.saveAndContinueButton.click()
    await formPage.waitUntilReady()
    await expect(page.getByText(supportEmail)).toBeVisible()
    await expect(page.getByText('We aim to respond within 10 working days')).toBeVisible()
})

test('1.4.7 - should update email address for support', async ({ page }) => {
    // Create a form
    const formPage = new FormPage(page)
    formPage.goTo()
    const form_name = formPage.generateNewFormName()

    await formPage.enterFormName(form_name)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

    // Add email address for support
    const supportEmail = 'support@email.com'
    await formPage.enterEmailAddressForSupportLink.click()
    await page.getByRole('textbox', { name: 'Email address' }).click()
    await page.getByRole('textbox', { name: 'Email address' }).fill(supportEmail)
    await page.getByRole('textbox', { name: 'Response time' }).fill('We aim to respond within 10 working days')
    await formPage.saveAndContinueButton.click()
    await formPage.waitUntilReady()
    await expect(page.getByText(supportEmail)).toBeVisible()
    await expect(page.getByText('We aim to respond within 10 working days')).toBeVisible()

    // Update the email address for support
    const updatedSupportEmail = 'helpdesk@email.com'
    await formPage.changeSupportEmailLink.click()
    await page.getByRole('textbox', { name: 'Email address' }).fill(updatedSupportEmail)
    await formPage.saveAndContinueButton.click()
    await formPage.waitUntilReady()
    await expect(page.getByText(updatedSupportEmail)).toBeVisible()
})

test('1.4.8 - should add online contact link for support', async ({ page }) => {
    // Create a form
    const formPage = new FormPage(page)
    formPage.goTo()
    const form_name = formPage.generateNewFormName()

    await formPage.enterFormName(form_name)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

    // Add online contact link for support
    const supportContactLink = 'https://support.example.com/contact'
    const textForOnlineSupport = 'Online contact form'
    await formPage.enterOnlineContactLinkForSupportLink.click()
    const contactInput = page.getByRole('textbox', { name: 'Contact link', exact: true })
    const textToDescribeTheContact = page.getByRole('textbox', { name: 'Text to describe the contact' })

    await contactInput.fill(supportContactLink)
    await textToDescribeTheContact.fill(textForOnlineSupport)
    await formPage.saveAndContinueButton.click()
    await formPage.waitUntilReady()
    await expect(page.getByText(supportContactLink)).toBeVisible()
    await expect(page.getByText(textForOnlineSupport)).toBeVisible()
})

test('1.4.9 - should add what happens next', async ({ page }) => {
    // Create a form
    const formPage = new FormPage(page)
    formPage.goTo()
    const form_name = formPage.generateNewFormName()

    await formPage.enterFormName(form_name)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

    // Add what happens next
    const whatHappensNextText = 'You will receive a confirmation email and next steps.'
    await formPage.enterWhatHappensNextLink.click()
    const whatHappensNextInput = page.getByRole('textbox', { name: 'What will happen after a user' })
    await whatHappensNextInput.fill(whatHappensNextText)
    await formPage.saveAndContinueButton.click()
    await formPage.waitUntilReady()
    await expect(page.getByText(whatHappensNextText)).toBeVisible()
})

test('1.4.10 - should update what happens next', async ({ page }) => {
    // Create a form
    const formPage = new FormPage(page)
    formPage.goTo()
    const form_name = formPage.generateNewFormName()

    await formPage.enterFormName(form_name)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

    // Add what happens next
    const whatHappensNextText = 'You will receive a confirmation email and next steps.'
    await formPage.enterWhatHappensNextLink.click()
    const whatHappensNextInput = page.getByRole('textbox', { name: 'What will happen after a user' })
    await whatHappensNextInput.fill(whatHappensNextText)
    await formPage.saveAndContinueButton.click()
    await formPage.waitUntilReady()
    await expect(page.getByText(whatHappensNextText)).toBeVisible()

    // Update what happens next
    const updatedWhatHappensNextText = 'You will be contacted by our team for further instructions.'
    await formPage.changeSubmissionGuidance.click()
    await whatHappensNextInput.fill(updatedWhatHappensNextText)
    await formPage.saveAndContinueButton.click()
    await formPage.waitUntilReady()
    await expect(page.getByText(updatedWhatHappensNextText)).toBeVisible()
})

test('1.4.11 - should add a privacy notice URL for the form', async ({ page }) => {
    // Create a form
    const formPage = new FormPage(page)
    await formPage.goTo()
    const form_name = formPage.generateNewFormName()

    await formPage.enterFormName(form_name)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

    // Go to privacy notice page (update this step if navigation is different in your app)
    await formPage.enterLinkToPrivacyNoticeLink.click()

    const privacyNoticePage = new PrivacyNoticePage(page)
    await privacyNoticePage.expectOnPage()
    const dummyUrl = 'https://dummy-privacy-url.test/privacy'
    await privacyNoticePage.fillPrivacyNoticeUrl(dummyUrl)
    await privacyNoticePage.clickSaveAndContinue()

    // Assert the dummy URL is visible on the page (update selector if needed)
    await expect(page.getByText(dummyUrl)).toBeVisible()
})

test('1.4.12 - should amend team name', async ({ page }) => {
    // Create a form
    const formPage = new FormPage(page)
    await formPage.goTo()
    const form_name = formPage.generateNewFormName()

    await formPage.enterFormName(form_name)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

    // Navigate to team details page and amend team name
    await formPage.clickChangeTeamNameLink()
    const teamDetailsPage = new TeamDetailsPage(page)
    await teamDetailsPage.expectOnPage()
    const updatedTeamName = 'Updated Team Name'
    await teamDetailsPage.fillTeamDetails(updatedTeamName, 'test@test.gov.uk')
    await teamDetailsPage.clickSaveAndContinue()
    await formPage.waitUntilReady()

    // Assert the updated team name is visible
    await expect(page.getByText(updatedTeamName)).toBeVisible()
})