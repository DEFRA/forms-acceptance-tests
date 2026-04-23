import type { TestInfo } from '@playwright/test'

type CreatedFormMeta = {
  name: string
  url?: string
}

export async function recordCreatedForm(
  testInfo: TestInfo,
  form: CreatedFormMeta
) {
  const urlSuffix = form.url ? `\nURL: ${form.url}` : ''
  const body = `Created form: ${form.name}${urlSuffix}`

  testInfo.annotations.push({
    type: 'created-form',
    description: form.name
  })

  await testInfo.attach('created-form', {
    body: Buffer.from(body, 'utf-8'),
    contentType: 'text/plain'
  })

  // Best-effort: if allure-playwright is enabled, show it as a parameter too.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { allure } = require('allure-playwright')
    allure.parameter('createdForm', form.name)
    if (form.url) {
      allure.parameter('createdFormUrl', form.url)
    }
  } catch {
    // noop
  }
}

