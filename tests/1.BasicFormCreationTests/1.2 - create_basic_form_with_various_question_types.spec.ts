import { test as baseTest, expect } from '@playwright/test'
import { FormPage } from '~/pages/FormPage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { SelectQuestionTypePage } from '~/pages/SelectQuestionTypePage.js'
import { PageOverview } from '~/pages/PageOverview.js'
import { faker } from '@faker-js/faker/locale/en'
import { EditQuestionPage } from '~/pages/EditQuestionPage.js'
import { GuidancePage } from '~/pages/GuidancePage.js'

// Declare the types of your fixtures
type MyFixtures = {
  formPage: FormPage
  selectPageTypePage: SelectPageTypePage
  selectQuestionTypePage: SelectQuestionTypePage
  pageOverview: PageOverview
  editQuestionPage: EditQuestionPage
  guidancePage: GuidancePage
}

// Rename the extended test object to avoid conflicts
const test = baseTest.extend<MyFixtures>({
  formPage: async ({ page }, use) => {
    const formPage = new FormPage(page) // Initialize FormPage using the page object
    await formPage.goTo()
    const form_name = formPage.generateNewFormName()
      
    console.log('---form name ---', form_name)
    await formPage.enterFormName(form_name)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')

    // Edit draft
    await formPage.waitUntilReady()
    await formPage.editDraft()

    await use(formPage) // Provide the fixture for use in tests
  },

  selectPageTypePage: async ({ page }, use) => {
    const selectPageTypePage = new SelectPageTypePage(page) // Initialize SelectPageTypePage
    await use(selectPageTypePage) // Provide the fixture for use in tests
  },

  selectQuestionTypePage: async ({ page }, use) => {
    const selectQuestionTypePage = new SelectQuestionTypePage(page) // Initialize SelectQuestionTypePage
    await use(selectQuestionTypePage) // Provide the fixture for use in tests
  },

  pageOverview: async ({ page }, use) => {
    const pageOverview = new PageOverview(page) // Initialize PageOverview
    await use(pageOverview) // Provide the fixture for use in tests
  },

  editQuestionPage: async ({ page }, use) => {
    const editQuestionPage = new EditQuestionPage(page)
    await use(editQuestionPage)
  },
  guidancePage: async ({ page }, use) => {
    const guidancePage = new GuidancePage(page)
    await use(guidancePage)
  }
})

test.beforeEach(async({ page }) => {
  await page.context().clearCookies({ name: 'formsSession' })
})

test('1.2.1 - should create a new form with short answer field', async ({
  formPage,
  selectQuestionTypePage,
  pageOverview,
  selectPageTypePage,
  editQuestionPage
}) => {
  // Add a new page
  await formPage.clickAddNewPage()
  // Select Question Page type
  await selectPageTypePage.choosePageType('question')

  // Select Question Type
  await selectQuestionTypePage.selectQuestionType('writtenAnswer')
  await selectQuestionTypePage.selectSubtype('shortAnswer')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Configure the question
  await formPage.createWrittenAnswer('What is your name?', 'Your name')
  await pageOverview.verifySuccessBanner('Changes saved successfully')
  await pageOverview.verifyPageHeading('Page 1')

  //check change question
  await pageOverview.clickChangeLinkForQuestionByName('What is your name?')

  // Use EditQuestionPage to modify the question
  await editQuestionPage.fillQuestionDetails(
    'What is your full name?',
    'Enter your full name',
    'Full name'
  )
  await editQuestionPage.clickSaveAndContinue()

  // Verify the changes
  await pageOverview.verifySuccessBanner('Changes saved successfully')
})

test('1.2.2 - should create a new form with long answer field', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview
}) => {
  // Add a new page
  await formPage.clickAddNewPage()

  // Select Question Page type
  await selectPageTypePage.choosePageType('question')

  // Select Written Answer question type
  await selectQuestionTypePage.selectQuestionType('writtenAnswer')
  await selectQuestionTypePage.selectSubtype('longAnswer')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Configure the question
  await formPage.createWrittenAnswer(
    'Tell us about yourself',
    faker.lorem.paragraph()
  )

  // Verify success banner
  expect(await pageOverview.verifySuccessBanner('Changes saved successfully'))

  //check edit question preview panel - with JS off preview
})

test('1.2.3 - should create a new form with number field', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview
}) => {
  // Add a new page
  await formPage.clickAddNewPage()

  // Select Question Page type
  await selectPageTypePage.choosePageType('question')

  // Select Written Answer question type
  await selectQuestionTypePage.selectQuestionType('writtenAnswer')
  await selectQuestionTypePage.selectSubtype('numbersOnly')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Configure the question
  await formPage.createWrittenAnswer('How old are you?', 'age')

  // Verify success banner
  // expect(await pageOverview.verifySuccessBanner('Changes saved successfully'))
})

test('1.2.4 - should create a new form with full date field', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview
}) => {
  // Add a new page
  await formPage.clickAddNewPage()

  // Select Question Page type
  await selectPageTypePage.choosePageType('question')

  // Select Written Answer question type
  await selectQuestionTypePage.selectQuestionType('date')
  await selectQuestionTypePage.selectSubtype('dateMonthYear')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Configure the question
  await formPage.createWrittenAnswer('Your date of birth', 'date of birth')

  // Verify success banner
  expect(await pageOverview.verifySuccessBanner('Changes saved successfully'))
})

test('1.2.5 - should create a new form with Month Year field', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview
}) => {
  // Add a new page
  await formPage.clickAddNewPage()

  // Select Question Page type
  await selectPageTypePage.choosePageType('question')

  // Select Written Answer question type
  await selectQuestionTypePage.selectQuestionType('date')
  await selectQuestionTypePage.selectSubtype('monthYear')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Configure the question
  await formPage.createWrittenAnswer('When did you enter UK', 'date of entry')

  // Verify success banner
  expect(await pageOverview.verifySuccessBanner('Changes saved successfully'))
})

test('1.2.6 - should create a new form with UK address field', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview
}) => {
  // Add a new page
  await formPage.clickAddNewPage()

  // Select Question Page type
  await selectPageTypePage.choosePageType('question')

  // Select Written Answer question type
  await selectQuestionTypePage.selectQuestionType('ukAddress')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Configure the question
  await formPage.createWrittenAnswer('Where do you live?', 'address')

  // Verify success banner
  expect(await pageOverview.verifySuccessBanner('Changes saved successfully'))
})

test('1.2.7 - should create a new form with Phone number field', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview
}) => {
  // Add a new page
  await formPage.clickAddNewPage()

  // Select Question Page type
  await selectPageTypePage.choosePageType('question')

  // Select Written Answer question type
  await selectQuestionTypePage.selectQuestionType('phoneNumber')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Configure the question
  await formPage.createWrittenAnswer(
    'What is your contact telephone number',
    'telephone'
  )

  // Verify success banner
  expect(await pageOverview.verifySuccessBanner('Changes saved successfully'))
})

test('1.2.8 - should create a new form with File Upload field', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview
}) => {
  // Add a new page
  await formPage.clickAddNewPage()

  // Select Question Page type
  await selectPageTypePage.choosePageType('question')

  // Select Written Answer question type
  await selectQuestionTypePage.selectQuestionType('fileUpload')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Configure the question
  await formPage.createFileUpload(
    'Proof of address',
    'We need proof of address'
  )

  await pageOverview.waitUntilReady()
  // Verify success banner
  expect(await pageOverview.verifySuccessBanner('Changes saved successfully'))
})

test('1.2.9 - should create a new form with Email field', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview
}) => {
  // Add a new page
  await formPage.clickAddNewPage()

  // Select Question Page type
  await selectPageTypePage.choosePageType('question')

  // Select Written Answer question type
  await selectQuestionTypePage.selectQuestionType('emailAddress')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Configure the question
  await formPage.createWrittenAnswer('What is your email address?', 'email')

  // Verify success banner
  expect(await pageOverview.verifySuccessBanner('Changes saved successfully'))
})

test('1.2.10 - should create a new form with Yes/No field', async ({
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview
}) => {
  // Add a new page
  await formPage.clickAddNewPage()

  // Select Question Page type
  await selectPageTypePage.choosePageType('question')

  // Select Written Answer question type
  await selectQuestionTypePage.selectQuestionType('list')
  await selectQuestionTypePage.selectSubtype('yesNo')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Configure the question
  await formPage.createWrittenAnswer('Are you over 18?', 'over 18')

  // Verify success banner
  expect(await pageOverview.verifySuccessBanner('Changes saved successfully'))
})

test.skip('1.2.11 - should create a new form with Checkbox field', async ({
  formPage,
  pageOverview,
  selectPageTypePage,
  selectQuestionTypePage,
  editQuestionPage
}) => {
  // Add a new page
  await formPage.clickAddNewPage()

  // Select Question Page type
  await selectPageTypePage.choosePageType('question')

  // Select Written Answer question type
  await selectQuestionTypePage.selectQuestionType('list')
  await selectQuestionTypePage.selectSubtype('checkboxes')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Configure the question
  await formPage.createWrittenAnswer('Select your interests', 'interests')
  const error = await formPage.getErrorMessage()
  expect(error).toContain('At least 2 items are required for a list')

  //add fruits to item list
  const fruits = ['apple', 'banana', 'grapes']
  await editQuestionPage.addListItems(fruits)
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.successBannerIsDisplayed()
  await pageOverview.clickChangeLinkForQuestionByName('Select your interests')

  //assert lis items
  await editQuestionPage.getPageHeadingText()
  const actualListItems = await editQuestionPage.getListItems()
  expect(actualListItems).toEqual(fruits)
})

test.skip('1.2.12 - should create a new form with Select field', async ({
  formPage,
  pageOverview,
  selectPageTypePage,
  selectQuestionTypePage,
  editQuestionPage
}) => {
  // Add a new page
  await formPage.clickAddNewPage()

  // Select Question Page type
  await selectPageTypePage.choosePageType('question')

  // Select List question type and Autocomplete (Select) subtype
  await selectQuestionTypePage.selectQuestionType('list')
  await selectQuestionTypePage.selectSubtype('select')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Configure the question
  await formPage.createWrittenAnswer('Select your country', 'country')
  const error = await formPage.getErrorMessage()
  expect(error).toContain('At least 2 items are required for a list')

  // Add options to item list
  const options = ['England', 'Scotland', 'Wales', 'Northern Ireland']
  await editQuestionPage.addListItems(options)
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.successBannerIsDisplayed()
  await pageOverview.clickChangeLinkForQuestionByName('Select your country')

  // Assert list items
  await editQuestionPage.getPageHeadingText()
  const actualListItems = await editQuestionPage.getListItems()
  expect(actualListItems).toEqual(options)
})

test('1.2.13 - should create a new form with Declaration', async ({
  formPage,
  pageOverview,
  selectPageTypePage,
  selectQuestionTypePage,
  editQuestionPage
}) => {
  // Add a new page
  await formPage.clickAddNewPage()

  // Select Question Page type
  await selectPageTypePage.waitUntilReady()
  await selectPageTypePage.choosePageType('question')

  // Select Written Answer question type
  await selectQuestionTypePage.waitUntilReady()
  await selectQuestionTypePage.selectQuestionType('declaration')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Configure the question
  await formPage.createWrittenAnswer('This is a declaration', 'declaration')
  const error = await formPage.getErrorMessage()
  expect(error).toContain('Enter declaration text')

  //enter declaration text
  await editQuestionPage.enterDeclarationText('You must agree to this declaration')
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.successBannerIsDisplayed()
  await pageOverview.clickChangeLinkForQuestionByName('This is a declaration')

  //assert declaration text
  await editQuestionPage.getPageHeadingText()
  await expect(editQuestionPage.declarationTextInput).toHaveValue('You must agree to this declaration')
})

test('1.2.14 - should create a new form with guidance page', async ({
  formPage,
  pageOverview,
  selectPageTypePage,
  selectQuestionTypePage,
  editQuestionPage,
  guidancePage
}) => {
  // Add a new page
  await formPage.clickAddNewPage()

  // Select Question Page type
  await selectPageTypePage.waitUntilReady()
  await selectPageTypePage.choosePageType('question')

  // Select List question type and Autocomplete (Select) subtype
  await selectQuestionTypePage.selectQuestionType('list')
  await selectQuestionTypePage.selectSubtype('select')
  await selectQuestionTypePage.clickSaveAndContinue()

  // Configure the question
  await formPage.createWrittenAnswer('Select your country', 'country')
  const error = await formPage.getErrorMessage()
  expect(error).toContain('At least 2 items are required for a list')
  
  // Add options to item list
  const options = ['England', 'Scotland', 'Wales', 'Northern Ireland']
  await editQuestionPage.addListItems(options)
  await editQuestionPage.clickSaveAndContinue()
  await pageOverview.successBannerIsDisplayed()

  //click add to guidance page
  await formPage.clickBackToAddEditPages()
  await formPage.clickAddNewPage()
  await selectPageTypePage.choosePageType('guidance')

  await guidancePage.verifyStructureBeforeSaving()
  await guidancePage.fillPageHeading('Guidance page')
  // Assert the page heading is set correctly
  await expect(guidancePage.pageHeadingInput).toHaveValue('Guidance page')
  const guidanceText = `* leave one empty line space after the lead-in line
* use an asterisk or a dash followed by a space to add an item
* start each item with a lowercase letter, do not end with a full stop
* leave one empty line space after the last item`
  await guidancePage.fillGuidanceText(guidanceText)

  await guidancePage.setExitPage(false)
  await guidancePage.save()
  await guidancePage.waitUntilReady()
  await pageOverview.successBannerIsDisplayed()
  await guidancePage.verifyStructureAfterSaving()

  await expect(guidancePage.pageHeadingInput).toHaveValue('Guidance page')
  await expect(guidancePage.guidanceTextInput).toHaveValue(guidanceText)
  await expect(guidancePage.exitPageCheckbox).not.toBeChecked()

  //now make it an exit page
  await guidancePage.setExitPage(true)
  await guidancePage.save()
  await pageOverview.successBannerIsDisplayed()
  await expect(guidancePage.pageHeadingInput).toHaveValue('Guidance page')
  await expect(guidancePage.guidanceTextInput).toHaveValue(guidanceText)
  await expect(guidancePage.exitPageCheckbox).toBeChecked()
})
