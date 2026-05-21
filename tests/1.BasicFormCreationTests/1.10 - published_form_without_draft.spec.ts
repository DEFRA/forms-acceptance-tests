import { expect, test, type Page } from '@playwright/test'

import { PrivacyNoticePage } from '~/pages/PrivacyNoticePage.js'
import { TermsAndConditionsPage } from '~/pages/TermsAndConditionsPage.js'

/**
 * Creates a live form with the draft version deleted and returns the slug and live form URL.
 *
 * NOTE: The form that's created is published, draft created and that draft version deleted (which
 * currently results in a different state to just publishing the form).
 * @param page - The Playwright page object.
 * @returns A promise that resolves to an object containing the form slug and live form URL.
 */
async function createAndPublishForm(
  page: Page
): Promise<{ slug: string; liveFormUrl: string }> {
  const formName =
    'Live-only form test ' + Math.random().toString().substring(2, 10)

  await page.goto('/create/title')
  await page
    .getByRole('textbox', { name: 'Enter a name for your form' })
    .fill(formName)
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('radio', { name: 'Environment Agency' }).check()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('textbox', { name: 'Name of team' }).fill('Test Team')
  await page
    .getByRole('textbox', { name: 'Shared team email address' })
    .fill('test@test.gov.uk')
  await page.getByRole('button', { name: 'Save and continue' }).click()

  await page.waitForURL('**/library/**')
  const slug = page.url().match(/\/library\/([^/?#]+)/)?.[1]
  if (!slug) {
    throw new Error('Could not extract form slug from URL')
  }

  // Add a question page (required to publish)
  await page.getByRole('button', { name: 'Edit draft' }).click()
  await page.waitForURL('**/editor-v2/pages**')
  await page.getByRole('button', { name: 'Add new page' }).click()
  await page.getByRole('radio', { name: 'Question page' }).check()
  await page.getByRole('button', { name: 'Save and continue' }).click()
  await page.getByRole('radio', { name: 'Written answer' }).check()
  await page
    .getByRole('radio', { name: 'Short answer (a single line)' })
    .check()
  await page.getByRole('button', { name: 'Save and continue' }).click()
  await page.locator('#question').fill('What is your name?')
  await page
    .getByRole('textbox', { name: 'Short description' })
    .fill('Your name')
  await page.getByRole('button', { name: 'Save and continue' }).click()

  // Return to form overview
  await page.getByRole('navigation').getByRole('link', { name: 'Overview' }).click()
  await page.waitForURL('**/library/**')

  // Fill required fields for publishing
  await page
    .getByRole('link', { name: 'Enter email address for support', exact: true })
    .click()
  await page.getByRole('textbox', { name: 'Email address' }).fill('support@defra.gov.uk')
  await page
    .getByRole('textbox', { name: 'Response time' })
    .fill('We aim to respond within 2 working days')
  await page.getByRole('button', { name: 'Save and continue' }).click()

  await page.getByRole('link', { name: 'Enter what happens next' }).click()
  await page
    .getByRole('textbox', {
      name: 'What will happen after a user submits a form?'
    })
    .fill(
      "We'll send you an email to let you know the outcome. You'll usually get a response within 10 working days."
    )
  await page.getByRole('button', { name: 'Save and continue' }).click()

  await page.getByRole('link', { name: 'Add privacy notice' }).click()
  const privacyNoticePage = new PrivacyNoticePage(page)
  await privacyNoticePage.selectPrivacyNoticeType('link')
  await privacyNoticePage.fillPrivacyNoticeUrl(
    'https://www.gov.uk/help/privacy-notice'
  )
  await privacyNoticePage.clickSaveAndContinue()

  await page
    .getByRole('link', { name: 'Enter email address', exact: true })
    .click()
  await page
    .getByRole('textbox', {
      name: 'What email address should submitted forms be sent to?'
    })
    .fill('submissions@defra.gov.uk')
  await page.getByRole('button', { name: 'Save and continue' }).click()

  await page
    .getByRole('link', { name: 'Enter phone number for support', exact: true })
    .click()
  await page.getByRole('textbox', { name: 'phone' }).fill('01234 567890')
  await page.getByRole('button', { name: 'Save and continue' }).click()

  await page
    .getByRole('link', {
      name: 'Enter online contact link for support',
      exact: true
    })
    .click()
  await page
    .getByRole('textbox', { name: 'Contact link', exact: true })
    .fill('https://www.defra.gov.uk/contact')
  await page
    .getByRole('textbox', { name: 'Text to describe the contact link' })
    .fill('Online contact form')
  await page.getByRole('button', { name: 'Save and continue' }).click()
  await page.waitForURL('**/library/**')

  // Agree to T&Cs
  await page.getByRole('link', { name: 'Incomplete' }).click()
  await page.waitForURL('**/edit/terms-and-conditions')
  const termsPage = new TermsAndConditionsPage(page)
  await termsPage.agreeToTerms()
  await termsPage.clickSaveAndContinue()
  await page.waitForURL('**/library/**')

  // Make draft live
  await page.getByRole('button', { name: 'Make draft live' }).click()
  await page.waitForURL('**/make-draft-live**')
  await page.getByRole('button', { name: 'Make draft live' }).click()
  await page.waitForURL('**/library/**')
  await expect(page.getByText('Live').first()).toBeVisible()

  // Create a new draft from the live form, then immediately delete it so the
  // form ends up in the "live only, no draft" state that these tests target
  await page.getByRole('button', { name: 'Create draft to edit' }).click()
  await page.waitForURL('**/library/**')
  await page.getByRole('link', { name: 'Delete draft' }).click()
  await page.waitForURL('**/delete-draft**')
  await page.getByRole('button', { name: 'Delete draft' }).click()
  await page.waitForURL('**/library')
  await page.goto(`/library/${slug}`)

  const liveLink = page
    .locator('a[href*="/form/"]:not([href*="/preview/"])')
    .first()
  await expect(liveLink).toBeVisible()
  const href = await liveLink.getAttribute('href')
  if (!href) {
    throw new Error('Expected live form link to have an href')
  }

  return { slug, liveFormUrl: href }
}

/**
 * Tests the behavior of a form that is published without a draft version to ensure:
 * - The responses page in Designer loads without a draft version.
 * - The privacy policy page in Runner loads without a draft version.
 */
test.describe.serial('1.10 - Published form (live only, no draft)', () => {
  let formSlug: string
  let liveFormUrl: string

  test(
    '1.10.1 - responses page should load for a live-only form',
    async ({ page }) => {
      test.setTimeout(120_000)

      const result = await createAndPublishForm(page)
      formSlug = result.slug
      liveFormUrl = result.liveFormUrl

      const response = await page.goto(`/library/${formSlug}/editor-v2/responses`)
      expect(response?.status()).not.toBe(404)
      const heading = page.getByRole('heading', { level: 1 })
      await expect(heading).toBeVisible()
      await expect(heading).not.toHaveText(/page not found/i)
    }
  )

  test(
    '1.10.2 - Privacy footer link should load in the runner for a live-only form',
    async ({ page }) => {
      await page.goto(liveFormUrl)

      // The Privacy link is in the footer on all runner pages; clicking it on a
      // live-only form (no draft) previously caused a server error due to Runner attempting
      // to obtain the draft form definition.
      const [response] = await Promise.all([
        page.waitForResponse((resp) => resp.url().includes('/privacy')),
        page.getByRole('link', { name: 'Privacy' }).click()
      ])

      expect(response?.status()).not.toBe(404)
      const heading = page.getByRole('heading', { level: 1 })
      await expect(heading).toBeVisible()
      await expect(heading).not.toHaveText(/page not found/i)
    }
  )
})
