import { test, expect, Page } from '@playwright/test';
import { FormPage } from '../../pages/FormPage';
import { LibraryPage } from '../../pages/LibraryPage';

async function createForm(page: Page, formName: string) {
    const formPage = new FormPage(page);
    const libraryPage = new LibraryPage(page);
    await libraryPage.goto();
    await libraryPage.clickCreateForm();
    await formPage.enterFormName(formName);
    await formPage.selectRadioOption('Environment Agency');
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk');
    await formPage.editDraft();
    await expect(formPage.addNewPageButton).toBeVisible();
}

test('should be logged in and on the library page', async ({ page }) => {
    await page.goto('http://localhost:3000/library');
    await expect(page).toHaveURL(/\/library/);
    await expect(page.getByRole('heading', { name: 'Forms library' })).toBeVisible();
    await expect(page.getByRole('link', { name: process.env.AUTH_DISPLAY_NAME })).toBeVisible();
});

test('should create a form and then find it using the search', async ({ page }) => {
    const libraryPage = new LibraryPage(page);
    const formName = libraryPage.generateNewFormName('Test search form')
    await createForm(page, formName);

    // Go back to the library and search for the form
    await libraryPage.goto();
    await libraryPage.searchForm(formName);

    // Verify that the created form is visible
    await expect(page.getByRole('link', { name: formName })).toBeVisible();
});

test('should display "no forms found" message when searching for a non-existent form', async ({ page }) => {
    const libraryPage = new LibraryPage(page);
    await libraryPage.goto();

    const nonExistentFormName = 'This form does not exist ' + Math.random();
    await libraryPage.searchForm(nonExistentFormName);

    await expect(libraryPage.formsTable.locator('tbody tr')).toHaveCount(0);
});

test('should return multiple results for a partial search', async ({ page }) => {
    const libraryPage = new LibraryPage(page);
    const commonNamePart = 'Partial Search ' + Math.random();
    const formNameA = `${commonNamePart} A`;
    const formNameB = `${commonNamePart} B`;
    const uniqueFormName = `Unique Form ${Math.random()}`;

    await createForm(page, formNameA);
    await createForm(page, formNameB);
    await createForm(page, uniqueFormName);

    await libraryPage.goto();
    await libraryPage.searchForm(commonNamePart);

    await expect(page.getByRole('link', { name: formNameA })).toBeVisible();
    await expect(page.getByRole('link', { name: formNameB })).toBeVisible();
    await expect(page.getByRole('link', { name: uniqueFormName })).not.toBeVisible();
    await expect(libraryPage.formsTable.locator('tbody tr')).toHaveCount(2);
});


test('should be case-insensitive', async ({ page }) => {
    const libraryPage = new LibraryPage(page)
    const formName = libraryPage.generateNewFormName('Case-Insensitive Test Form')
    await createForm(page, formName)

    await libraryPage.goto();

    // Search with lowercase
    await libraryPage.searchForm(formName.toLowerCase());
    await expect(page.getByRole('link', { name: formName })).toBeVisible();

    // Search with uppercase
    await libraryPage.searchForm(formName.toUpperCase());
    await expect(page.getByRole('link', { name: formName })).toBeVisible();
});

test('should clear the search and show all forms', async ({ page }) => {
    const libraryPage = new LibraryPage(page)
    const formNameA = libraryPage.generateNewFormName('Clear Search A')
    const formNameB = libraryPage.generateNewFormName('Clear Search B')

    await createForm(page, formNameA);
    await createForm(page, formNameB);

    await libraryPage.goto();

    // Search for one form and verify it's the only one visible
    await libraryPage.searchForm(formNameA);
    await expect(page.getByRole('link', { name: formNameA })).toBeVisible();
    await expect(page.getByRole('link', { name: formNameB })).not.toBeVisible();

    // Click the clear filters button and wait for UI to update
    await libraryPage.clearFilters();

    // Wait for the filter input to be empty
    await expect(page.getByRole('textbox', { name: 'Form name' })).toHaveValue('');

});

