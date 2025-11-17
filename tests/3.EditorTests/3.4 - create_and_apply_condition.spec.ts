import { test, expect } from '@playwright/test'
import { FormPage } from '../../pages/FormPage'
import { SelectPageTypePage } from '../../pages/SelectPageTypePage'
import { SelectQuestionTypePage } from '../../pages/SelectQuestionTypePage'
import { PageOverview } from '../../pages/PageOverview'
import { EditConditionPage } from '../../pages/EditConditionPage'
import { ManagerConditionsPage } from '../../pages/ManagerConditionsPage'
import { link } from 'fs'

test('should create a condition for Yes/No and apply it to page 2', async ({
  page
}) => {
  // Step 1: Create a form
  const formPage = new FormPage(page)
  const selectPageTypePage = new SelectPageTypePage(page)
  const selectQuestionTypePage = new SelectQuestionTypePage(page)
  const pageOverview = new PageOverview(page)
  await formPage.goTo()
  const formName =
    'Condition test form ' + Math.random().toString().substring(2, 8)
  await formPage.enterFormName(formName)
  await formPage.selectRadioOption('Environment Agency')
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')
  await formPage.editDraft()

  // Step 2: Add a Yes/No component to Page 1
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('list')
  await selectQuestionTypePage.selectSubtype('yesNo')
  await selectQuestionTypePage.clickSaveAndContinue()
  await formPage.createWrittenAnswer('Are you over 18?', 'over 18')

  // Go back to add/edit pages before adding the next page
  await formPage.clickBackToAddEditPages()

  // Step 3: Create Page 2 with any component
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('writtenAnswer')
  await selectQuestionTypePage.selectSubtype('shortAnswer')
  await selectQuestionTypePage.clickSaveAndContinue()
  await formPage.createWrittenAnswer('What is your name?', 'name')

  // Step 4: Go to Manage conditions page
  await expect(pageOverview.manageConditionsButton).toBeVisible()
  await pageOverview.manageConditionsButton.click()
  await pageOverview.goToCreateNewCondition()

  // Step 5: Create a condition where value is 'Yes' for YesNo question
  const editConditionPage = new EditConditionPage(page)
  await editConditionPage.selectQuestion('Page 1: Are you over 18?')
  await editConditionPage.selectOperator('Is')
  await editConditionPage.selectYesNoValue('Yes')
  await editConditionPage.setConditionName('Over 18 Yes')
  await editConditionPage.saveCondition()
  await expect(page.getByText('Changes saved successfully')).toBeVisible()

  // Assert user is redirected to Manage Conditions page
  const managerConditionsPage = new ManagerConditionsPage(page)
  await managerConditionsPage.assertOnManagerConditionsPage()
  const headingText = await managerConditionsPage.getPageHeadingText()
  expect(headingText).toMatch(/Manage conditions/i)

  // Assert that the created condition is displayed
  await expect(page.getByText('Over 18 Yes')).toBeVisible()

  // Assert page layout: heading, columns, and edit/delete links
  await expect(page.getByText('All conditions')).toBeVisible()

  await expect(
    page.getByRole('columnheader', { name: /Used in/i })
  ).toBeVisible()
  await expect(
    page.getByRole('columnheader', { name: /Condition/i })
  ).toBeVisible()
  await expect(
    page.getByRole('columnheader', { name: /Actions/i })
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /Delete/i })).toBeVisible()

  // Assert that the table row for 'Over 18 Yes' contains an Edit link
  const row = page.locator('tr', { hasText: 'Over 18 Yes' })
  await expect(row.getByRole('link', { name: /Edit/i })).toBeVisible()
})

test('should not allow creating two conditions with the same name', async ({
  page
}) => {
  // Setup: Create a form and add a Yes/No question
  const formPage = new FormPage(page)
  const selectPageTypePage = new SelectPageTypePage(page)
  const selectQuestionTypePage = new SelectQuestionTypePage(page)
  const pageOverview = new PageOverview(page)
  await formPage.goTo()
  const formName =
    'Duplicate condition test ' + Math.random().toString().substring(2, 8)
  await formPage.enterFormName(formName)
  await formPage.selectRadioOption('Environment Agency')
  await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')
  await formPage.editDraft()
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('list')
  await selectQuestionTypePage.selectSubtype('yesNo')
  await selectQuestionTypePage.clickSaveAndContinue()
  await formPage.createWrittenAnswer('Are you over 18?', 'over 18')
  await formPage.clickBackToAddEditPages()
  await formPage.addNewPageButton.click()
  await selectPageTypePage.choosePageType('question')
  await selectQuestionTypePage.selectQuestionType('writtenAnswer')
  await selectQuestionTypePage.selectSubtype('shortAnswer')
  await selectQuestionTypePage.clickSaveAndContinue()
  await formPage.createWrittenAnswer('What is your name?', 'name')
  await expect(pageOverview.manageConditionsButton).toBeVisible()
  await pageOverview.manageConditionsButton.click()
  await page.getByRole('link', { name: 'conditions manager' }).click()

  // Create first condition
  const managerConditionsPage = new ManagerConditionsPage(page)
  await managerConditionsPage.assertOnManagerConditionsPage()

  await managerConditionsPage.createNewConditionLink.click()
  const editConditionPage = new EditConditionPage(page)
  await editConditionPage.selectQuestion('Page 1: Are you over 18?')
  await editConditionPage.selectOperator('Is')
  await editConditionPage.selectYesNoValue('Yes')
  await editConditionPage.setConditionName('DuplicateName')
  await editConditionPage.saveCondition()

  const headingText = await managerConditionsPage.getPageHeadingText()
  expect(headingText).toMatch(/Manage conditions/i)
  await expect(page.getByText('DuplicateName')).toBeVisible()

  // Try to create a second condition with the same name

  await managerConditionsPage.clickCreateNewConditions()
  await editConditionPage.selectQuestion('Page 1: Are you over 18?')
  await editConditionPage.selectOperator('Is')
  await editConditionPage.selectYesNoValue('No')
  await editConditionPage.setConditionName('DuplicateName')
  await editConditionPage.saveCondition()
  // Assert error is shown for duplicate name
  await expect(page.getByText('duplicate condition name').first()).toBeVisible()
})
