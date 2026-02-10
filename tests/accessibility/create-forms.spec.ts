import { test } from '~/fixtures/main.js'
import { runAccessibilityCheck } from './accessibilityChecker.js'

test.describe('Accessibility - forms-designer create form journey', () => {
  test('create form page has no critical WCAG 2.2 AA violations', async ({
    app
  }, testInfo) => {
    const { libraryPage } = app
    await libraryPage.goto()
    await libraryPage.clickCreateForm()
    // run for the form page
    await runAccessibilityCheck(
      libraryPage.page,
      testInfo,
      'forms-designer-create-form'
    )

    // click on continue to check any accessibility issues
    const { page } = libraryPage
    await page.getByRole('button', { name: 'Continue' }).click()
    await runAccessibilityCheck(
      page,
      testInfo,
      'forms-designer-create-form-continue'
    )
  })
})
