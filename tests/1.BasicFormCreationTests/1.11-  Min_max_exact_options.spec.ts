import { test as baseTest, expect } from '@playwright/test'
import { FormPage } from '~/pages/FormPage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { SelectQuestionTypePage } from '~/pages/SelectQuestionTypePage.js'
import { PageOverview } from '~/pages/PageOverview.js'

type MyFixtures = {
  formPage: FormPage
  selectPageTypePage: SelectPageTypePage
  selectQuestionTypePage: SelectQuestionTypePage
  pageOverview: PageOverview
}

const test = baseTest.extend<MyFixtures>({
  formPage: async ({ page }, use) => {
    const formPage = new FormPage(page)
    await formPage.goTo()
    const formName =
      'Automated test - Playwright form ' +
      Math.random().toString().substring(0, 10)
    await formPage.enterFormName(formName)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')
    await formPage.editDraft()
    await use(formPage)
  },

  selectPageTypePage: async ({ page }, use) => {
    const selectPageTypePage = new SelectPageTypePage(page)
    await use(selectPageTypePage)
  },

  selectQuestionTypePage: async ({ page }, use) => {
    const selectQuestionTypePage = new SelectQuestionTypePage(page)
    await use(selectQuestionTypePage)
  },

  pageOverview: async ({ page }, use) => {
    const pageOverview = new PageOverview(page)
    await use(pageOverview)
  }
})

test('1.11 - should allow minimum and maximum month year values', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  page
}) => {
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('date')
  await selectQuestionTypePage.selectSubtype('monthYear')
  await selectQuestionTypePage.clickSaveAndContinue()

  await formPage.createWrittenAnswer('When did you enter UK', 'date of entry')
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await pageOverview.clickChangeLinkForQuestionByName('When did you enter UK')
  await page.getByText('Additional settings (optional)').click()

  const firstDate = page
    .locator('fieldset')
    .filter({ hasText: 'First date' })
    .first()
  const secondDate = page
    .locator('fieldset')
    .filter({ hasText: 'Second date' })
    .first()

  await expect(
    page.getByText('If the date must be between two dates (optional)')
  ).toBeVisible()
  await expect(page.getByText('First date')).toBeVisible()
  await expect(page.getByText('Second date')).toBeVisible()

  await firstDate.getByLabel('Month').fill('1')
  await firstDate.getByLabel('Year').fill('2020')
  await secondDate.getByLabel('Month').fill('12')
  await secondDate.getByLabel('Year').fill('2024')

  await page.getByRole('button', { name: 'Save and continue' }).click()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await pageOverview.clickChangeLinkForQuestionByName('When did you enter UK')
  await page.getByText('Additional settings (optional)').click()

  await expect(firstDate.getByLabel('Month')).toHaveValue('01')
  await expect(firstDate.getByLabel('Year')).toHaveValue('2020')
  await expect(secondDate.getByLabel('Month')).toHaveValue('12')
  await expect(secondDate.getByLabel('Year')).toHaveValue('2024')
})

test('1.11a - should allow minimum and maximum date month year values', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  page
}) => {
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('date')
  await selectQuestionTypePage.selectSubtype('dateMonthYear')
  await selectQuestionTypePage.clickSaveAndContinue()

  await formPage.createWrittenAnswer('What date did you start?', 'start date')
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await pageOverview.clickChangeLinkForQuestionByName(
    'What date did you start?'
  )
  await page.getByText('Additional settings (optional)').click()

  const firstDate = page
    .locator('fieldset')
    .filter({ hasText: 'First date' })
    .first()
  const secondDate = page
    .locator('fieldset')
    .filter({ hasText: 'Second date' })
    .first()

  await firstDate.getByLabel('Day').fill('05')
  await firstDate.getByLabel('Month').fill('2')
  await firstDate.getByLabel('Year').fill('2020')
  await secondDate.getByLabel('Day').fill('15')
  await secondDate.getByLabel('Month').fill('11')
  await secondDate.getByLabel('Year').fill('2024')

  await page.getByRole('button', { name: 'Save and continue' }).click()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await pageOverview.clickChangeLinkForQuestionByName(
    'What date did you start?'
  )
  await page.getByText('Additional settings (optional)').click()

  await expect(firstDate.getByLabel('Day')).toHaveValue('05')
  await expect(firstDate.getByLabel('Month')).toHaveValue('02')
  await expect(firstDate.getByLabel('Year')).toHaveValue('2020')
  await expect(secondDate.getByLabel('Day')).toHaveValue('15')
  await expect(secondDate.getByLabel('Month')).toHaveValue('11')
  await expect(secondDate.getByLabel('Year')).toHaveValue('2024')
})

// Max days in the past / future tests
test('1.11c - should allow maximum days in the past and maximum days in the future (optional) for day/month/year', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  page
}) => {
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('date')
  await selectQuestionTypePage.selectSubtype('dateMonthYear')
  await selectQuestionTypePage.clickSaveAndContinue()

  await formPage.createWrittenAnswer('When did the event happen?', 'event date')
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await pageOverview.clickChangeLinkForQuestionByName(
    'When did the event happen?'
  )
  await page.getByText('Additional settings (optional)').click()

  // Use the visible labels for these fields and fill them
  const maxPastField = page.getByLabel('Max days in the past (optional)')
  const maxFutureField = page.getByLabel('Max days in the future (optional)')

  await maxPastField.fill('30')
  await maxFutureField.fill('60')

  await page.getByRole('button', { name: 'Save and continue' }).click()
  await pageOverview.verifySuccessBanner('Changes saved successfully')

  // Re-open and verify persisted values
  await pageOverview.clickChangeLinkForQuestionByName(
    'When did the event happen?'
  )
  await page.getByText('Additional settings (optional)').click()

  await expect(page.getByLabel('Max days in the past (optional)')).toHaveValue(
    '30'
  )
  await expect(
    page.getByLabel('Max days in the future (optional)')
  ).toHaveValue('60')
})
