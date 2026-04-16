import { expect, type Page, test } from '@playwright/test'
import fs from 'node:fs'
import { setTimeout } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

import { FormPage } from '~/pages/FormPage.js'
import { PrivacyNoticePage } from '~/pages/PrivacyNoticePage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { SelectQuestionTypePage } from '~/pages/SelectQuestionTypePage.js'
import { TermsAndConditionsPage } from '~/pages/TermsAndConditionsPage.js'
import { createAdminAccessToken } from '~/tests/utils/auth.js'

const uploadFixturePath = fileURLToPath(
  new URL('../../test-data/test_upload.txt', import.meta.url)
)

const designerBaseUrl = process.env.DESIGNER_BASE_URL
const submissionApiBaseUrl = process.env.SUBMISSION_API_BASE_URL
const supportEmailAddress = 'support@defra.gov.uk'
const submissionsEmailAddress = 'submissions@defra.gov.uk'

type SubmissionData = {
  data?: {
    files?: unknown
  } | null
}

async function addWrittenAnswerPage(
  formPage: FormPage,
  selectPageTypePage: SelectPageTypePage,
  selectQuestionTypePage: SelectQuestionTypePage
) {
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('writtenAnswer')
  await selectQuestionTypePage.selectSubtype('shortAnswer')
  await selectQuestionTypePage.clickSaveAndContinue()
  await formPage.createWrittenAnswer('What is your name?', 'Your name')
}

async function addSupportingEvidencePage(
  formPage: FormPage,
  selectPageTypePage: SelectPageTypePage,
  selectQuestionTypePage: SelectQuestionTypePage
) {
  await formPage.clickBackToAddEditPages()
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('fileUpload')
  await selectQuestionTypePage.clickSaveAndContinue()
  await formPage.createFileUpload(
    'Upload supporting evidence',
    'Add a file that supports your application'
  )
}

async function turnReferenceNumberPageOn(formPage: FormPage) {
  // enable reference number
  await formPage.checkYourAnswersLink.click()
  await formPage.referenceNumberLink.click()
  await formPage.page
    .getByRole('checkbox', { name: 'Turn on the reference number' })
    .check()
  await formPage.page.getByRole('button', { name: 'Save changes' }).click()
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

async function submitLiveForm(page: Page, liveFormUrl: string) {
  await page.goto(liveFormUrl)
  await startFormIfRequired(page)

  await page
    .getByRole('textbox', { name: /What is your name\?/i })
    .fill('Test User')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.locator('input[type="file"]').setInputFiles(uploadFixturePath)
  await page.getByRole('button', { name: 'Upload file' }).click()
  await expect(page.getByRole('alert')).toContainText('1 file uploaded', {
    timeout: 30_000
  })
  await expect(page.getByText('Uploaded', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(
    page.getByRole('heading', { name: /Check your answers/i })
  ).toBeVisible()
  await expect(page.getByText(/Uploaded 1 file/i)).toBeVisible()

  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page).toHaveURL(/\/status(?:\/|\?|$)/)
  await expect(
    page.getByRole('heading', { name: /Form submitted/i })
  ).toBeVisible()

  // get confirmation number to verify submission succeeded
  const confirmationDiv = page.getByText(/Your reference number/i).first()
  await expect(confirmationDiv).toBeVisible()
  const confirmationText = await confirmationDiv.textContent()
  const match = new RegExp(
    /Your reference number\s*([A-Z0-9]{3}(?:-[A-Z0-9]{3}){2})/
  ).exec(confirmationText ?? '')

  const referenceNumber = match?.[1]
  expect(referenceNumber).toBeTruthy()

  if (!referenceNumber) {
    throw new Error('Expected form submission to include a reference number')
  }

  return referenceNumber
}

async function getSubmissionDataByReferenceNumber(referenceNumber: string) {
  const token = await createAdminAccessToken()
  if (!token) {
    throw new Error('Access token is required to request submission data')
  }
  let submissionData: SubmissionData | undefined
  if (!submissionApiBaseUrl) {
    throw new Error('SUBMISSION_API_BASE_URL environment variable is not set')
  }
  await expect
    .poll(
      async () => {
        const result = await requestSubmissionData(
          submissionApiBaseUrl,
          referenceNumber,
          token
        )
        console.log('Submission data API response for reference number', {
          referenceNumber,
          result: result.status
        })
        if (result.status === 'success') {
          submissionData = result.data
        }

        return result.status
      },
      {
        intervals: [5_000],
        message: `Submission with reference number ${referenceNumber} was not found before timeout`,
        timeout: 60_000
      }
    )
    .toBe('success')

  return submissionData
}

async function requestSubmissionData(
  baseUrl: string,
  referenceNumber: string,
  token: string | undefined
) {
  if (!token) {
    throw new Error('Access token is required to request submission data')
  }
  const response = await fetch(
    `${baseUrl}/submission/${encodeURIComponent(referenceNumber)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  const responseText = await response.text()

  if (response.status === 404) {
    return { status: 'not-found' as const }
  }

  if (!response.ok) {
    throw new Error(
      `Submission API request failed for ${baseUrl}: ${response.status} ${responseText}`
    )
  }

  return {
    data: JSON.parse(responseText) as SubmissionData,
    status: 'success' as const
  }
}

function getFirstFileIdFromSubmissionData(submissionData: unknown): string {
  const discoveredFileId = findFirstFileId(submissionData)

  expect(discoveredFileId).toBeTruthy()

  if (!discoveredFileId) {
    throw new Error('Expected submission data to include at least one fileId')
  }

  return discoveredFileId
}

function findFirstFileId(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  if ('fileId' in value && typeof value.fileId === 'string') {
    return value.fileId
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const fileId = findFirstFileId(item)
      if (fileId) {
        return fileId
      }
    }

    return undefined
  }

  for (const key in value) {
    if (Object.hasOwn(value, key)) {
      const fileId = findFirstFileId((value as Record<string, unknown>)[key])
      if (fileId) {
        return fileId
      }
    }
  }

  return undefined
}

async function downloadFileFromDesigner(
  page: Page,
  fileId: string,
  emailAddress: string
) {
  await page.goto(`${designerBaseUrl}/file-download/${fileId}`)
  await expect(
    page.getByRole('heading', { name: 'You have a file to download' })
  ).toBeVisible()

  await page.getByRole('textbox', { name: 'Email address' }).fill(emailAddress)
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download file' }).click()

  await expect(
    page.getByRole('heading', { name: 'Your file is downloading' })
  ).toBeVisible()

  const downloadPath = await download
  const filePath = await downloadPath.path()
  expect(filePath).toBeTruthy()

  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`Expected downloaded file to exist for fileId ${fileId}`)
  }
}

test('1.7.1 - should create, publish and submit a form with supporting evidence and download the file', async ({
  page,
  browser
}, testInfo) => {
  test.setTimeout(120_000)
  const formPage = new FormPage(page)
  const selectPageTypePage = new SelectPageTypePage(page)
  const selectQuestionTypePage = new SelectQuestionTypePage(page)
  const formName =
    'File upload test ' + Math.random().toString().substring(2, 10)

  await formPage.goTo()
  await formPage.enterFormName(formName)
  await formPage.selectRadioOption('Environment Agency')
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')
  await formPage.editDraft()

  await addWrittenAnswerPage(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage
  )
  await addSupportingEvidencePage(
    formPage,
    selectPageTypePage,
    selectQuestionTypePage
  )
  // back to edit pages
  await formPage.clickBackToAddEditPages()

  // turn ref number on
  await turnReferenceNumberPageOn(formPage)

  await completeOverviewForPublishing(page)
  await agreeToTermsAndConditions(page)
  await publishForm(page)

  const liveFormUrl = await getLiveFormUrl(page)
  const referenceNumber = await submitLiveForm(page, liveFormUrl)

  // wait for submission data to be available in forms-submission-api and log it (to help with debugging if the next step fails)
  const submissionData =
    await getSubmissionDataByReferenceNumber(referenceNumber)
  const fileId = getFirstFileIdFromSubmissionData(submissionData?.data?.files)

  // adding a 10 sec delay for file to be available in s3 bucket.
  await setTimeout(10_000)
  // a new browser context is required to test the file download flow as it involves going to a public URL without authentication, which would not work in the same context as the form submission which requires authentication
  const context = await browser.newContext({
    recordVideo: {
      dir: testInfo.outputPath('file-download-context-videos'),
      size: { height: 720, width: 1280 }
    }
  })

  let newPage: Page | undefined
  let downloadFlowError: unknown

  try {
    newPage = await context.newPage()
    await downloadFileFromDesigner(newPage, fileId, submissionsEmailAddress)
  } catch (error) {
    downloadFlowError = error
    throw error
  } finally {
    await context.close()
    // video can only be saved after context is closed
    if (downloadFlowError && newPage) {
      const video = newPage.video()

      if (video) {
        const videoPath = await video.path()

        if (videoPath && fs.existsSync(videoPath)) {
          await testInfo.attach('file-download-context-video', {
            contentType: 'video/webm',
            path: videoPath
          })
        }
      }
    }
  }
})
