import { Page, Locator } from '@playwright/test'

export class SelectQuestionTypePage {
  readonly page: Page

  // Locators for main question types
  private readonly questionTypeLocators: Record<string, Locator>
  private readonly subtypeLocators: Record<string, Locator>

  readonly saveAndContinueButton: Locator

  constructor(page: Page) {
    this.page = page

    // Initialise locators for main question types
    this.questionTypeLocators = {
      writtenAnswer: page.getByRole('radio', { name: 'Written answer' }),
      date: page.getByRole('radio', { name: 'Date' }),
      location: page.getByRole('radio', { name: 'Location' }),
      phoneNumber: page.getByRole('radio', { name: 'Phone number' }),
      fileUpload: page.getByRole('radio', { name: 'Supporting evidence' }),
      emailAddress: page.getByRole('radio', { name: 'Email address' }),
      payment: page.getByRole('radio', { name: 'Payment' }),
      declaration: page.getByRole('radio', { name: 'Declaration' }),
      list: page.getByRole('radio', {
        name: 'A list of options that users can choose from'
      }),
      select: page.getByRole('radio', {
        name: 'A select box that users can choose from'
      })
    }

    // Initialise locators for subtypes
    this.subtypeLocators = {
      shortAnswer: page.getByRole('radio', {
        name: 'Short answer (a single line)'
      }),
      longAnswer: page.getByRole('radio', {
        name: 'Long answer (more than a single line)'
      }),
      numbersOnly: page.getByRole('radio', { name: 'Numbers only' }),

      dateMonthYear: page.getByRole('radio', {
        name: 'Day, month and year',
        exact: true
      }),
      monthYear: page.getByRole('radio', {
        name: 'Month and year',
        exact: true
      }),

      ukAddressSub: page.getByRole('radio', { name: 'UK address' }),
      eastingNorthing: page.getByRole('radio', {
        name: 'Easting and northing'
      }),
      osGridReference: page.getByRole('radio', {
        name: 'Ordnance Survey (OS) grid reference'
      }),
      nationalGridFieldNumber: page.getByRole('radio', {
        name: 'National Grid field number'
      }),
      latitudeLongitude: page.getByRole('radio', {
        name: 'Latitude and longitude'
      }),

      yesNo: page.getByRole('radio', { name: 'Yes or No' }),
      checkboxes: page.getByRole('radio', { name: 'Checkboxes' }),
      radios: page.getByRole('radio', { name: 'Radios' }),
      autocomplete: page.getByRole('radio', { name: 'Autocomplete' }),
      select: page.getByRole('radio', { name: 'Select' })
    }

    this.saveAndContinueButton = page.getByRole('button', {
      name: 'Save and continue'
    })
  }

  async selectQuestionType(type: keyof typeof this.questionTypeLocators) {
    const radioButton = this.questionTypeLocators[type]
    if (!radioButton) {
      throw new Error(`Unknown question type: ${type}`)
    }
    await radioButton.check()
  }

  async selectSubtype(subtype: keyof typeof this.subtypeLocators) {
    const radioButton = this.subtypeLocators[subtype]
    if (!radioButton) {
      throw new Error(`Unknown subtype: ${subtype}`)
    }
    await radioButton.check()
  }

  async clickSaveAndContinue() {
    await this.saveAndContinueButton.click()
  }
}
