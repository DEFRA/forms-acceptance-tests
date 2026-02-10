import { test } from '~/fixtures/main.js'
import { runAccessibilityCheck } from './accessibilityChecker.js'

test.describe('Accessibility - forms-designer landing page', () => {
  test('landing page has no critical WCAG 2.2 AA violations', async ({
    app
  }, testInfo) => {
    const { libraryPage } = app
    await libraryPage.goto()
    await runAccessibilityCheck(
      libraryPage.page,
      testInfo,
      'forms-designer-landing-page'
    )
  })
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
  })
})
