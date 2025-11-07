import { Page, Locator, expect } from '@playwright/test'
import { PageBase } from '~/pages/PageBase.js'

export class AddEditPagesPage extends PageBase {
    readonly mainHeading: Locator
    readonly manageConditionsButton: Locator
    readonly uploadFormButton: Locator
    readonly downloadFormButton: Locator
    readonly summaryCardTitle: Locator
    readonly summaryCardEditLink: Locator
    readonly summaryCardPreviewLink: Locator
    readonly backToFormOverviewLink: Locator
    readonly downloadCopyLink: Locator

    constructor(page: Page) {
        super(page)
        this.mainHeading = page.getByRole('heading', { name: /Add and edit pages/i })
        this.manageConditionsButton = page.getByRole('button', { name: 'Manage conditions' })
        this.uploadFormButton = page.getByRole('button', { name: 'Upload a form' })
        this.downloadFormButton = page.getByRole('button', { name: 'Download this form' })
        this.summaryCardTitle = page.getByRole('heading', { name: 'Check your answers' })
        this.summaryCardEditLink = page.getByRole('link', { name: /Edit.*Check your answers/i })
        this.summaryCardPreviewLink = page.getByRole('link', { name: /Preview.*Check your answers/i })
        this.backToFormOverviewLink = page.getByRole('link', { name: /Back to form overview/i })
        this.downloadCopyLink = page.getByRole('link', { name: 'download a copy' })
    }

    async clickManageConditions() {
        await this.manageConditionsButton.click()
    }

    async clickUploadForm() {
        await this.uploadFormButton.click()
    }

    async clickDownloadForm() {
        await this.downloadFormButton.click()
    }

    async clickDownloadCopyLink() {
        await this.downloadCopyLink.click()
    }

    async clickSummaryCardEdit() {
        await this.summaryCardEditLink.click()
    }

    async clickSummaryCardPreview() {
        await this.summaryCardPreviewLink.click()
    }

    async verifyMainHeading() {
        await expect(this.mainHeading).toBeVisible()
    }

    async verifySummaryCardTitle() {
        await expect(this.summaryCardTitle).toBeVisible()
    }

    async clickBackToFormOverview() {
        await this.backToFormOverviewLink.click()
    }
} 