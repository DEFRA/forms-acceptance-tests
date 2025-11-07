import { Page, Locator, expect } from '@playwright/test'
import { PageBase } from '~/pages/PageBase.js'

export class PageListingPage extends PageBase {
    readonly mainHeading: Locator
    readonly caption: Locator
    readonly addNewPageButton: Locator
    readonly reorderPagesButton: Locator
    readonly previewFormLink: Locator
    readonly manageConditionsButton: Locator
    readonly uploadFormButton: Locator
    readonly downloadFormButton: Locator
    readonly pageSummaryCards: Locator
    readonly endPagesHeader: Locator

    constructor(page: Page) {
        super(page)
        this.mainHeading = page.getByRole('heading', { level: 1, name: /Add and edit pages/ })
        this.caption = page.locator('.app-masthead__caption')
        this.addNewPageButton = page.getByRole('button', { name: 'Add new page' })
        this.reorderPagesButton = page.getByRole('button', { name: 'Re-order pages' })
        this.previewFormLink = page.getByRole('link', { name: 'Preview form' })
        this.manageConditionsButton = page.getByRole('button', { name: 'Manage conditions' })
        this.uploadFormButton = page.getByRole('button', { name: 'Upload a form' })
        this.downloadFormButton = page.getByRole('button', { name: 'Download this form' })
        this.pageSummaryCards = page.locator('.govuk-summary-card.pages-panel-left-standard')
        this.endPagesHeader = page.getByRole('heading', { level: 2, name: /End pages/ })
    }

    async getPageTitles(): Promise<string[]> {
        return this.page.locator('.govuk-summary-card__title').allTextContents()
    }

    async clickReorderPages() {
        await this.reorderPagesButton.click()
    }

    async clickPreviewForm() {
        await this.previewFormLink.click()
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

    async getPageSummaryCardByTitle(title: string): Promise<Locator> {
        return this.page.locator('.govuk-summary-card__title', { hasText: title }).first().locator('..').locator('..').locator('..')
    }

    async verifyStructure() {
        await expect(this.mainHeading).toBeVisible()
        await expect(this.caption).toBeVisible()
        await expect(this.addNewPageButton).toBeVisible()
        await expect(this.reorderPagesButton).toBeVisible()
        await expect(this.previewFormLink).toBeVisible()
        await expect(this.manageConditionsButton).toBeVisible()
        await expect(this.uploadFormButton).toBeVisible()
        await expect(this.downloadFormButton).toBeVisible()
        await expect(this.pageSummaryCards.first()).toBeVisible()
        await expect(this.endPagesHeader).toBeVisible()
    }
} 