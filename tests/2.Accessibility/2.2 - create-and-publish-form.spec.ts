import { test } from '~/fixtures/main.js'
import { runAccessibilityCheck } from './accessibilityChecker.js'

test.describe('Accessibility - full form creation and publish journey', () => {
  test(
    'every step of the create → edit → publish flow has no WCAG 2.2 AA violations',
    { tag: '@accessibility' },
    async ({ app }, testInfo) => {
      test.setTimeout(120_000) // 2 minutes, due to long flow with many steps
      const { libraryPage } = app
      const { page } = libraryPage

      const formName =
        'A11y publish test ' + Math.random().toString().substring(2, 8)

      // Step 1
      await libraryPage.goto()
      await runAccessibilityCheck(page, testInfo, 'library-page')

      // Step 2 – Click create form and check accessibility of the first step of the form creation flow
      await libraryPage.clickCreateForm()
      await page.waitForURL('**/create/title')
      await runAccessibilityCheck(page, testInfo, 'create-title')

      await page
        .getByRole('textbox', { name: 'Enter a name for your form' })
        .fill(formName)
      await page.getByRole('button', { name: 'Continue' }).click()

      // Step 3 – Organisation details
      await page.waitForURL('**/create/organisation')
      await runAccessibilityCheck(page, testInfo, 'create-organisation')

      await page.getByRole('radio', { name: 'Defra' }).check()
      await page.getByRole('button', { name: 'Continue' }).click()

      // Step 4 – Team details
      await page.waitForURL('**/create/team')
      await runAccessibilityCheck(page, testInfo, 'create-team-details')

      await page
        .getByRole('textbox', { name: 'Name of team' })
        .fill('A11y Test Team')
      await page
        .getByRole('textbox', { name: 'Shared team email address' })
        .fill('test@defra.gov.uk')
      await page.getByRole('button', { name: 'Save and continue' }).click()

      // Step 5 – Form overview
      await page.waitForURL('**/library/**')
      await page.getByRole('heading', { name: formName }).waitFor()
      await runAccessibilityCheck(page, testInfo, 'form-overview-draft')

      // Step 6 – Edit draft → editor pages
      await page.getByRole('button', { name: 'Edit draft' }).click()
      await page.waitForURL('**/editor-v2/pages**')
      await runAccessibilityCheck(page, testInfo, 'editor-add-edit-pages')

      // Step 7 – Add new question page
      await page.getByRole('button', { name: 'Add new page' }).click()
      await page.waitForURL('**/editor-v2/page')
      await runAccessibilityCheck(page, testInfo, 'select-page-type')

      await page.getByRole('radio', { name: 'Question page' }).check()
      await page.getByRole('button', { name: 'Save and continue' }).click()

      // Step 8 – Select question type
      await page.waitForURL('**/question/**/type/**')
      await runAccessibilityCheck(page, testInfo, 'select-question-type')

      await page.getByRole('radio', { name: 'Written answer' }).check()
      await page
        .getByRole('radio', { name: 'Short answer (a single line)' })
        .check()
      await page.getByRole('button', { name: 'Save and continue' }).click()

      // Step 9 – Edit question details
      await page.waitForURL('**/question/**/details/**')
      await runAccessibilityCheck(page, testInfo, 'edit-question-details')

      await page.locator('#question').fill('What is your name?')
      await page
        .getByRole('textbox', { name: 'Short description' })
        .fill('Your name')
      await page.getByRole('button', { name: 'Save and continue' }).click()

      // Step 10 – Page overview (question saved)
      await page.waitForURL('**/questions')
      await runAccessibilityCheck(page, testInfo, 'page-overview-saved')

      // Step 11 – Fill required overview fields

      // get the top nav
      const nav = page.getByRole('navigation')
      await nav.getByRole('link', { name: 'Overview' }).click()
      await page.waitForURL('**/library/**')

      await test.step(' Form Overview – fill required fields', async () => {
        await page
          .getByRole('link', { name: 'Enter email address for support' })
          .click()
        await runAccessibilityCheck(page, testInfo, 'edit-contact-email')

        test.step('Fill form publish overview fields', async () => {
          await page
            .getByRole('textbox', { name: 'Email address' })
            .fill('support@defra.gov.uk')
          await page
            .getByRole('textbox', { name: 'Response time' })
            .fill('We aim to respond within 2 working days')
          await page.getByRole('button', { name: 'Save and continue' }).click()
        })

        // Step 11b – Submission guidance (what happens next)
        await page
          .getByRole('link', { name: 'Enter what happens next' })
          .click()
        await runAccessibilityCheck(page, testInfo, 'edit-submission-guidance')

        await page
          .getByRole('textbox', {
            name: 'What will happen after a user submits a form?'
          })
          .fill(
            "We'll send you an email to let you know the outcome. You'll usually get a response within 10 working days."
          )
        await page.getByRole('button', { name: 'Save and continue' }).click()

        // 11c – Privacy notice
        await page
          .getByRole('link', { name: 'Add privacy notice' })
          .click()          
        await runAccessibilityCheck(page, testInfo, 'edit-privacy-notice')

        await page
          .getByRole('radio', { name: 'Link to a privacy notice on GOV.UK' })
          .check()
        await page
          .getByRole('textbox', {
            name: 'Enter link'
          })
          .fill('https://www.gov.uk/help/privacy-notice')
        await page.getByRole('button', { name: 'Save and continue' }).click()

        // 11d – Notification email
        await page.getByRole('link', { name: 'Enter email address' }).click()
        await runAccessibilityCheck(page, testInfo, 'edit-notification-email')

        await page
          .getByRole('textbox', {
            name: 'What email address should submitted forms be sent to?'
          })
          .fill('submissions@defra.gov.uk')
        await page.getByRole('button', { name: 'Save and continue' }).click()

        // 11e: Enter phone number for support
        await page
          .getByRole('link', { name: 'Enter phone number for support' })
          .click()
        await page.waitForURL('**/contact/**')
        await runAccessibilityCheck(page, testInfo, 'edit-contact-phone')

        await page
          .getByRole('textbox', {
            name: 'phone'
          })
          .fill('01234 567890')
        await page.getByRole('button', { name: 'Save and continue' }).click()

        // Enter online contact link for support
        await page
          .getByRole('link', { name: 'Enter online contact link for support' })
          .click()
        await page.waitForURL('**/contact/**')
        await runAccessibilityCheck(page, testInfo, 'edit-contact-online')

        await page
          .getByRole('textbox', { name: 'Contact link', exact: true })
          .fill('https://www.defra.gov.uk/contact')
        await page
          .getByRole('textbox', { name: 'Text to describe the contact link' })
          .fill('Online contact form')
        await page.getByRole('button', { name: 'Save and continue' }).click()
        await page.waitForURL('**/library/**')

        // main overview page after filling all required fields
        await runAccessibilityCheck(
          page,
          testInfo,
          'form-overview-all-complete'
        )
      })
      // ── Step 13: Make draft live – confirmation page ───────────
      await page.getByRole('button', { name: 'Make draft live' }).click()
      await page.waitForURL('**/make-draft-live**')
      await runAccessibilityCheck(
        page,
        testInfo,
        'make-draft-live-confirmation'
      )

      // ── Step 14: Confirm publish ───────────────────────────────
      await page.getByRole('button', { name: 'Make draft live' }).click()

      // ── Step 15: Form overview – Live ──────────────────────────
      await page.waitForURL('**/library/**')
      await page.getByText('Live').first().waitFor()
      await runAccessibilityCheck(page, testInfo, 'form-overview-live')
    }
  )
})
