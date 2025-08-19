import { Page, Locator, expect } from '@playwright/test';

export class PageOverview {
    readonly page: Page;

    // Locators for page elements
    readonly pageHeading: Locator;
    readonly successBanner: Locator;
    readonly questionList: Locator;
    readonly previewPageButton: Locator;
    readonly addAnotherQuestionButton: Locator;
    readonly deletePageLink: Locator;
    readonly pageHeadingCheckbox: Locator;
    readonly pageHeadingInput: Locator;
    readonly guidanceTextInput: Locator;
    readonly repeaterCheckbox: Locator;
    readonly minItemsInput: Locator;
    readonly maxItemsInput: Locator;
    readonly questionSetNameInput: Locator;
    readonly saveChangesButton: Locator;
    readonly conditionsTabLink: Locator;
    readonly manageConditionsButton: Locator;
    readonly conditionsTitle: Locator;
    readonly noConditionsMessage: Locator;
    readonly conditionsManagerLink: Locator;
    readonly andCreateText: Locator;
    readonly createNewConditionLink: Locator;
    readonly downloadFormButton: Locator;
    readonly reorderPagesButton: Locator;
    readonly saveConditionButton: Locator;


    constructor(page: Page) {
        this.page = page;

        // Initialise locators using Playwright's methods
        this.pageHeading = page.getByText('Page 1', { exact: true });
        this.successBanner = page.locator('div[role="alert"]', { hasText: 'Changes saved successfully' });
        this.questionList = page.locator('dl.govuk-summary-list');
        this.previewPageButton = page.getByRole('button', { name: 'Preview page' });
        this.addAnotherQuestionButton = page.getByRole('button', { name: 'Add another question' });
        this.deletePageLink = page.getByText('Delete page', { exact: true });
        this.pageHeadingCheckbox = page.locator('#pageHeadingAndGuidance');
        this.pageHeadingInput = page.getByRole('textbox', { name: 'Page heading' })
        this.guidanceTextInput = page.getByLabel('Guidance text (optional)');
        this.repeaterCheckbox = page.getByLabel('Allow multiple responses to questions on this page');
        this.minItemsInput = page.getByLabel('Min');
        this.maxItemsInput = page.getByLabel('Max');
        this.questionSetNameInput = page.getByLabel('Give the responses an identifiable name or label');
        this.saveChangesButton = page.getByRole('button', { name: 'Save changes' });
        this.conditionsTabLink = page.getByRole('link', { name: 'Conditions' });
        this.manageConditionsButton = page.getByRole('button', { name: 'Manage conditions' });
        this.conditionsTitle = page.getByRole('heading', { name: 'Control who can see this page based on previous answers' });
        this.noConditionsMessage = page.getByText('No conditions available to use. Create a new condition.');
        this.conditionsManagerLink = page.getByRole('link', { name: 'conditions manager' });
        this.createNewConditionLink = page.getByRole('link', { name: 'Create new condition' });
        this.downloadFormButton = page.getByRole('button', { name: 'Download this form' });
        this.reorderPagesButton = page.getByRole('button', { name: 'Re-order pages' });
        this.saveConditionButton = page.getByRole('button', { name: 'Save condition' });

    }

    async successBannerIsDisplayed() {
        return this.page.locator('text=Changes saved successfully')
    }
    async clickChangeLinkForQuestionByName(questionName: string) {
        const changeLink = this.page.locator(`dd.govuk-summary-list__value >> text=${questionName} >> .. >> dd.govuk-summary-list__actions >> a.govuk-link`, { hasText: 'Change' });
        await changeLink.click();
    }

    async verifyPageHeading(expectedHeading: string) {
        await expect(this.pageHeading).toHaveText(expectedHeading);
    }

    async verifySuccessBanner(expectedMessage: string) {
        await expect(this.successBanner.locator('p.govuk-notification-banner__heading')).toHaveText(expectedMessage);
    }

    async previewPage() {
        await this.previewPageButton.click();
    }

    async addAnotherQuestion() {
        await this.addAnotherQuestionButton.click();
    }

    async deletePage() {
        await this.deletePageLink.click();
    }

    async configurePageHeadingAndGuidance(pageHeading: string, guidanceText: string) {
        await this.pageHeadingCheckbox.check();
        await this.pageHeadingInput.waitFor({ state: 'visible' });
        await this.pageHeadingInput.fill(pageHeading);
        await this.guidanceTextInput.fill(guidanceText);
    }


    async configureRepeater(minItems: number, maxItems: number, questionSetName: string) {
        await this.repeaterCheckbox.check();
        await this.minItemsInput.fill(minItems.toString());
        await this.maxItemsInput.fill(maxItems.toString());
        await this.questionSetNameInput.fill(questionSetName);
    }

    async saveChanges() {
        await this.saveChangesButton.click();
    }

    async clickConditionsTab() {
        await this.conditionsTabLink.click();
        await this.conditionsTitle.waitFor({ state: 'visible' });
    }

    async verifyNoConditionsState() {
        await expect(this.conditionsManagerLink).toBeVisible();
        await expect(this.saveConditionButton).toBeVisible();

    }

    async goToCreateNewCondition() {
        await this.conditionsManagerLink.click();
        await this.createNewConditionLink.click();
    }

    async clickReorderPages() {
        await this.reorderPagesButton.click();
    }

    async getPageTitles(): Promise<string[]> {
        // Select all h2.govuk-summary-card__title, extract the text after the first colon and trim it
        return this.page.$$eval('h2.govuk-summary-card__title', nodes =>
            nodes
                .map(n => n.textContent || '')
                .map(text => {
                    const parts = text.split(':');
                    return parts.length > 1 ? parts.slice(1).join(':').trim() : text.trim();
                })
        );
    }
}