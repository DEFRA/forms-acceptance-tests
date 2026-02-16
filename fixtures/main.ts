import { test as base } from '@playwright/test'
import { Application } from '~/application.js'

type Fixtures = {
  app: Application
}

export const test = base.extend<Fixtures>({
  app: async ({ page }, use) => {
    const app = new Application(page) 
    await use(app)
  }
})
