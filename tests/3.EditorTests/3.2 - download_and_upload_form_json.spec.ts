import { test, expect, Page } from '@playwright/test'
import { FormPage } from '../../pages/FormPage.js'
import { AddEditPagesPage } from '../../pages/AddEditPagesPage.js'
import { UploadPage } from '../../pages/UploadPage.js'
import * as fs from 'fs'

// This test assumes authentication is handled by storageState

// Helper to download a form and parse JSON
async function downloadAndParseJson(page: Page, downloadAction: () => Promise<void>) {
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        downloadAction()
    ])
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    const fileContents = fs.readFileSync(downloadPath, 'utf-8')
    let json
    expect(() => { json = JSON.parse(fileContents) }).not.toThrow()
    expect(json).toBeTruthy()
    expect(typeof json).toBe('object')
    return json
}

// Helper to read and parse a local JSON file
function readAndParseJsonFile(filePath: string) {
    const fileContents = fs.readFileSync(filePath, 'utf-8')
    let json
    expect(() => { json = JSON.parse(fileContents) }).not.toThrow()
    expect(json).toBeTruthy()
    expect(typeof json).toBe('object')
    return json
}

test.beforeEach(async({ page }) => {
  await page.context().clearCookies({ name: 'formsSession' })
})

test.skip('3.2.1 - Download form as JSON (both ways)', async ({ page, context }) => {
    // Create a form
    const formPage = new FormPage(page)
    const addEditPagesPage = new AddEditPagesPage(page)
    const uploadPage = new UploadPage(page)

    await formPage.goTo()
    const formName = formPage.generateNewFormName()
    await formPage.enterFormName(formName)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')
    await formPage.editDraft()

    // Wait for Add and edit pages screen
    await addEditPagesPage.verifyMainHeading()

    // Method 1: Download from Add and edit pages
    const json1 = await downloadAndParseJson(page, () => addEditPagesPage.clickDownloadForm())

    // Method 2: Download from Upload a form page
    await addEditPagesPage.clickUploadForm()
    await uploadPage.verifyMainHeading()
    const json2 = await downloadAndParseJson(page, () => uploadPage.clickDownloadCopyLink())

    // Assert both JSONs are deeply equal
    expect(json2).toEqual(json1)
})

test.skip('3.2.2 - Upload a form JSON file and verify', async ({ page }) => {
    // Create a form
    const formPage = new FormPage(page)
    const addEditPagesPage = new AddEditPagesPage(page)
    const uploadPage = new UploadPage(page)

    await formPage.goTo()
    const formName = formPage.generateNewFormName()
    await formPage.enterFormName(formName)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')
    await formPage.editDraft()

    // Wait for Add and edit pages screen
    await addEditPagesPage.verifyMainHeading()

    // Go to Add and edit pages (assume user is already authenticated and on the right page)


    await addEditPagesPage.clickUploadForm()
    await uploadPage.verifyMainHeading()

    // Upload the JSON file
    const filePath = 'test_json_upload.json'
    await uploadPage.uploadFormFile(filePath)

    // Expect to be redirected to Add and edit pages and see the main heading
    await addEditPagesPage.verifyMainHeading()

    // Download the form as JSON after upload
    const downloadedJson = await downloadAndParseJson(page, () => addEditPagesPage.clickDownloadForm())

    // Read the original JSON file
    const originalJson = readAndParseJsonFile(filePath)

    // Assert both JSONs are deeply equal
    expect(downloadedJson).toEqual(originalJson)
}) 