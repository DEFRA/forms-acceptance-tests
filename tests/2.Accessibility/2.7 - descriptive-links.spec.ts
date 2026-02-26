import { test } from '~/fixtures/main.js'
import { assertActionLinksHaveHiddenContext } from '~/tests/2.Accessibility/customA11yAssertions.js'

test.describe('Accessibility - descriptive action links', () => {
  test(
    'generic action links expose hidden descriptive text throughout create and editor journey',
    { tag: ['@accessibility', '@descriptive-links'] },
    async ({ app }) => {
      test.setTimeout(240_000)

      const { libraryPage } = app
      const { page } = libraryPage
      const formName = `A11y descriptive links ${Math.random().toString().slice(2, 8)}`

      await libraryPage.goto()
      await assertActionLinksHaveHiddenContext(page, 'Forms library')

      await libraryPage.clickCreateForm()
      await page.waitForURL('**/create/title')
      await assertActionLinksHaveHiddenContext(page, 'Create form - title')

      await page
        .getByRole('textbox', { name: 'Enter a name for your form' })
        .fill(formName)
      await page.getByRole('button', { name: 'Continue' }).click()

      await page.waitForURL('**/create/organisation')
      await assertActionLinksHaveHiddenContext(
        page,
        'Create form - organisation'
      )

      await page.getByRole('radio', { name: 'Defra' }).check()
      await page.getByRole('button', { name: 'Continue' }).click()

      await page.waitForURL('**/create/team')
      await assertActionLinksHaveHiddenContext(
        page,
        'Create form - team details'
      )

      await page
        .getByRole('textbox', { name: 'Name of team' })
        .fill('A11y QA Team')
      await page
        .getByRole('textbox', { name: 'Shared team email address' })
        .fill('a11y-qa@defra.gov.uk')
      await page.getByRole('button', { name: 'Save and continue' }).click()

      await page.waitForURL(/\/library\/[^/?#]+$/)
      await assertActionLinksHaveHiddenContext(page, 'Form overview')

      await page.getByRole('button', { name: 'Edit draft' }).click()
      await page.waitForURL('**/editor-v2/pages**')
      await assertActionLinksHaveHiddenContext(
        page,
        'Editor - add and edit pages'
      )

      await page.getByRole('button', { name: 'Add new page' }).click()
      await page.waitForURL('**/editor-v2/page')
      await assertActionLinksHaveHiddenContext(
        page,
        'Editor - choose page type'
      )

      await page.getByRole('radio', { name: 'Question page' }).check()
      await page.getByRole('button', { name: 'Save and continue' }).click()

      await page.waitForURL('**/question/**/type/**')
      await assertActionLinksHaveHiddenContext(
        page,
        'Editor - choose question type'
      )

      await page.getByRole('radio', { name: 'Written answer' }).check()
      await page
        .getByRole('radio', { name: 'Short answer (a single line)' })
        .check()
      await page.getByRole('button', { name: 'Save and continue' }).click()

      await page.waitForURL('**/question/**/details/**')
      await assertActionLinksHaveHiddenContext(
        page,
        'Editor - question details'
      )

      await page.locator('#question').fill('What is your name?')
      await page
        .getByRole('textbox', { name: 'Short description' })
        .fill('Your name')
      await page.getByRole('button', { name: 'Save and continue' }).click()

      await page.waitForURL('**/questions')
      await assertActionLinksHaveHiddenContext(page, 'Editor - page overview')

      await page
        .getByRole('navigation')
        .getByRole('link', { name: 'Editor' })
        .click()
      await page.waitForURL('**/editor-v2/pages**')
      await page
        .getByRole('link', { name: 'Edit (Check your answers)' })
        .click()
      await page.waitForURL('**/check-answers-settings')
      await assertActionLinksHaveHiddenContext(
        page,
        'Check answers settings - overview'
      )

      await page.getByRole('link', { name: 'Sections', exact: true }).click()
      await page.waitForURL('**/check-answers-settings/sections')
      await assertActionLinksHaveHiddenContext(
        page,
        'Check answers settings - sections'
      )

      // create new sections and check action links on the new section
      await page
        .getByRole('textbox', { name: 'Section heading' })
        .fill('Section One')
      await page.getByRole('button', { name: '+ Add section heading' }).click()
      await page
        .getByRole('heading', { name: 'Section 1: Section One' })
        .waitFor({ state: 'visible' })
      await assertActionLinksHaveHiddenContext(
        page,
        'Check answers settings - section one'
      )
      await page
        .getByRole('textbox', { name: 'Section heading' })
        .fill('Section Two')
      await page.getByRole('button', { name: '+ Add section heading' }).click()
      await page
        .getByRole('heading', { name: 'Section 2: Section Two' })
        .waitFor({ state: 'visible' })
      await assertActionLinksHaveHiddenContext(
        page,
        'Check answers settings - section two'
      )
      // sections reorder page
      await page
        .getByRole('button', { name: 'Re-order sections', exact: true })
        .click()
      await page.waitForURL('**/sections-reorder')
      await assertActionLinksHaveHiddenContext(
        page,
        'Check answers settings - sections reorder'
      )

      await page
        .getByRole('button', { name: 'Save changes', exact: true })
        .click()

      // Page Overview
      await page
        .getByRole('link', { name: 'Page overview', exact: true })
        .click()
      await page
        .getByRole('heading', { name: 'Check answers page overview' })
        .waitFor({ state: 'visible' })
      await assertActionLinksHaveHiddenContext(
        page,
        'Check answers settings - page overview'
      )

      //
    }
  )
})
