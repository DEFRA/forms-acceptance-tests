import { test as baseTest, expect, type Page } from '@playwright/test'

import { EditQuestionPage } from '~/pages/EditQuestionPage.js'
import { FormPage } from '~/pages/FormPage.js'
import { PageOverview } from '~/pages/PageOverview.js'
import { PrivacyNoticePage } from '~/pages/PrivacyNoticePage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { SelectQuestionTypePage } from '~/pages/SelectQuestionTypePage.js'
import { TermsAndConditionsPage } from '~/pages/TermsAndConditionsPage.js'

const supportEmailAddress = 'support@example.gov.uk'
const submissionsEmailAddress = 'submissions@example.gov.uk'

const seededGeospatialFeatures = [
  {
    type: 'Feature',
    properties: {
      description: 'Location one',
      coordinateGridReference: 'SJ 71535 45435',
      centroidGridReference: 'SJ 71535 45435'
    },
    geometry: {
      type: 'Point',
      coordinates: [-2.4256372, 53.0054679]
    },
    id: 'seed-point-feature'
  },
  {
    id: 'seed-polygon-feature',
    type: 'Feature',
    properties: {
      description: 'Location two',
      coordinateGridReference: 'SH 51917 88671',
      centroidGridReference: 'SH 98167 97135'
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-4.227395, 53.3740927],
          [-3.5352564, 53.6875389],
          [-2.8431177, 53.3216259],
          [-4.227395, 53.3740927]
        ]
      ]
    }
  },
  {
    id: 'seed-line-feature',
    type: 'Feature',
    properties: {
      description: 'Location three',
      coordinateGridReference: 'SE 08295 03834',
      centroidGridReference: 'SK 50060 79761'
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        [-1.8763208, 53.5311058],
        [-1.2501001, 53.3478674],
        [-0.6238794, 53.0583227]
      ]
    }
  }
]

const seededLocationDescriptions = seededGeospatialFeatures.map(
  (feature) => feature.properties.description
)

type MyFixtures = {
  formPage: FormPage
  selectPageTypePage: SelectPageTypePage
  selectQuestionTypePage: SelectQuestionTypePage
  pageOverview: PageOverview
  editQuestionPage: EditQuestionPage
}

async function clickMapButton(page: Page, buttonId: string) {
  await page.locator(`#${buttonId}`).evaluate((button) => {
    ;(button as HTMLButtonElement).click()
  })
}

async function openMapTool(page: Page, buttonId: string) {
  await expect(page.locator('canvas.maplibregl-canvas').first()).toBeVisible()
  await clickMapButton(page, buttonId)
  await page.waitForTimeout(200)
}
// hidden textarea with geojson
async function seedGeospatialFeatures(page: Page) {
  await page
    .locator('textarea')
    .first()
    .evaluate((textarea, features) => {
      const field = textarea as HTMLTextAreaElement
      field.value = JSON.stringify(features, null, 2)
      field.dispatchEvent(new Event('input', { bubbles: true }))
      field.dispatchEvent(new Event('change', { bubbles: true }))
    }, seededGeospatialFeatures)
}

async function closeMapHelpOverlay(page: Page) {
  const overlay = page.getByRole('dialog', { name: 'How to use this map' })
  const closeButton = overlay.getByRole('button', {
    name: 'Close How to use this map'
  })

  if (await overlay.isVisible().catch(() => false)) {
    await closeButton.click({ force: true })
  }

  await expect(overlay).toBeHidden()
}

async function completeOverviewForPublishing(page: Page) {
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Overview' })
    .click()
  await page.waitForURL('**/library/**')

  await page
    .getByRole('link', { name: 'Enter email address for support' })
    .click()
  await page
    .getByRole('textbox', { name: 'Email address' })
    .fill(supportEmailAddress)
  await page
    .getByRole('textbox', { name: 'Response time' })
    .fill('We aim to respond within 2 working days')
  await page.getByRole('button', { name: 'Save and continue' }).click()

  await page.getByRole('link', { name: 'Enter what happens next' }).click()
  await page
    .getByRole('textbox', {
      name: 'What will happen after a user submits a form?'
    })
    .fill(
      "We'll send you an email to let you know the outcome. You'll usually get a response within 10 working days."
    )
  await page.getByRole('button', { name: 'Save and continue' }).click()

  await page.getByRole('link', { name: 'Add privacy notice' }).click()
  const privacyNoticePage = new PrivacyNoticePage(page)
  await privacyNoticePage.selectPrivacyNoticeType('link')
  await privacyNoticePage.fillPrivacyNoticeUrl(
    'https://www.gov.uk/help/privacy-notice'
  )
  await privacyNoticePage.clickSaveAndContinue()

  await page
    .getByRole('link', { name: 'Enter email address', exact: true })
    .click()
  await page
    .getByRole('textbox', {
      name: 'What email address should submitted forms be sent to?'
    })
    .fill(submissionsEmailAddress)
  await page.getByRole('button', { name: 'Save and continue' }).click()

  await page
    .getByRole('link', { name: 'Enter phone number for support' })
    .click()
  await page.getByRole('textbox', { name: 'phone' }).fill('01234 567890')
  await page.getByRole('button', { name: 'Save and continue' }).click()

  await page
    .getByRole('link', { name: 'Enter online contact link for support' })
    .click()
  await page
    .getByRole('textbox', { name: 'Contact link', exact: true })
    .fill('https://www.defra.gov.uk/contact')
  await page
    .getByRole('textbox', { name: 'Text to describe the contact link' })
    .fill('Online contact form')
  await page.getByRole('button', { name: 'Save and continue' }).click()
  await page.waitForURL('**/library/**')
}

async function agreeToTermsAndConditions(page: Page) {
  const termsAndConditionsPage = new TermsAndConditionsPage(page)

  await page.getByRole('link', { name: 'Incomplete' }).click()
  await page.waitForURL('**/edit/terms-and-conditions')
  await termsAndConditionsPage.agreeToTerms()
  await termsAndConditionsPage.clickSaveAndContinue()
  await page.waitForURL('**/library/**')
}

async function publishForm(page: Page) {
  await page.getByRole('button', { name: 'Make draft live' }).click()
  await page.waitForURL('**/make-draft-live**')
  await page.getByRole('button', { name: 'Make draft live' }).click()
  await page.waitForURL('**/library/**')

  await expect(page.getByText('Live').first()).toBeVisible()
}

async function getLiveFormUrl(page: Page) {
  const liveLink = page
    .locator('a[href*="/form/"]:not([href*="/preview/"])')
    .first()

  await expect(liveLink).toBeVisible()

  const href = await liveLink.getAttribute('href')
  expect(href).toBeTruthy()

  if (!href) {
    throw new Error('Expected live form link to have an href')
  }

  return href
}

async function startFormIfRequired(page: Page) {
  const startNowLink = page.getByRole('link', { name: /Start now/i })
  if (await startNowLink.isVisible().catch(() => false)) {
    await startNowLink.click()
    return
  }

  const startNowButton = page.getByRole('button', { name: /Start now/i })
  if (await startNowButton.isVisible().catch(() => false)) {
    await startNowButton.click()
  }
}

const test = baseTest.extend<MyFixtures>({
  formPage: async ({ page }, use) => {
    const formPage = new FormPage(page)
    await formPage.goTo()
    const formName =
      'Automated test - Playwright map form ' +
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

test('1.8 - should create a new form with an area or points on a map question', async ({
  page,
  formPage,
  selectPageTypePage,
  selectQuestionTypePage,
  pageOverview,
  editQuestionPage
}) => {
  test.setTimeout(120_000)

  await formPage.addNewPageButton.click()

  await selectPageTypePage.choosePageType('question')

  await selectQuestionTypePage.selectQuestionType('location')
  await selectQuestionTypePage.selectSubtype('areaOrPointsOnMap')
  await selectQuestionTypePage.clickSaveAndContinue()

  await expect(
    page.getByRole('heading', { name: 'Using maps in your form' })
  ).toBeVisible()
  await expect(
    page.getByRole('link', {
      name: 'map question pattern (opens in a new tab)'
    })
  ).toBeVisible()

  await formPage.createWrittenAnswer(
    'Add all the barn locations',
    'Mark all barn locations on a map'
  )

  await pageOverview.verifySuccessBanner('Changes saved successfully')
  await pageOverview.verifyPageHeading('Page 1')

  await pageOverview.clickChangeLinkForQuestionByName(
    'Add all the barn locations'
  )

  await editQuestionPage.fillQuestionDetails(
    'Add all the barn locations',
    'You can add points, shapes or lines to the map.',
    'Add all barn locations on a map'
  )
  await editQuestionPage.clickSaveAndContinue()

  await pageOverview.verifySuccessBanner('Changes saved successfully')

  await completeOverviewForPublishing(page)
  await agreeToTermsAndConditions(page)
  await publishForm(page)
  const liveFormUrl = await getLiveFormUrl(page)

  await page.setViewportSize({ width: 1440, height: 1400 })
  await page.goto(liveFormUrl)
  await startFormIfRequired(page)

  await expect(
    page.getByRole('heading', { name: 'Add all the barn locations' })
  ).toBeVisible()
  await expect(
    page.getByText('How to use this map', { exact: true })
  ).toBeVisible()

  await closeMapHelpOverlay(page)

  await openMapTool(page, 'geospatialmap_0-btn-add-point')
  await openMapTool(page, 'geospatialmap_0-btn-add-polygon')
  await openMapTool(page, 'geospatialmap_0-btn-add-line')
  await seedGeospatialFeatures(page)

  await expect
    .poll(async () => {
      const value = await page.locator('textarea').first().inputValue()
      const features = JSON.parse(value) as Array<{
        properties?: { description?: string }
      }>

      return features.map((feature) => feature.properties?.description ?? '')
    })
    .toEqual(seededLocationDescriptions)

  await page.getByRole('button', { name: 'Continue' }).click({ force: true })

  await expect(page).toHaveURL(/\/summary(?:#|\?|$)/)
  await expect(
    page.getByRole('heading', {
      name: 'Check your answers before sending your form'
    })
  ).toBeVisible()
  await expect(
    page.locator('dt.govuk-summary-list__key', { hasText: 'Barn locations' })
  ).toBeVisible()
  await expect(page.getByText('Added 3 locations')).toBeVisible()

  await page.getByRole('button', { name: 'Submit' }).click()

  await expect(page).toHaveURL(/\/status(?:#|\?|$)/)
  await expect(
    page.getByRole('heading', { name: 'Form submitted' })
  ).toBeVisible()
})
