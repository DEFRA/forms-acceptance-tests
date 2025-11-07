import { Page, Locator, expect } from '@playwright/test'
import { PageBase } from '~/pages/PageBase.js'

export class UploadPage extends PageBase {
    readonly mainHeading: Locator
    readonly downloadCopyLink: Locator
    readonly fileInput: Locator
    readonly uploadButton: Locator
    readonly cancelButton: Locator

    constructor(page: Page) {
        super(page)
        this.mainHeading = page.getByRole('heading', { name: /Upload a form/i })
        this.downloadCopyLink = page.getByRole('link', { name: 'download a copy' })
        this.fileInput = page.locator('input[type="file"][id="formDefinition"]')
        this.uploadButton = page.getByRole('button', { name: 'Upload form' })
        this.cancelButton = page.getByRole('button', { name: 'Cancel' })
    }

    async clickDownloadCopyLink() {
        await this.downloadCopyLink.click()
    }

    async uploadFormFile(filePath: string) {
        await this.fileInput.setInputFiles(filePath)
        await this.uploadButton.click()
    }

    async clickCancel() {
        await this.cancelButton.click()
    }

    async verifyMainHeading() {
        await expect(this.mainHeading).toBeVisible()
    }
} 