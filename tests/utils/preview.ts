import { expect, type Page } from '@playwright/test'

/**
 * Returns the draft preview link from the form overview page. Call it from
 * any editor page of the form; it navigates to the overview to read the link.
 */
export async function getPreviewUrl(page: Page): Promise<string> {
  const base = page.url().split('/editor-v2')[0]
  await page.goto(base)
  const previewUrl = await page
    .locator('dt:has-text("Preview link") + dd a')
    .first()
    .getAttribute('href')
  expect(previewUrl).toBeTruthy()
  return previewUrl as string
}
