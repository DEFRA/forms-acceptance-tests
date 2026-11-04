import type { Page } from '@playwright/test'

// Two distinct top-level error screens the app can silently swap to
// mid-test: an access-denied redirect (session/auth lost) and a generic
// server error. Both mean the expected page is gone, so both warrant the
// same fast-fail treatment.
export const KNOWN_ERROR_HEADINGS = [
  'You do not have access to this service',
  'Sorry, there is a problem with the service'
]

/**
 * Races an action against one of the app's known top-level error screens
 * appearing. If the session was invalidated, or the server errored, mid-test
 * and the app silently swapped to one of these screens, this fails
 * immediately with a clear reason instead of hanging for the full test
 * timeout on an element that no longer exists on the page.
 */
export async function raceAgainstAccessDenied<T>(
  page: Page,
  action: () => Promise<T>
): Promise<T> {
  return Promise.race([
    action(),
    ...KNOWN_ERROR_HEADINGS.map((heading) =>
      page
        .getByRole('heading', { name: heading })
        .waitFor({ state: 'visible' })
        .then((): never => {
          throw new Error(`Session lost mid-test — redirected to "${heading}"`)
        })
    )
  ])
}
