import { test } from '~/fixtures/main.js'
import { runAccessibilityCheck } from './accessibilityChecker.js'
import { DESIGNER_BASE_URL, DESIGNER_PAGES } from './constants.js'

test.describe('Accessibility - designer pages', () => {
  for (const { path, description } of DESIGNER_PAGES) {
    test(
      `${description} page (${path}) has no WCAG 2.2 AA violations`,
      { tag: '@accessibility' },
      async ({ app }, testInfo) => {
        const { page } = app.libraryPage
        await page.goto(`${DESIGNER_BASE_URL}${path}`)
        await runAccessibilityCheck(
          page,
          testInfo,
          `designer-${description.toLowerCase().replace(/\s+/g, '-')}`
        )
      }
    )
  }
})
