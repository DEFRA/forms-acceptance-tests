import { test as baseTest, expect } from '@playwright/test'
import { FormPage } from '~/pages/FormPage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { SelectQuestionTypePage } from '~/pages/SelectQuestionTypePage.js'
import { PageOverview } from '~/pages/PageOverview.js'
import { EditQuestionPage } from '~/pages/EditQuestionPage.js'

type MyFixtures = {
  formPage: FormPage
  selectPageTypePage: SelectPageTypePage
  selectQuestionTypePage: SelectQuestionTypePage
  pageOverview: PageOverview
  editQuestionPage: EditQuestionPage
}

const test = baseTest.extend<MyFixtures>({
  formPage: async ({ page }, use) => {
    const formPage = new FormPage(page)
    await formPage.goTo()
    const form_name =
      'Automated test - Playwright form ' +
      Math.random().toString().substring(0, 10)
    await formPage.enterFormName(form_name)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

    // Edit draft
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
  },

  editQuestionPage: async ({ page }, use) => {
    const editQuestionPage = new EditQuestionPage(page)
    await use(editQuestionPage)
  }
})

test('1.2.15.1 - should create a new form with Easting and Northing field', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await formPage.addNewPageButton.click()

  await selectPageTypePage.choosePageType('question')

  await selectQuestionTypePage.selectQuestionType('location')
  await selectQuestionTypePage.selectSubtype('eastingNorthing')
  await selectQuestionTypePage.clickSaveAndContinue()

  await formPage.createWrittenAnswer(
    'What is the location?',
    'easting-northing'
  )

  await pageOverview.verifySuccessBanner('Changes saved successfully')
  await pageOverview.verifyPageHeading('Page 1')

  await pageOverview.clickChangeLinkForQuestionByName('What is the location?')

  await editQuestionPage.fillQuestionDetails(
    'Enter the site location',
    'For example. Easting: 248741, Northing: 63688',
    'Site location'
  )

  await editQuestionPage.setOptionalCheckbox(true)
  await editQuestionPage.setGiveInstructionsCheckbox(true)

  await editQuestionPage.clickSaveAndContinue()

  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await pageOverview.clickChangeLinkForQuestionByName('Enter the site location')
  await expect(editQuestionPage.optionalCheckbox).toBeChecked()
  await expect(editQuestionPage.giveInstructionsCheckbox).toBeChecked()
})

test('1.2.15.2 - should create a new form with Latitude and Longitude field', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await formPage.addNewPageButton.click()

  await selectPageTypePage.choosePageType('question')

  await selectQuestionTypePage.selectQuestionType('location')
  await selectQuestionTypePage.selectSubtype('latitudeLongitude')
  await selectQuestionTypePage.clickSaveAndContinue()

  await formPage.createWrittenAnswer('Enter coordinates', 'lat-long')

  await pageOverview.verifySuccessBanner('Changes saved successfully')
  await pageOverview.verifyPageHeading('Page 1')

  await pageOverview.clickChangeLinkForQuestionByName('Enter coordinates')

  await editQuestionPage.fillQuestionDetails(
    'What are the site coordinates?',
    'For example. Latitude: 52.123456, Longitude: -1.234567',
    'Site coordinates'
  )

  await editQuestionPage.setOptionalCheckbox(true)
  await editQuestionPage.setGiveInstructionsCheckbox(true)

  await editQuestionPage.clickSaveAndContinue()

  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await pageOverview.clickChangeLinkForQuestionByName(
    'What are the site coordinates?'
  )
  await expect(editQuestionPage.optionalCheckbox).toBeChecked()
  await expect(editQuestionPage.giveInstructionsCheckbox).toBeChecked()
})

test('1.2.15.3 - should create a new form with OS Grid Reference field', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await formPage.addNewPageButton.click()

  await selectPageTypePage.choosePageType('question')

  await selectQuestionTypePage.selectQuestionType('location')
  await selectQuestionTypePage.selectSubtype('osGridReference')
  await selectQuestionTypePage.clickSaveAndContinue()

  await formPage.createWrittenAnswer('Enter OS grid reference', 'os-grid-ref')

  await pageOverview.verifySuccessBanner('Changes saved successfully')
  await pageOverview.verifyPageHeading('Page 1')

  await pageOverview.clickChangeLinkForQuestionByName('Enter OS grid reference')

  await editQuestionPage.fillQuestionDetails(
    'Provide the OS grid reference',
    'For example. SK 123 456 or SK123456',
    'OS grid reference'
  )

  await editQuestionPage.setOptionalCheckbox(true)
  await editQuestionPage.setGiveInstructionsCheckbox(true)

  await editQuestionPage.clickSaveAndContinue()

  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await pageOverview.clickChangeLinkForQuestionByName(
    'Provide the OS grid reference'
  )
  await expect(editQuestionPage.optionalCheckbox).toBeChecked()
  await expect(editQuestionPage.giveInstructionsCheckbox).toBeChecked()
})

test('1.2.15.4 - should create a new form with National Grid field number', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  await formPage.addNewPageButton.click()

  await selectPageTypePage.choosePageType('question')

  await selectQuestionTypePage.selectQuestionType('location')
  await selectQuestionTypePage.selectSubtype('nationalGridFieldNumber')
  await selectQuestionTypePage.clickSaveAndContinue()

  await formPage.createWrittenAnswer(
    'Enter National Grid field number',
    'national-grid-field'
  )

  await pageOverview.verifySuccessBanner('Changes saved successfully')
  await pageOverview.verifyPageHeading('Page 1')

  await pageOverview.clickChangeLinkForQuestionByName(
    'Enter National Grid field number'
  )

  await editQuestionPage.fillQuestionDetails(
    'What is the National Grid field number?',
    'For example. NT123456 or a 2-letter, 6-digit code',
    'National Grid field number'
  )

  await editQuestionPage.setOptionalCheckbox(true)
  await editQuestionPage.setGiveInstructionsCheckbox(true)

  await editQuestionPage.clickSaveAndContinue()

  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await pageOverview.clickChangeLinkForQuestionByName(
    'What is the National Grid field number?'
  )
  await expect(editQuestionPage.optionalCheckbox).toBeChecked()
  await expect(editQuestionPage.giveInstructionsCheckbox).toBeChecked()
})
