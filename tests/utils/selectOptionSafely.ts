import type { Locator, Page } from '@playwright/test'
import { raceAgainstAccessDenied } from '~/tests/utils/raceAgainstAccessDenied.js'

/**
 * Selects a dropdown option, but races it against the app's access-denied
 * screen appearing. If the session was invalidated mid-test and the app
 * silently redirected there, this fails immediately with a clear reason
 * instead of hanging for the full test timeout on a <select> that no longer
 * exists on the page.
 */
export async function selectOptionOrFailFast(
  page: Page,
  select: Locator,
  option: Parameters<Locator['selectOption']>[0]
) {
  await raceAgainstAccessDenied(page, () => select.selectOption(option))
}
