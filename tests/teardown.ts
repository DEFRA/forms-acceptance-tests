import { test as teardown } from '@playwright/test'

teardown('Clean up form', async () => {
  // eslint-disable-next-line no-console
  console.log('deleting draft form...')
  // TO-DO
  // use api to delete draft form instead of UI
})
