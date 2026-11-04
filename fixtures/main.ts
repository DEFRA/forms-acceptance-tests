import { test as base, expect } from '@playwright/test'
import { Application } from '~/application.js'
import { KNOWN_ERROR_HEADINGS } from '~/tests/utils/raceAgainstAccessDenied.js'

const FAIL_FAST_TIMEOUT_MS = 3000

type Fixtures = {
  app: Application
}

export const test = base.extend<Fixtures>({
  page: async ({ page }, use, testInfo) => {
    // The Designer app can silently swap to a top-level error screen mid-test
    // (session/auth lost, or a generic server error). Without this, whatever
    // action happens to be running when that occurs just hangs for its full
    // ambient timeout instead of failing with a clear reason. We can't
    // interrupt an action already in flight, but once this fires, every
    // subsequent action in the test fails fast instead of also riding a
    // long timeout.
    let flagged = false
    page.on('framenavigated', (frame) => {
      if (flagged || frame !== page.mainFrame()) return
      Promise.all(
        KNOWN_ERROR_HEADINGS.map((heading) =>
          page.getByRole('heading', { name: heading }).isVisible()
        )
      )
        .then((results) => {
          const matchedIndex = results.findIndex(Boolean)
          if (matchedIndex === -1 || flagged) return
          flagged = true
          testInfo.annotations.push({
            type: 'issue',
            description: `Session lost mid-test — redirected to "${KNOWN_ERROR_HEADINGS[matchedIndex]}"`
          })
          page.setDefaultTimeout(FAIL_FAST_TIMEOUT_MS)
        })
        .catch(() => {})
    })
    await use(page)
  },

  app: async ({ page }, use) => {
    const app = new Application(page)
    await use(app)
  }
})

export { expect }
