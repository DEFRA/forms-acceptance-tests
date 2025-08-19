import { test, expect } from '@playwright/test';
import { LibraryPage } from '../../pages/LibraryPage';
import { FormPage } from '../../pages/FormPage';
import { SelectPageTypePage } from '../../pages/SelectPageTypePage';

test('1.3.1 - should create a new form with valid data', async ({ page }) => {
  //create a form
  const formPage = new FormPage(page);
  const selectQuestionType = new SelectPageTypePage(page);

  formPage.goTo();
  const form_name = 'Automated test - Playwright form ' + Math.random().toString().substring(0, 10)

  await formPage.enterFormName(form_name);
  await formPage.selectRadioOption('Environment Agency');
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk');

  //this should now be Forms Overview page

  const formTitle = page.getByRole('heading', { name: form_name });
  await expect(formTitle).toHaveText(form_name);

});

test('1.3.2 - should display error for missing form name', async ({ page }) => {
  const libraryPage = new LibraryPage(page);
  const formPage = new FormPage(page);

  // Navigate to the library page and create a new form
  await libraryPage.goto();
  await libraryPage.clickCreateForm();

  // Attempt to continue without entering a form name
  await formPage.continueBtn.click();

  // Verify error message for missing form name
  const errorMessageTop = await formPage.getErrorMessage();
  expect(errorMessageTop).toContain('Enter a form name');
});

test('1.3.3 - should display error for missing email address', async ({ page }) => {
  const libraryPage = new LibraryPage(page);
  const formPage = new FormPage(page);

  // Navigate to the library page and create a new form
  await libraryPage.goto();
  await libraryPage.clickCreateForm();


  // Fill form details
  const formName = 'Automated test - Playwright form ' + Math.random().toString().substring(0, 12);
  await formPage.enterFormName(formName);
  await formPage.selectRadioOption('Defra');
  await formPage.fillTeamDetails('Team A', '');

  // Verify error for missing email address
  const errorMessage = ((await formPage.getErrorMessage()));
  expect(errorMessage).toContain('Enter a shared team email address');
});

[
  { email: 'invalid-email', expected: 'Enter a shared team email address in the correct format' },
  { email: 'test@test.com', expected: 'Enter a shared team email address in the correct format' },
  { email: 'test@', expected: 'Enter a shared team email address in the correct format' },
  { email: '', expected: 'Enter a shared team email address in the correct format' },
].forEach(({ email, expected }) => {
  test.describe(() => {
    test.beforeEach(async ({ page }) => {
      const libraryPage = new LibraryPage(page);
      const formPage = new FormPage(page);

      // Navigate to the library page and create a new form
      await libraryPage.goto();
      await libraryPage.clickCreateForm();

      // Fill form details
      const formName = 'Automated test - Playwright form ' + + Math.random().toString().substring(0, 10);

      await formPage.enterFormName(formName);
      await formPage.selectRadioOption('Defra');
    });
    test(`1.3.4 - testing with email "${email}" and expected message "${expected}"`, async ({ page }) => {
      const formPage = new FormPage(page);
      // await expect(page.getByRole('heading')).toHaveText(expected);
      await formPage.fillTeamDetails('Team A', 'invalid-email');
    });
  });
});



test('1.3.5 - should display error for missing Lead Organisation', async ({ page }) => {
  const libraryPage = new LibraryPage(page);
  const formPage = new FormPage(page);

  // Navigate to the library page and create a new form
  await libraryPage.goto();
  await libraryPage.clickCreateForm();

  // Fill form details
  const formName = 'Automated test - Playwright form ' + + Math.random().toString().substring(0, 10);

  await formPage.enterFormName(formName);
  await formPage.clickContinueBtn();

  // Verify error for invalid email address
  const errorMessage = await formPage.getErrorMessage();
  expect(errorMessage).toContain('Select a lead organisation');
});