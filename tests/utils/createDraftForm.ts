import { randomUUID } from 'node:crypto'
import type { Page, TestInfo } from '@playwright/test'
import { FormPage } from '~/pages/FormPage.js'
import { recordCreatedForm } from '~/tests/utils/reporting.js'

export type CreateDraftFormOptions = {
  formNamePrefix?: string
  organisation?: string
  teamName?: string
  teamEmail?: string
}

/**
 * Creates a new form using the standard journey and leaves the browser on its
 * draft editor. This keeps forms independent and records their details.
 */
export async function createDraftForm(
  page: Page,
  testInfo: TestInfo,
  {
    formNamePrefix = 'Automated test - Playwright form',
    organisation = 'Environment Agency',
    teamName = 'Team A',
    teamEmail = 'test@test.gov.uk'
  }: CreateDraftFormOptions = {}
) {
  const formPage = new FormPage(page)
  const formName = `${formNamePrefix} ${randomUUID()}`

  await formPage.goTo()
  await formPage.enterFormName(formName)
  await formPage.selectRadioOption(organisation)
  await formPage.fillTeamDetails(teamName, teamEmail)
  await formPage.editDraft()

  await recordCreatedForm(testInfo, { name: formName, url: page.url() })

  return { formName, formPage }
}
