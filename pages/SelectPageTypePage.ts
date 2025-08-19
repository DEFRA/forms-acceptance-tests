import { Page, Locator, expect } from '@playwright/test';

export class SelectPageTypePage {

    readonly readonly: Page;

    // Locators
    readonly saveAndContinueButton: Locator;
    readonly questionPageRadio: Locator;
    readonly guidancePageRadio: Locator;
    readonly errorHeading: Locator;
    readonly errorLink: Locator;
    readonly mainHeading: Locator;
    readonly caption: Locator;
    readonly questionPageLabel: Locator;
    readonly questionPageHint: Locator;
    readonly guidancePageLabel: Locator;
    readonly guidancePageHint: Locator;

    constructor(page: Page) {
        this.readonly = page;

        this.saveAndContinueButton = page.getByRole('button', { name: 'Save and continue' });
        this.questionPageRadio = page.getByRole('radio', { name: 'Question page' });
        this.guidancePageRadio = page.getByRole('radio', { name: 'Guidance page' });
        this.errorHeading = page.getByRole('heading', { name: 'There is a problem' });
        this.errorLink = page.getByRole('link', { name: 'Select a page type' });
        this.mainHeading = page.getByText('What kind of page do you need?');
        this.caption = page.locator('.app-masthead__caption');
        this.questionPageLabel = page.locator('label[for="pageType"]');
        this.questionPageHint = page.locator('#pageType-item-hint');
        this.guidancePageLabel = page.locator('label[for="pageType-2"]');
        this.guidancePageHint = page.locator('#pageType-2-item-hint');
    }

    async selectQuestionPage() {
        await this.questionPageRadio.check();
    }

    async selectGuidancePage() {
        await this.guidancePageRadio.check();
    }

    async clickSaveAndContinue() {
        await this.saveAndContinueButton.click();
    }

    async chooseQuestionPage() {
        await this.selectQuestionPage();
        await this.clickSaveAndContinue();
    }

    async chooseGuidancePage() {
        await this.selectGuidancePage();
        await this.clickSaveAndContinue();
    }

    async choosePageType(pageType: 'question' | 'guidance') {
        const radioButton = pageType === 'question'
            ? this.questionPageRadio
            : this.guidancePageRadio;

        await radioButton.check();
        await this.saveAndContinueButton.click();
    }

    async checkErrorIsDisplayed() {
        await this.errorHeading.isVisible();
        await expect(this.errorLink).toHaveText(['Select a page type']);
    }

    async verifyPageStructure() {
        await expect(this.mainHeading).toBeVisible();
        await expect(this.questionPageLabel).toBeVisible();
        await expect(this.questionPageLabel).toHaveText('Question page');
        await expect(this.questionPageHint).toHaveText('A page to hold one or more related questions');
        await expect(this.guidancePageLabel).toBeVisible();
        await expect(this.guidancePageLabel).toHaveText('Guidance page');
        await expect(this.guidancePageHint).toHaveText('If you need to add guidance without asking a question');
    }

}