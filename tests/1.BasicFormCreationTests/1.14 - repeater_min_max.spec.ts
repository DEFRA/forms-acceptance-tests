import { test as baseTest, expect, type Page } from '@playwright/test'
import { FormPage } from '~/pages/FormPage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { SelectQuestionTypePage } from '~/pages/SelectQuestionTypePage.js'
import { PageOverview } from '~/pages/PageOverview.js'
import { getPreviewUrl } from '~/tests/utils/preview.js'

/**
 * Covers the "Min" and "Max" settings of "Allow multiple responses to
 * questions on this page" (a repeater page). There is no exact setting for
 * repeaters, so "Min" = "Max" is how a form asks for an exact number.
 */

type MyFixtures = {
  formPage: FormPage
  selectPageTypePage: SelectPageTypePage
  selectQuestionTypePage: SelectQuestionTypePage
  pageOverview: PageOverview
}

const QUESTION = 'What is the name of the cow?'
const SET_NAME = 'Cow'

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
    await use(new SelectPageTypePage(page))
  },

  selectQuestionTypePage: async ({ page }, use) => {
    await use(new SelectQuestionTypePage(page))
  },

  pageOverview: async ({ page }, use) => {
    await use(new PageOverview(page))
  }
})

test.beforeEach(
  async ({ formPage, selectPageTypePage, selectQuestionTypePage }) => {
    await formPage.addNewPageButton.click()
    await selectPageTypePage.choosePageType('question')
    await selectQuestionTypePage.selectQuestionType('writtenAnswer')
    await selectQuestionTypePage.selectSubtype('shortAnswer')
    await selectQuestionTypePage.clickSaveAndContinue()
    await formPage.createWrittenAnswer(QUESTION, 'cow name')
  }
)

// Applies to fixtures and hooks as well as the tests, so creating the form is
// not held to the 15 second global timeout
test.describe.configure({ timeout: 90_000 })

function errorSummary(page: Page) {
  // The designer's preview panel renders its own error summary, so only match
  // the one GOV.UK Frontend initialises for the page
  return page.locator('[data-module="govuk-error-summary"]')
}

test.describe('1.14 - Repeater page: "Min" and "Max" settings in the designer', () => {
  test('1.14.1 - Repeater: "Min" = 2, "Max" = 5 and name "Cow" are saved', async ({
    page,
    pageOverview
  }) => {
    await pageOverview.configureRepeater(2, 5, SET_NAME)
    await pageOverview.saveChanges()
    await pageOverview.verifySuccessBanner('Changes saved successfully')

    await page.reload()
    await expect(pageOverview.repeaterCheckbox).toBeChecked()
    await expect(pageOverview.minItemsInput).toHaveValue('2')
    await expect(pageOverview.maxItemsInput).toHaveValue('5')
    await expect(pageOverview.questionSetNameInput).toHaveValue(SET_NAME)
  })

  test('1.14.2 - Repeater: "Min" = "Max" = 3 is allowed, to ask for exactly 3 answers', async ({
    page,
    pageOverview
  }) => {
    await pageOverview.configureRepeater(3, 3, SET_NAME)
    await pageOverview.saveChanges()
    await pageOverview.verifySuccessBanner('Changes saved successfully')

    await page.reload()
    await expect(pageOverview.minItemsInput).toHaveValue('3')
    await expect(pageOverview.maxItemsInput).toHaveValue('3')
  })

  test('1.14.3 - Repeater: empty "Min", "Max" and name each show a required error', async ({
    page,
    pageOverview
  }) => {
    await pageOverview.configureRepeater('', '', '')
    await pageOverview.saveChanges()

    await expect(errorSummary(page)).toContainText(
      'Enter the minimum number of times someone can answer these questions'
    )
    await expect(errorSummary(page)).toContainText(
      'Enter the maximum number of times someone can answer these questions'
    )
    await expect(errorSummary(page)).toContainText(
      'Enter a name for this set of questions'
    )
  })

  test('1.14.4 - Repeater: "Max" = 2 is rejected when "Min" = 3', async ({
    page,
    pageOverview
  }) => {
    await pageOverview.configureRepeater(3, 2, SET_NAME)
    await pageOverview.saveChanges()

    await expect(errorSummary(page)).toContainText(
      'The maximum number cannot be lower than the minimum number'
    )
  })

  test('1.14.5 - Repeater: out of range values are rejected ("Min" = 0, "Max" = 201)', async ({
    page,
    pageOverview
  }) => {
    await pageOverview.configureRepeater(0, 201, SET_NAME)
    await pageOverview.saveChanges()

    await expect(errorSummary(page)).toContainText(
      'Enter a number greater than or equal to 1'
    )
    await expect(errorSummary(page)).toContainText(
      'Enter a number less than or equal to 200'
    )
  })
})

async function addAnswer(page: Page, name: string) {
  await page.getByRole('textbox', { name: QUESTION }).fill(name)
  await page.getByRole('button', { name: 'Continue' }).click()
}

function summaryHeading(page: Page, count: number) {
  const answers = count === 1 ? 'answer' : 'answers'
  return page.getByRole('heading', {
    name: `You have added ${count} ${answers}`
  })
}

test.describe('1.14 - Repeater page: "Min" and "Max" are enforced when filling in the form', () => {
  test('1.14.6 - Repeater in the form: with "Min" = 2 and "Max" = 3, continuing after 1 answer and adding a 4th both show an error', async ({
    page,
    pageOverview
  }) => {
    await pageOverview.configureRepeater(2, 3, SET_NAME)
    await pageOverview.saveChanges()
    await pageOverview.verifySuccessBanner('Changes saved successfully')

    await page.goto(await getPreviewUrl(page))

    await addAnswer(page, 'Daisy')
    await expect(summaryHeading(page, 1)).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(errorSummary(page)).toContainText(
      'You must add at least 2 answers'
    )

    await page.getByRole('button', { name: 'Add another' }).click()
    await addAnswer(page, 'Buttercup')
    await page.getByRole('button', { name: 'Add another' }).click()
    await addAnswer(page, 'Clover')
    await expect(summaryHeading(page, 3)).toBeVisible()

    await page.getByRole('button', { name: 'Add another' }).click()
    await expect(errorSummary(page)).toContainText(
      'You can only add up to 3 answers'
    )

    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(errorSummary(page)).toBeHidden()
    await expect(summaryHeading(page, 3)).toBeHidden()
  })

  test('1.14.7 - Repeater in the form: with "Min" = "Max" = 2, exactly 2 answers are needed to continue', async ({
    page,
    pageOverview
  }) => {
    await pageOverview.configureRepeater(2, 2, SET_NAME)
    await pageOverview.saveChanges()
    await pageOverview.verifySuccessBanner('Changes saved successfully')

    await page.goto(await getPreviewUrl(page))

    await addAnswer(page, 'Daisy')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(errorSummary(page)).toContainText(
      'You must add at least 2 answers'
    )

    await page.getByRole('button', { name: 'Add another' }).click()
    await addAnswer(page, 'Buttercup')
    await expect(summaryHeading(page, 2)).toBeVisible()

    await page.getByRole('button', { name: 'Add another' }).click()
    await expect(errorSummary(page)).toContainText(
      'You can only add up to 2 answers'
    )

    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(errorSummary(page)).toBeHidden()
    await expect(summaryHeading(page, 2)).toBeHidden()
  })
})
