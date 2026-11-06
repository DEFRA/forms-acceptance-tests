import { test as baseTest, expect, type Page } from '@playwright/test'
import { FormPage } from '~/pages/FormPage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { SelectQuestionTypePage } from '~/pages/SelectQuestionTypePage.js'
import { PageOverview } from '~/pages/PageOverview.js'
import { EditQuestionPage } from '~/pages/EditQuestionPage.js'

/**
 * Covers the minimum, maximum and exact count settings on every question type
 * that has all three in the designer: checkboxes (items), supporting evidence
 * (file count) and map questions (features).
 */

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
  },

  editQuestionPage: async ({ page }, use) => {
    await use(new EditQuestionPage(page))
  }
})

const MINMAX_OR_EXACT_ERROR =
  'Enter an exact amount or choose the minimum and maximum range allowed'

const CHECKBOX_ITEMS = ['Apple', 'Banana', 'Cherry', 'Damson']

interface Pages {
  formPage: FormPage
  selectPageTypePage: SelectPageTypePage
  selectQuestionTypePage: SelectQuestionTypePage
  editQuestionPage: EditQuestionPage
}

interface CountQuestionType {
  name: string
  question: string
  unit: 'items' | 'files'
  addQuestion: (pages: Pages) => Promise<void>
  /** A valid min and max, an exact value, and a min that is above that max */
  valid: { min: string; max: string; exact: string; minAboveMax: string }
  /** Values outside the allowed range, each with the error it should show */
  invalid: { min: string; max: string; exact: string }
  errors: {
    minAboveMax: string
    min: string
    max: string
    exact: string
  }
}

const questionTypes: CountQuestionType[] = [
  {
    name: 'checkboxes',
    question: 'Which fruit do you grow?',
    unit: 'items',
    addQuestion: async ({
      formPage,
      selectPageTypePage,
      selectQuestionTypePage,
      editQuestionPage
    }) => {
      await formPage.addNewPageButton.click()
      await selectPageTypePage.choosePageType('question')
      await selectQuestionTypePage.selectQuestionType('list')
      await selectQuestionTypePage.selectSubtype('checkboxes')
      await selectQuestionTypePage.clickSaveAndContinue()

      await editQuestionPage.questionInput.fill('Which fruit do you grow?')
      await editQuestionPage.shortDescriptionInput.fill('fruit grown')
      await editQuestionPage.addListItems(CHECKBOX_ITEMS)
      await editQuestionPage.clickSaveAndContinue()
    },
    valid: { min: '2', max: '3', exact: '2', minAboveMax: '4' },
    invalid: { min: '1', max: '2.5', exact: '1' },
    errors: {
      minAboveMax:
        'Minimum number of checkboxes cannot be greater than the maximum',
      min: 'Minimum number of checkboxes must be a whole number greater than or equal to 2',
      max: 'Maximum number of checkboxes must be a whole number greater than or equal to 2',
      exact:
        'Exact number of checkboxes must be a whole number greater than or equal to 2'
    }
  },
  {
    name: 'supporting evidence',
    question: 'Upload your site plans',
    unit: 'files',
    addQuestion: async ({
      formPage,
      selectPageTypePage,
      selectQuestionTypePage
    }) => {
      await formPage.addNewPageButton.click()
      await selectPageTypePage.choosePageType('question')
      await selectQuestionTypePage.selectQuestionType('fileUpload')
      await selectQuestionTypePage.clickSaveAndContinue()

      await formPage.createFileUpload('Upload your site plans', 'site plans')
    },
    valid: { min: '2', max: '5', exact: '3', minAboveMax: '6' },
    invalid: { min: '0', max: '26', exact: '1.5' },
    errors: {
      minAboveMax:
        'The minimum number of files you accept cannot be greater than the maximum',
      min: 'Minimum file count must be a whole number between 1 and 25',
      max: 'Maximum file count must be a whole number between 1 and 25',
      exact: 'Exact file count must be a whole number between 1 and 25'
    }
  },
  {
    name: 'map',
    question: 'Mark the barn locations on a map',
    unit: 'items',
    addQuestion: async ({
      formPage,
      selectPageTypePage,
      selectQuestionTypePage
    }) => {
      await formPage.addNewPageButton.click()
      await selectPageTypePage.choosePageType('question')
      await selectQuestionTypePage.selectQuestionType('location')
      await selectQuestionTypePage.selectSubtype('areaOrPointsOnMap')
      await selectQuestionTypePage.clickSaveAndContinue()

      await formPage.createWrittenAnswer(
        'Mark the barn locations on a map',
        'barn locations'
      )
    },
    valid: { min: '1', max: '4', exact: '2', minAboveMax: '5' },
    invalid: { min: '0', max: '1.5', exact: '0' },
    errors: {
      minAboveMax:
        'Minimum number of features cannot be greater than the maximum',
      min: 'Minimum number of features must be a whole number greater than or equal to 1',
      max: 'Maximum number of features must be a whole number greater than or equal to 1',
      exact:
        'Exact number of features must be a whole number greater than or equal to 1'
    }
  }
]

async function openQuestionSettings(
  pageOverview: PageOverview,
  editQuestionPage: EditQuestionPage,
  question: string
) {
  await pageOverview.clickChangeLinkForQuestionByName(question)
  await editQuestionPage.expandAdditionalSettings()
}

function errorSummary(page: Page) {
  // The designer's preview panel renders its own error summary, so only match
  // the one GOV.UK Frontend initialises for the page
  return page.locator('[data-module="govuk-error-summary"]')
}

for (const [index, type] of questionTypes.entries()) {
  const id = `1.13.${index + 1}`

  test.describe(`${id} - ${type.name} minimum, maximum and exact counts`, () => {
    test.beforeEach(() => {
      test.setTimeout(60_000)
    })

    test(`${id}.1 - minimum and maximum persist`, async ({
      formPage,
      selectPageTypePage,
      selectQuestionTypePage,
      pageOverview,
      editQuestionPage
    }) => {
      const pages = {
        formPage,
        selectPageTypePage,
        selectQuestionTypePage,
        editQuestionPage
      }
      await type.addQuestion(pages)
      await pageOverview.verifySuccessBanner('Changes saved successfully')

      await openQuestionSettings(pageOverview, editQuestionPage, type.question)
      await editQuestionPage.setCountLimits(type.unit, {
        min: type.valid.min,
        max: type.valid.max
      })
      await editQuestionPage.clickSaveAndContinue()
      await pageOverview.verifySuccessBanner('Changes saved successfully')

      await openQuestionSettings(pageOverview, editQuestionPage, type.question)
      const fields = editQuestionPage.countLimitInputs(type.unit)
      await expect(fields.min).toHaveValue(type.valid.min)
      await expect(fields.max).toHaveValue(type.valid.max)
      await expect(fields.exact).toHaveValue('')
    })

    test(`${id}.2 - exact count persists`, async ({
      formPage,
      selectPageTypePage,
      selectQuestionTypePage,
      pageOverview,
      editQuestionPage
    }) => {
      await type.addQuestion({
        formPage,
        selectPageTypePage,
        selectQuestionTypePage,
        editQuestionPage
      })
      await pageOverview.verifySuccessBanner('Changes saved successfully')

      await openQuestionSettings(pageOverview, editQuestionPage, type.question)
      await editQuestionPage.setCountLimits(type.unit, {
        exact: type.valid.exact
      })
      await editQuestionPage.clickSaveAndContinue()
      await pageOverview.verifySuccessBanner('Changes saved successfully')

      await openQuestionSettings(pageOverview, editQuestionPage, type.question)
      const fields = editQuestionPage.countLimitInputs(type.unit)
      await expect(fields.exact).toHaveValue(type.valid.exact)
      await expect(fields.min).toHaveValue('')
      await expect(fields.max).toHaveValue('')
    })

    test(`${id}.3 - exact count cannot be combined with minimum or maximum`, async ({
      page,
      formPage,
      selectPageTypePage,
      selectQuestionTypePage,
      pageOverview,
      editQuestionPage
    }) => {
      await type.addQuestion({
        formPage,
        selectPageTypePage,
        selectQuestionTypePage,
        editQuestionPage
      })
      await pageOverview.verifySuccessBanner('Changes saved successfully')

      await openQuestionSettings(pageOverview, editQuestionPage, type.question)
      await editQuestionPage.setCountLimits(type.unit, {
        min: type.valid.min,
        exact: type.valid.exact
      })
      await editQuestionPage.clickSaveAndContinue()
      await expect(errorSummary(page)).toContainText(MINMAX_OR_EXACT_ERROR)

      await editQuestionPage.setCountLimits(type.unit, {
        min: '',
        max: type.valid.max,
        exact: type.valid.exact
      })
      await editQuestionPage.clickSaveAndContinue()
      await expect(errorSummary(page)).toContainText(MINMAX_OR_EXACT_ERROR)
    })

    test(`${id}.4 - minimum cannot be greater than maximum`, async ({
      page,
      formPage,
      selectPageTypePage,
      selectQuestionTypePage,
      pageOverview,
      editQuestionPage
    }) => {
      await type.addQuestion({
        formPage,
        selectPageTypePage,
        selectQuestionTypePage,
        editQuestionPage
      })
      await pageOverview.verifySuccessBanner('Changes saved successfully')

      await openQuestionSettings(pageOverview, editQuestionPage, type.question)
      await editQuestionPage.setCountLimits(type.unit, {
        min: type.valid.minAboveMax,
        max: type.valid.max
      })
      await editQuestionPage.clickSaveAndContinue()
      await expect(errorSummary(page)).toContainText(type.errors.minAboveMax)
    })

    test(`${id}.5 - out of range and non whole numbers are rejected`, async ({
      page,
      formPage,
      selectPageTypePage,
      selectQuestionTypePage,
      pageOverview,
      editQuestionPage
    }) => {
      await type.addQuestion({
        formPage,
        selectPageTypePage,
        selectQuestionTypePage,
        editQuestionPage
      })
      await pageOverview.verifySuccessBanner('Changes saved successfully')

      // min and max together, then exact on its own, as exact cannot be
      // combined with the others
      await openQuestionSettings(pageOverview, editQuestionPage, type.question)
      await editQuestionPage.setCountLimits(type.unit, {
        min: type.invalid.min,
        max: type.invalid.max
      })
      await editQuestionPage.clickSaveAndContinue()
      await expect(errorSummary(page)).toContainText(type.errors.min)
      await expect(errorSummary(page)).toContainText(type.errors.max)

      await editQuestionPage.setCountLimits(type.unit, {
        min: '',
        max: '',
        exact: type.invalid.exact
      })
      await editQuestionPage.clickSaveAndContinue()
      await expect(errorSummary(page)).toContainText(type.errors.exact)
    })
  })
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

async function selectAndContinue(page: Page, items: string[]) {
  for (const item of CHECKBOX_ITEMS) {
    const checkbox = page.getByRole('checkbox', { name: item, exact: true })
    if (items.includes(item)) {
      await checkbox.check()
    } else {
      await checkbox.uncheck()
    }
  }
  await page.getByRole('button', { name: 'Continue' }).click()
}

test.describe('1.13.4 - checkbox counts are enforced in the form', () => {
  test.beforeEach(() => {
    test.setTimeout(90_000)
  })

  test('1.13.4.1 - minimum and maximum are enforced', async ({
    page,
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    pageOverview,
    editQuestionPage
  }) => {
    const checkboxes = questionTypes[0]
    await checkboxes.addQuestion({
      formPage,
      selectPageTypePage,
      selectQuestionTypePage,
      editQuestionPage
    })
    await openQuestionSettings(
      pageOverview,
      editQuestionPage,
      checkboxes.question
    )
    await editQuestionPage.setCountLimits('items', { min: '2', max: '3' })
    await editQuestionPage.clickSaveAndContinue()
    await pageOverview.verifySuccessBanner('Changes saved successfully')

    await page.goto(await getPreviewUrl(page))

    await selectAndContinue(page, ['Apple'])
    await expect(errorSummary(page)).toContainText(
      'Select at least 2 options from the list'
    )

    await selectAndContinue(page, CHECKBOX_ITEMS)
    await expect(errorSummary(page)).toContainText(
      'Only 3 options can be selected from the list'
    )

    await selectAndContinue(page, ['Apple', 'Banana', 'Cherry'])
    await expect(errorSummary(page)).toBeHidden()
    await expect(
      page.getByRole('heading', { name: checkboxes.question })
    ).toBeHidden()
  })

  test('1.13.4.2 - exact count is enforced', async ({
    page,
    formPage,
    selectPageTypePage,
    selectQuestionTypePage,
    pageOverview,
    editQuestionPage
  }) => {
    const checkboxes = questionTypes[0]
    await checkboxes.addQuestion({
      formPage,
      selectPageTypePage,
      selectQuestionTypePage,
      editQuestionPage
    })
    await openQuestionSettings(
      pageOverview,
      editQuestionPage,
      checkboxes.question
    )
    await editQuestionPage.setCountLimits('items', { exact: '2' })
    await editQuestionPage.clickSaveAndContinue()
    await pageOverview.verifySuccessBanner('Changes saved successfully')

    await page.goto(await getPreviewUrl(page))

    await selectAndContinue(page, ['Apple'])
    await expect(errorSummary(page)).toContainText(
      'Select only 2 options from the list'
    )

    await selectAndContinue(page, ['Apple', 'Banana', 'Cherry'])
    await expect(errorSummary(page)).toContainText(
      'Select only 2 options from the list'
    )

    await selectAndContinue(page, ['Apple', 'Banana'])
    await expect(errorSummary(page)).toBeHidden()
    await expect(
      page.getByRole('heading', { name: checkboxes.question })
    ).toBeHidden()
  })
})
