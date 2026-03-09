import { test } from '~/fixtures/main.js'
import { runAccessibilityCheck } from '~/tests/2.Accessibility/accessibilityChecker.js'
import {
  DESIGNER_BASE_URL,
  DESIGNER_PAGES
} from '~/tests/2.Accessibility/constants.js'
import {
  assertHeadingHierarchy,
  assertNoHiddenFocusableElementsInTabOrder,
  assertNoOrphanedHeadingAnchors
} from '~/tests/2.Accessibility/customA11yAssertions.js'
import { expect } from '@playwright/test'

test.describe('Accessibility - designer pages', () => {
  for (const { path, description } of DESIGNER_PAGES) {
    test(
      `${description} page (${path}) has no WCAG 2.2 AA violations`,
      { tag: '@accessibility' },
      async ({ app }, testInfo) => {
        const { page } = app.libraryPage
        await page.goto(`${DESIGNER_BASE_URL}${path}`)
        // assert no orphans
        const orphanedAnchors = await assertNoOrphanedHeadingAnchors(page)
        expect(
          orphanedAnchors,
          'All heading anchors should have a corresponding heading'
        ).toEqual([])
        // run axe accessibility check
        await runAccessibilityCheck(
          page,
          testInfo,
          `designer-${description.toLowerCase().replaceAll(/\s+/g, '-')}`
        )
        await assertNoHiddenFocusableElementsInTabOrder(page)
        await assertHeadingHierarchy(page)
      }
    )
  }
})

test.describe('Accessibility - designer landing page without login', () => {
  test('Home page has no WCAG 2.2 AA violations for unauthenticated users', async ({
    browser
  }, testInfo) => {
    //fresh browser context to ensure no cached authentication state
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(`${DESIGNER_BASE_URL}/`)
    await runAccessibilityCheck(page, testInfo, 'designer-home-unauthenticated')
  })
})
