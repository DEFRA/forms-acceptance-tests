import { test, expect } from '@playwright/test'
import { FormPage } from '~/pages/FormPage.js'
import { SelectPageTypePage } from '~/pages/SelectPageTypePage.js'
import { SelectQuestionTypePage } from '~/pages/SelectQuestionTypePage.js'
import { PageOverview } from '~/pages/PageOverview.js'
import { ReOrderPages } from '~/pages/ReOrderPages.js'

// Helper to add a page with a specific question type
async function addPage(formPage: FormPage, selectPageTypePage: SelectPageTypePage, selectQuestionTypePage: SelectQuestionTypePage, pageType: 'question' | 'guidance', questionType?: string, subtype?: string, questionText?: string, description?: string) {
    await formPage.clickAddNewPage()
    await selectPageTypePage.choosePageType(pageType)
    if (pageType === 'question' && questionType) {
        await selectQuestionTypePage.selectQuestionType(questionType)
        if (subtype) {
            await selectQuestionTypePage.selectSubtype(subtype)
        }
        await selectQuestionTypePage.clickSaveAndContinue()
        await formPage.createWrittenAnswer(questionText || 'Default question', description || 'Default description')
    } else if (pageType === 'guidance') {
        // For guidance page, just save
        await formPage.saveAndContinueButton.click()
    }
    await formPage.clickBackToAddEditPages()
}

test.beforeEach(async({ page }) => {
  await page.context().clearCookies({ name: 'formsSession' })
  await page.context().clearCookies({ name: 'csrfToken' })
})

test.skip('should allow re-ordering of pages and display Save button', async ({ page }) => {
    const formPage = new FormPage(page)
    const selectPageTypePage = new SelectPageTypePage(page)
    const selectQuestionTypePage = new SelectQuestionTypePage(page)
    const pageOverview = new PageOverview(page)

    // Step 1: Create a form
    await formPage.goTo()
    const formName = formPage.generateNewFormName('Reorder Test Form ')
    await formPage.enterFormName(formName)
    await formPage.selectRadioOption('Environment Agency')
    await formPage.fillTeamDetails('Team A', 'test@test.gov.uk')
    await formPage.editDraft()

    // Step 2: Add a page heading so we can add more than one question
    await formPage.setPageHeading(formName)

    // Step 3: Add 4 pages with mixture of component types
    await addPage(formPage, selectPageTypePage, selectQuestionTypePage, 'question', 'writtenAnswer', 'shortAnswer', 'What is your name?', 'Name')

    await addPage(formPage, selectPageTypePage, selectQuestionTypePage, 'question', 'writtenAnswer', 'longAnswer', 'Tell us about yourself', 'Bio')

    await addPage(formPage, selectPageTypePage, selectQuestionTypePage, 'question', 'date', 'dateMonthYear', 'Your date of birth', 'DOB')

    await addPage(formPage, selectPageTypePage, selectQuestionTypePage, 'question', 'writtenAnswer', 'shortAnswer', 'What is your favourite fruit', 'fruit')

    // Step 4: Click re-order button
    await pageOverview.clickReorderPages()

    // Step 5: Check Save button is displayed
    const reorderPages = new ReOrderPages(page)
    await expect(reorderPages.saveChangesButton).toBeVisible()

    // Step 6: Drag the last page to the first position
    await reorderPages.dragPage(3, 0)

    // Step 7: Save the changes
    await reorderPages.saveChanges()

    // Step 8: Verify the new order
    await pageOverview.verifySuccessBanner("Changes saved successfully")
    const pageTitles = await pageOverview.getPageTitles()
    console.log('Page titles:', pageTitles)
    expect(pageTitles[0]).toContain('What is your favourite fruit')
}) 