import { Page, Locator, expect } from '@playwright/test';
import { PageBase } from '~/pages/PageBase.js';

export class GuidancePage extends PageBase {
    readonly mainHeading: Locator;
    readonly pageHeadingInput: Locator;
    readonly pageHeadingHint: Locator;
    readonly guidanceTextInput: Locator;
    readonly guidanceTextHint: Locator;
    readonly exitPageCheckbox: Locator;
    readonly exitPageLabel: Locator;
    readonly exitPageHint: Locator;
    readonly saveButton: Locator;
    readonly deleteLink: Locator;
    readonly manageConditionsButton: Locator;

    constructor(page: Page) {
        super(page)
        this.mainHeading = page.getByRole('heading', { level: 1, name: /Edit guidance page/ });
        this.pageHeadingInput = page.locator('#pageHeading');
        this.pageHeadingHint = page.locator('#pageHeading-hint');
        this.guidanceTextInput = page.locator('#guidanceText');
        this.guidanceTextHint = page.locator('#guidanceText-hint');
        this.exitPageCheckbox = page.locator('#exitPage');
        this.exitPageLabel = page.locator('label[for="exitPage"]');
        this.exitPageHint = page.locator('#exitPage-item-hint');
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.deleteLink = page.getByRole('link', { name: 'Delete page' });
        this.manageConditionsButton = page.getByRole('button', { name: 'Manage conditions' });
    }

    async fillPageHeading(heading: string) {
        await this.pageHeadingInput.fill(heading);
    }

    async fillGuidanceText(text: string) {
        await this.guidanceTextInput.fill(text);
    }

    async setExitPage(checked: boolean) {
        if (checked) {
            if (!await this.exitPageCheckbox.isChecked()) {
                await this.exitPageCheckbox.check();
            }
        } else {
            if (await this.exitPageCheckbox.isChecked()) {
                await this.exitPageCheckbox.uncheck();
            }
        }
    }

    async save() {
        await this.saveButton.click();
    }

    async deletePage() {
        await this.deleteLink.click();
    }

    async manageConditions() {
        await this.manageConditionsButton.click();
    }

    async isExitPageChecked(): Promise<boolean> {
        return this.exitPageCheckbox.isChecked();
    }

    async verifyStructureBeforeSaving() {
        await expect(this.mainHeading).toBeVisible();
        await expect(this.pageHeadingInput).toBeVisible();
        await expect(this.pageHeadingHint).toBeVisible();
        await expect(this.guidanceTextInput).toBeVisible();
        await expect(this.guidanceTextHint).toBeVisible();
        await expect(this.exitPageCheckbox).toBeVisible();
        await expect(this.exitPageLabel).toHaveText('Mark as Exit Page');
        await expect(this.exitPageHint).toHaveText('Users who reach this page will be unable to continue filling out the form');
        await expect(this.saveButton).toBeVisible();
    }

    async verifyStructureAfterSaving() {
        await expect(this.mainHeading).toBeVisible();
        await expect(this.pageHeadingInput).toBeVisible();
        await expect(this.pageHeadingHint).toBeVisible();
        await expect(this.guidanceTextInput).toBeVisible();
        await expect(this.guidanceTextHint).toBeVisible();
        await expect(this.exitPageCheckbox).toBeVisible();
        await expect(this.exitPageLabel).toHaveText('Mark as Exit Page');
        await expect(this.exitPageHint).toHaveText('Users who reach this page will be unable to continue filling out the form');
        await expect(this.saveButton).toBeVisible();
        await expect(this.deleteLink).toBeVisible();
        await expect(this.manageConditionsButton).toBeVisible();
    }
} 