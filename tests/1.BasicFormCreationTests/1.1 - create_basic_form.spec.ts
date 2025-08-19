import { FormPage } from '../../pages/FormPage';
import { expect, test, TestInfo } from '@playwright/test';
import { SelectPageTypePage } from '../../pages/SelectPageTypePage';
import { LibraryPage } from '../../pages/LibraryPage';
import { faker } from '@faker-js/faker/locale/en';


test('1.1.1 - should create a new form with short answer field', async ({ page }, testInfo) => {

  //create a form
  const formPage = new FormPage(page);
  const selectPageTypePage = new SelectPageTypePage(page);
  formPage.goTo();
  const form_name = 'Automated test - Playwright form ' + Math.random().toString().substring(0, 10)

  await formPage.enterFormName(form_name);
  await formPage.selectRadioOption('Environment Agency');
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk');

  // Edit draft
  await formPage.editDraft();


  // Add a new question page

  await formPage.addNewPageButton.click();
  await selectPageTypePage.verifyPageStructure();
  await selectPageTypePage.choosePageType('question');
  await formPage.addNewQuestionPage('What is your name?', 'Your name');
  expect(formPage.successBannerIsDisplayed());


});



test('1.1.2 - Missing page heading error when adding second question', async ({ page }) => {

  //create a form
  const formPage = new FormPage(page);
  const selectPageTypePage = new SelectPageTypePage(page);

  formPage.goTo();
  const form_name = 'Automated test - Playwright form ' + Math.random().toString().substring(0, 10)

  await formPage.enterFormName(form_name);
  await formPage.selectRadioOption('Environment Agency');
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk');

  // Edit draft
  await formPage.editDraft();

  // Add a new question page
  await formPage.addNewPageButton.click();
  await selectPageTypePage.chooseQuestionPage()
  await formPage.addNewQuestionPage('What is your name?', 'Your name');

  // Add another question
  await formPage.addAnotherQuestion();
  await formPage.checkErrorIsDisplayed();

});

test('1.1.3- Missing a page type "What kind of page do you need"', async ({ page }) => {

  //create a form
  const formPage = new FormPage(page);
  const selectPageTypePage = new SelectPageTypePage(page);

  formPage.goTo();
  const form_name = 'Automated test - Playwright form ' + Math.random().toString().substring(0, 10)

  await formPage.enterFormName(form_name);
  await formPage.selectRadioOption('Environment Agency');
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk');

  // Edit draft
  await formPage.editDraft();

  // Add a new question page
  await formPage.addNewPageButton.click();
  await selectPageTypePage.clickSaveAndContinue();
  //await selectQuestionType.checkErrorIsDisplayed();

});