import { Page, Locator } from '@playwright/test';
import { PageBase } from '~/pages/PageBase.js';

export class LibraryPage extends PageBase {
    readonly createNewFormButton: Locator;
    readonly searchInput: Locator;
    readonly deleteButton: Locator;
    readonly formsTable: Locator;
    readonly clearFiltersButton: Locator;
    // Sorting locators
    readonly sortSelect: Locator;
    readonly sortButton: Locator;

    constructor(page: Page) {
        super(page)
        this.createNewFormButton = page.getByRole('button', { name: 'Create a new form' });
        this.searchInput = page.getByRole('textbox', { name: 'Form name' })
        this.deleteButton = page.getByRole('link', { name: 'Delete draft' });
        this.formsTable = page.getByRole('table');
        this.clearFiltersButton = page.getByRole('button', { name: 'Clear filters' }).first();
        // Sorting locators
        this.sortSelect = page.locator('#sort-select');
        this.sortButton = page.getByRole('button', { name: 'Sort forms' });
    }

    async goto() {
        await this.page.goto('/library')
        await this.page.waitForLoadState()
    }

    async searchForm(formName: string) {
        await this.searchInput.fill(formName);
        await this.page.keyboard.press('Enter');
    }

    async clickCreateForm() {
        await this.createNewFormButton.click();
        await this.page.waitForLoadState()
    }

    async clearFilters() {
        await this.clearFiltersButton.click();
    }

    async deleteForm() {
        await this.deleteButton.click(); // Click the delete button
        await this.page.getByRole('button', { name: 'Delete form' }).click(); // Confirm deletion
    }

    // Method to select a sort option and trigger sorting
    async sortBy(optionValue: string) {
        await this.sortSelect.selectOption(optionValue);
        await this.sortButton.click();
    }

    // Method to get the list of form names in the table (desktop view)
    async getFormNames(): Promise<string[]> {
        return this.page.locator('table.app-display-from-desktop tbody tr td:first-child a').allTextContents();
    }
}

