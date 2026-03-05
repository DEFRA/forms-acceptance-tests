import { expect } from '@playwright/test'
import { test } from '~/fixtures/main.js'
import { assertHeadingHierarchy } from '~/tests/2.Accessibility/customA11yAssertions.js'
import { runAccessibilityCheck } from '~/tests/2.Accessibility/accessibilityChecker.js'

type QuestionTypeScenario = {
  label: string
  questionTypeName: string
  subtypeName?: string
}

const QUESTION_TYPE_SCENARIOS: QuestionTypeScenario[] = [
  {
    label: 'written answer - short answer',
    questionTypeName: 'Written answer',
    subtypeName: 'Short answer (a single line)'
  },
  {
    label: 'written answer - long answer',
    questionTypeName: 'Written answer',
    subtypeName: 'Long answer (more than a single line)'
  },
  {
    label: 'written answer - numbers only',
    questionTypeName: 'Written answer',
    subtypeName: 'Numbers only'
  },
  {
    label: 'date - day month year',
    questionTypeName: 'Date',
    subtypeName: 'Day, month and year'
  },
  {
    label: 'date - month year',
    questionTypeName: 'Date',
    subtypeName: 'Month and year'
  },
  {
    label: 'location - uk address',
    questionTypeName: 'Location',
    subtypeName: 'UK address'
  },
  {
    label: 'location - easting and northing',
    questionTypeName: 'Location',
    subtypeName: 'Easting and northing'
  },
  {
    label: 'location - os grid reference',
    questionTypeName: 'Location',
    subtypeName: 'Ordnance Survey (OS) grid reference'
  },
  {
    label: 'location - national grid field number',
    questionTypeName: 'Location',
    subtypeName: 'National Grid field number'
  },
  {
    label: 'location - latitude and longitude',
    questionTypeName: 'Location',
    subtypeName: 'Latitude and longitude'
  },
  {
    label: 'phone number',
    questionTypeName: 'Phone number'
  },
  {
    label: 'supporting evidence',
    questionTypeName: 'Supporting evidence'
  },
  {
    label: 'email address',
    questionTypeName: 'Email address'
  },
  {
    label: 'payment',
    questionTypeName: 'Payment'
  },
  {
    label: 'declaration',
    questionTypeName: 'Declaration'
  },
  {
    label: 'list - yes or no',
    questionTypeName: 'A list of options that users can choose from',
    subtypeName: 'Yes or No'
  },
  {
    label: 'list - checkboxes',
    questionTypeName: 'A list of options that users can choose from',
    subtypeName: 'Checkboxes'
  },
  {
    label: 'list - radios',
    questionTypeName: 'A list of options that users can choose from',
    subtypeName: 'Radios'
  },
  {
    label: 'list - autocomplete',
    questionTypeName: 'A list of options that users can choose from',
    subtypeName: 'Autocomplete'
  },
  {
    label: 'list - select',
    questionTypeName: 'A list of options that users can choose from',
    subtypeName: 'Select'
  }
]

test.describe('Accessibility - heading hierarchy and accessibility checks across all question types', () => {
  test(
    'assert heading hierarchy and accessibility checks for each question type',
    { tag: ['@accessibility', '@heading-hierarchy', '@question-types'] },
    async ({ app }) => {
      test.setTimeout(120000) // 2 minutes
      test.slow()

      const { libraryPage } = app
      const { page } = libraryPage

      const formName = `A11y heading hierarchy ${Math.random().toString(36).slice(2, 8)}`

      await libraryPage.goto()
      await libraryPage.clickCreateForm()

      await page
        .getByRole('textbox', { name: 'Enter a name for your form' })
        .fill(formName)
      await page.getByRole('button', { name: 'Continue' }).click()

      await page.getByRole('radio', { name: 'Defra' }).check()
      await page.getByRole('button', { name: 'Continue' }).click()

      await page
        .getByRole('textbox', { name: 'Name of team' })
        .fill('A11y Team')
      await page
        .getByRole('textbox', { name: 'Shared team email address' })
        .fill('a11y-team@defra.gov.uk')
      await page.getByRole('button', { name: 'Save and continue' }).click()

      await page.getByRole('button', { name: 'Edit draft' }).click()
      await page.waitForURL('**/editor-v2/pages**')

      await page.getByRole('button', { name: 'Add new page' }).click()
      await page.waitForURL('**/editor-v2/page')
      await page.getByRole('radio', { name: 'Question page' }).check()
      await page.getByRole('button', { name: 'Save and continue' }).click()

      await page.waitForURL('**/question/**/type/**')

      for (const scenario of QUESTION_TYPE_SCENARIOS) {
        await test.step(`Heading hierarchy and accessibility checks: ${scenario.label}`, async () => {
          await page
            .getByRole('radio', {
              name: scenario.questionTypeName,
              exact: true
            })
            .check()

          if (scenario.subtypeName) {
            await page
              .getByRole('radio', { name: scenario.subtypeName, exact: true })
              .check()
          }

          await page.getByRole('button', { name: 'Save and continue' }).click()

          await expect(page).toHaveURL(/\/question\//)
          expect(
            page.url().includes('/type/'),
            `Expected to navigate away from question type selection for ${scenario.label}`
          ).toBe(false)

          await assertHeadingHierarchy(page, {
            scopeSelector: '#page-overview',
            requireSingleH1: false
          })
          await runAccessibilityCheck(
            page,
            test.info(),
            `heading-hierarchy-${scenario.label}`
          )

          await page.goBack()
          await page.waitForURL('**/question/**/type/**')
        })
      }
    }
  )
})
