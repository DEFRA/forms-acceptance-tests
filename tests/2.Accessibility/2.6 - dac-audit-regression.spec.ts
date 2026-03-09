import { expect } from '@playwright/test'
import { test } from '~/fixtures/main.js'
import { runAccessibilityCheck } from './accessibilityChecker.js'
import {
  assertHeadingHierarchy,
  assertNoHiddenFocusableElementsInTabOrder,
  assertSkipLinkWorks
} from './customA11yAssertions.js'
import { DESIGNER_BASE_URL } from './constants.js'

test.describe('Accessibility - DAC audit regression coverage', () => {
  test(
    'skip link and main-content targeting works',
    { tag: ['@accessibility', '@dac-regression'] },
    async ({ app }, testInfo) => {
      const { page } = app.libraryPage

      await page.goto(`${DESIGNER_BASE_URL}library`)
      await runAccessibilityCheck(
        page,
        testInfo,
        'dac-regression-library-skip-link'
      )
      await assertSkipLinkWorks(page)
      await assertNoHiddenFocusableElementsInTabOrder(page)
      await assertHeadingHierarchy(page)
    }
  )

  test(
    'condition and question editor pages keep semantic/focus integrity',
    { tag: ['@accessibility', '@dac-regression'] },
    async ({ app }, testInfo) => {
      const { libraryPage } = app
      const { page } = libraryPage

      await libraryPage.goto()
      await libraryPage.clickCreateForm()

      const formName = `DAC regression ${Math.random().toString(36).slice(2, 8)}`

      await page
        .getByRole('textbox', { name: 'Enter a name for your form' })
        .fill(formName)
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('radio', { name: 'Defra' }).check()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('textbox', { name: 'Name of team' }).fill('DAC Team')
      await page
        .getByRole('textbox', { name: 'Shared team email address' })
        .fill('dac-team@defra.gov.uk')
      await page.getByRole('button', { name: 'Save and continue' }).click()

      const overviewUrl = page.url()
      const slugMatch = overviewUrl.match(/\/library\/([^/?#]+)/)
      expect(
        slugMatch,
        'Unable to derive form slug from overview URL'
      ).toBeTruthy()
      const slug = slugMatch![1]

      await page.goto(
        `${DESIGNER_BASE_URL}library/${slug}/editor-v2/conditions`
      )
      await runAccessibilityCheck(page, testInfo, 'dac-regression-conditions')
      await assertHeadingHierarchy(page, { requireSingleH1: true })

      await expect(
        page.getByRole('heading', { level: 2, name: 'All conditions' }),
        'All conditions section should be programmatically exposed as h2'
      ).toBeVisible()

      await page.getByRole('link', { name: 'Create new condition' }).click()
      await runAccessibilityCheck(
        page,
        testInfo,
        'dac-regression-create-condition'
      )
      await assertHeadingHierarchy(page, { requireSingleH1: true })

      await page.goto(`${DESIGNER_BASE_URL}library/${slug}/editor-v2/page`)
      await page.getByRole('radio', { name: 'Question page' }).check()
      await page.getByRole('button', { name: 'Save and continue' }).click()
      await page.getByRole('radio', { name: 'Written answer' }).check()
      await page
        .getByRole('radio', { name: 'Short answer (a single line)' })
        .check()
      await assertHeadingHierarchy(page)
      await page.getByRole('button', { name: 'Save and continue' }).click()

      await runAccessibilityCheck(
        page,
        testInfo,
        'dac-regression-question-details'
      )
      await assertNoHiddenFocusableElementsInTabOrder(page, { maxTabs: 20 })
    }
  )
})
