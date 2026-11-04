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
    const { allure } = await import('allure-playwright')
    // These values change every run. Excluding them keeps the test's Allure
    // history ID stable, so results still link across runs.
    await allure.parameter('createdForm', form.name, { excluded: true })
    if (form.url) {
      await allure.parameter('createdFormUrl', form.url, { excluded: true })
    }
  } catch {
    // noop
  }
}
