import { test, expect, Page } from '@playwright/test'
import { FormPage } from '~/pages/FormPage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { SelectQuestionTypePage } from '~/pages/SelectQuestionTypePage.js'
import { EditQuestionPage } from '~/pages/EditQuestionPage.js'
import { EditConditionPage } from '~/pages/EditConditionPage.js'
import { GuidancePage } from '~/pages/GuidancePage.js'
import { PageConditionsPage } from '~/pages/PageConditionsPage.js'

/**
 * 3.9 - Range of answers in a condition
 *
 * Verifies that a single condition can match more than one answer option for
 * each list-based question type (checkboxes, radios, autocomplete, select), and
 * that those conditions actually control page visibility when the form is run.
 *
 * Each question gets a guidance page whose condition is built from the first two
 * of that question's options:
 *   - Checkboxes use "contains" with an AND coordinator, so BOTH of the first
 *     two options must be selected for the page to show.
 *   - Radios / autocomplete / select use "is" with two selected values, so
 *     selecting EITHER of the first two options shows the page.
 */

type ListSubtype = 'checkboxes' | 'radios' | 'autocomplete' | 'select'

interface QuestionSpec {
  subtype: ListSubtype
  question: string
  shortDescription: string
  options: [string, string, string, string]
  conditionName: string
  guidanceHeading: string
  guidanceText: string
}

const questionSpecs: QuestionSpec[] = [
  {
    subtype: 'checkboxes',
    question: 'Which fruits do you like?',
    shortDescription: 'fruits',
    options: ['Apple', 'Banana', 'Cherry', 'Date'],
    conditionName: 'Fruits Apple and Banana',
    guidanceHeading: 'Fruit guidance',
    guidanceText: 'You like both apples and bananas.'
  },
  {
    subtype: 'radios',
    question: 'Which colour do you prefer?',
    shortDescription: 'colour',
    options: ['Red', 'Green', 'Blue', 'Yellow'],
    conditionName: 'Colour Red or Green',
    guidanceHeading: 'Colour guidance',
    guidanceText: 'You prefer red or green.'
  },
  {
    subtype: 'autocomplete',
    question: 'Which country do you live in?',
    shortDescription: 'country',
    options: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    conditionName: 'Country England or Scotland',
    guidanceHeading: 'Country guidance',
    guidanceText: 'You live in England or Scotland.'
  },
  {
    subtype: 'select',
    question: 'Which season do you prefer?',
    shortDescription: 'season',
    options: ['Spring', 'Summer', 'Autumn', 'Winter'],
    conditionName: 'Season Spring or Summer',
    guidanceHeading: 'Season guidance',
    guidanceText: 'You prefer spring or summer.'
  }
]

/**
 * The operator/value expression each condition is expected to produce, as shown
 * in the conditions manager. Checkboxes are AND-combined; the rest are OR.
 */
function expectedConditionExpression(spec: QuestionSpec): string {
  const [first, second] = spec.options
  if (spec.subtype === 'checkboxes') {
    return `('${spec.question}' contains '${first}' and '${spec.question}' contains '${second}')`
  }
  return `('${spec.question}' is '${first}' or '${spec.question}' is '${second}')`
}

async function addListQuestion(
  formPage: FormPage,
  selectPageTypePage: SelectPageTypePage,
  selectQuestionTypePage: SelectQuestionTypePage,
  editQuestionPage: EditQuestionPage,
  spec: QuestionSpec
) {
  await formPage.goToPages()
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('list')
  await selectQuestionTypePage.selectSubtype(spec.subtype)
  await selectQuestionTypePage.clickSaveAndContinue()

  await formPage.questionInput.fill(spec.question)
  await formPage.shortDescriptionInput.fill(spec.shortDescription)

  if (spec.subtype === 'autocomplete') {
    await editQuestionPage.addAutoCompleteOptions([...spec.options])
  } else {
    await editQuestionPage.addListItems([...spec.options])
  }

  await editQuestionPage.clickSaveAndContinue()
  await expect(
    formPage.page.locator('text=Changes saved successfully')
  ).toBeVisible()
}

async function createMultiValueCondition(
  formPage: FormPage,
  editConditionPage: EditConditionPage,
  spec: QuestionSpec,
  pageNumber: number
) {
  await formPage.goToEditorV2Page('conditions')
  await formPage.page
    .getByRole('link', { name: 'Create new condition' })
    .first()
    .click()

  await editConditionPage.selectQuestion(`Page ${pageNumber}: ${spec.question}`)

  const isCheckbox = spec.subtype === 'checkboxes'
  await editConditionPage.selectOperator(isCheckbox ? 'Contains' : 'Is')

  if (isCheckbox) {
    // AND: the guidance page only shows when both options are ticked.
    await editConditionPage.setCheckboxCoordinator('and')
  }

  await editConditionPage.selectListValues([spec.options[0], spec.options[1]])
  await editConditionPage.setConditionName(spec.conditionName)
  await editConditionPage.saveCondition()

  await expect(formPage.page).toHaveURL(/editor-v2\/conditions/)
  await expect(
    formPage.page.locator('main')
  ).toContainText(expectedConditionExpression(spec))
}

async function addGuidancePageWithCondition(
  formPage: FormPage,
  selectPageTypePage: SelectPageTypePage,
  guidancePage: GuidancePage,
  pageConditionsPage: PageConditionsPage,
  spec: QuestionSpec
) {
  await formPage.goToPages()
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('guidance')

  await guidancePage.fillPageHeading(spec.guidanceHeading)
  await guidancePage.fillGuidanceText(spec.guidanceText)
  await guidancePage.save()
  await expect(
    formPage.page.locator('text=Changes saved successfully')
  ).toBeVisible()

  await guidancePage.manageConditions()
  await pageConditionsPage.addExistingCondition(spec.conditionName)
  await pageConditionsPage.assertConditionApplied(spec.conditionName)
}

async function getPreviewUrl(page: Page): Promise<string> {
  const base = page.url().split('/editor-v2')[0]
  await page.goto(base)
  const previewUrl = await page
    .locator('dt:has-text("Preview link") + dd a')
    .first()
    .getAttribute('href')
  expect(previewUrl).toBeTruthy()
  return previewUrl as string
}

interface RunnerAnswers {
  fruits: string[]
  colour: string
  country: string
  season: string
}

/**
 * Answers all four question pages in the runner, leaving the form on whatever
 * page follows the final question (a guidance page or the summary).
 */
async function answerQuestions(page: Page, answers: RunnerAnswers) {
  // Page 1 - checkboxes
  for (const fruit of answers.fruits) {
    await page.getByRole('checkbox', { name: fruit, exact: true }).check()
  }
  await clickContinue(page)

  // Page 2 - radios
  await page.getByRole('radio', { name: answers.colour, exact: true }).check()
  await clickContinue(page)

  // Page 3 - autocomplete
  await answerAutocomplete(page, answers.country)
  await clickContinue(page)

  // Page 4 - select
  await page.getByLabel(/Which season/i).selectOption({ label: answers.season })
  await clickContinue(page)
}

/**
 * The autocomplete question renders a native <select> that the GOV.UK
 * accessible-autocomplete script progressively enhances into a text combobox.
 * Handle both states so the test is robust whether or not (and before) that
 * enhancement has run.
 */
async function answerAutocomplete(page: Page, value: string) {
  const enhancedInput = page.locator('input.autocomplete__input')
  await enhancedInput
    .waitFor({ state: 'visible', timeout: 3000 })
    .catch(() => {})

  if (await enhancedInput.count()) {
    await enhancedInput.fill(value)
    const option = page
      .locator('li[role="option"]', { hasText: value })
      .first()
    await option.waitFor({ state: 'visible' })
    await option.click()
  } else {
    await page.getByLabel(/Which country/i).selectOption({ label: value })
  }
}

async function clickContinue(page: Page) {
  await page.getByRole('button', { name: 'Continue' }).click()
}

async function expectGuidancePageThenContinue(page: Page, heading: string) {
  await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  await clickContinue(page)
}

async function expectOnSummary(page: Page) {
  await expect(page).toHaveURL(/\/summary(?:\/|\?|$)/)
  await expect(
    page.getByRole('heading', { name: /Check your answers/i })
  ).toBeVisible()
}

test.describe.serial('3.9 - Range of answers in a condition', () => {
  let previewUrl: string

  test('3.9.1 - create a form with multi-answer conditions for each list question type', async ({
    page
  }, testInfo) => {
    test.setTimeout(240_000)

    const formPage = new FormPage(page)
    const selectPageTypePage = new SelectPageTypePage(page)
    const selectQuestionTypePage = new SelectQuestionTypePage(page)
    const editQuestionPage = new EditQuestionPage(page)
    const editConditionPage = new EditConditionPage(page)
    const guidancePage = new GuidancePage(page)
    const pageConditionsPage = new PageConditionsPage(page)

    // Create the draft form
    await formPage.goTo()
    const formName =
      'Range of answers in a condition ' +
      Math.random().toString().substring(2, 8)
    await formPage.enterFormName(formName, testInfo)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')
    await formPage.editDraft()

    // Add one question page per list type (pages 1-4)
    for (const spec of questionSpecs) {
      await addListQuestion(
        formPage,
        selectPageTypePage,
        selectQuestionTypePage,
        editQuestionPage,
        spec
      )
    }

    // Create a multi-value condition for each question
    for (let index = 0; index < questionSpecs.length; index++) {
      await createMultiValueCondition(
        formPage,
        editConditionPage,
        questionSpecs[index],
        index + 1
      )
    }

    // Add a guidance page for each question and apply its condition (pages 5-8)
    for (const spec of questionSpecs) {
      await addGuidancePageWithCondition(
        formPage,
        selectPageTypePage,
        guidancePage,
        pageConditionsPage,
        spec
      )
    }

    previewUrl = await getPreviewUrl(page)
    expect(previewUrl).toContain('/form/preview/draft/')
  })

  test('3.9.2 - all guidance pages show when every condition is satisfied', async ({
    page
  }) => {
    test.setTimeout(120_000)

    await page.goto(previewUrl)
    await expect(page).toHaveURL(/\/form\/preview\/draft\//)

    await answerQuestions(page, {
      fruits: ['Apple', 'Banana'], // both first two -> AND satisfied
      colour: 'Red',
      country: 'England',
      season: 'Spring'
    })

    await expectGuidancePageThenContinue(page, 'Fruit guidance')
    await expectGuidancePageThenContinue(page, 'Colour guidance')
    await expectGuidancePageThenContinue(page, 'Country guidance')
    await expectGuidancePageThenContinue(page, 'Season guidance')

    await expectOnSummary(page)
  })

  test('3.9.3 - no guidance pages show when no condition is satisfied', async ({
    page
  }) => {
    test.setTimeout(120_000)

    await page.goto(previewUrl)
    await expect(page).toHaveURL(/\/form\/preview\/draft\//)

    await answerQuestions(page, {
      fruits: ['Cherry'], // neither of the first two
      colour: 'Blue',
      country: 'Wales',
      season: 'Autumn'
    })

    // Every guidance page condition fails, so the runner skips straight to the
    // summary without showing any of them.
    await expect(page.getByRole('heading', { name: 'Fruit guidance' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Colour guidance' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Country guidance' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Season guidance' })).toHaveCount(0)

    await expectOnSummary(page)
  })

  test('3.9.4 - guidance pages respect which specific answers were selected', async ({
    page
  }) => {
    test.setTimeout(120_000)

    await page.goto(previewUrl)
    await expect(page).toHaveURL(/\/form\/preview\/draft\//)

    await answerQuestions(page, {
      fruits: ['Apple'], // only one of two -> AND NOT satisfied, page hidden
      colour: 'Green', // second listed option -> OR satisfied, page shown
      country: 'Scotland', // second listed option -> OR satisfied, page shown
      season: 'Winter' // not listed in the condition -> page hidden
    })

    // Fruit guidance is skipped because the checkbox condition needs BOTH values
    await expect(page.getByRole('heading', { name: 'Fruit guidance' })).toHaveCount(0)

    await expectGuidancePageThenContinue(page, 'Colour guidance')
    await expectGuidancePageThenContinue(page, 'Country guidance')

    // Season guidance is skipped because "Winter" is not one of the two values
    await expect(page.getByRole('heading', { name: 'Season guidance' })).toHaveCount(0)

    await expectOnSummary(page)
  })
})
