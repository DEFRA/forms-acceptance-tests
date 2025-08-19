import { Page, Locator, expect } from '@playwright/test';

export class AddEditPagesPage {
    readonly page: Page;

    readonly mainHeading: Locator;
    readonly addNewPageButton: Locator;
    readonly manageConditionsButton: Locator;
    readonly uploadFormButton: Locator;
    readonly downloadFormButton: Locator;
    readonly summaryCardTitle: Locator;
    readonly summaryCardEditLink: Locator;
    readonly summaryCardPreviewLink: Locator;
    readonly backToFormOverviewLink: Locator;
    readonly downloadCopyLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.mainHeading = page.getByRole('heading', { name: /Add and edit pages/i });
        this.addNewPageButton = page.getByRole('button', { name: 'Add new page' });
        this.manageConditionsButton = page.getByRole('button', { name: 'Manage conditions' });
        this.uploadFormButton = page.getByRole('button', { name: 'Upload a form' });
        this.downloadFormButton = page.getByRole('button', { name: 'Download this form' });
        this.summaryCardTitle = page.getByRole('heading', { name: 'Check your answers' });
        this.summaryCardEditLink = page.getByRole('link', { name: /Edit.*Check your answers/i });
        this.summaryCardPreviewLink = page.getByRole('link', { name: /Preview.*Check your answers/i });
        this.backToFormOverviewLink = page.getByRole('link', { name: /Back to form overview/i });
        this.downloadCopyLink = page.getByRole('link', { name: 'download a copy' });
    }

    async clickAddNewPage() {
        await this.addNewPageButton.click();
    }

    async clickManageConditions() {
        await this.manageConditionsButton.click();
    }

    async clickUploadForm() {
        await this.uploadFormButton.click();
    }

    async clickDownloadForm() {
        await this.downloadFormButton.click();
    }

    async clickDownloadCopyLink() {
        await this.downloadCopyLink.click();
    }

    async clickSummaryCardEdit() {
        await this.summaryCardEditLink.click();
    }

    async clickSummaryCardPreview() {
        await this.summaryCardPreviewLink.click();
    }

    async verifyMainHeading() {
        await expect(this.mainHeading).toBeVisible();
    }

    async verifySummaryCardTitle() {
        await expect(this.summaryCardTitle).toBeVisible();
    }

    async clickBackToFormOverview() {
        await this.backToFormOverviewLink.click();
    }
} 