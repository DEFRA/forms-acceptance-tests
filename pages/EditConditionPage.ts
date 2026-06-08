import { Page, Locator } from '@playwright/test'

export class EditConditionPage {
    readonly page: Page

    // Locators for form fields and actions
    readonly selectQuestionDropdown: Locator
    readonly selectQuestionButton: Locator
    readonly operatorDropdown: Locator
    readonly selectOperatorButton: Locator
    readonly addAnotherConditionButton: Locator
    readonly conditionNameInput: Locator
    readonly saveConditionButton: Locator
    readonly cancelLink: Locator
    readonly pageHeading: Locator
    readonly valueInput: Locator

    constructor(page: Page) {
        this.page = page
        this.pageHeading = page.getByRole('heading', { name: /Create new condition/i })
        this.selectQuestionDropdown = page.locator('select[name="items[0][componentId]"]')
        this.selectQuestionButton = page.locator('button[name="action"][value="confirmSelectComponentId"]')
        this.operatorDropdown = page.locator('select[name="items[0][operator]"]')
        this.selectOperatorButton = page.locator('button[name="action"][value="confirmSelectOperator"]')
        this.addAnotherConditionButton = page.getByRole('button', { name: /Add another condition/i })
        this.conditionNameInput = page.locator('#displayName')
        this.saveConditionButton = page.getByRole('button', { name: /Save condition/i })
        this.cancelLink = page.locator('#cancel-condition')
        this.valueInput = page.locator('input[name="items[0][value]"]')
    }

    async checkAllComponentsAreDisplayed() {


    }

    async selectQuestion(label: string) {
        await this.selectQuestionDropdown.selectOption({ label })
        await this.selectQuestionButton.click()
    }

    async selectOperator(label: string) {
        await this.operatorDropdown.selectOption({ label })
        await this.selectOperatorButton.click()
    }

    async addAnotherCondition() {
        await this.addAnotherConditionButton.click()
    }

    async setConditionName(name: string) {
        await this.conditionNameInput.fill(name)
    }

    async saveCondition() {
        await this.saveConditionButton.click()
    }

    async cancel() {
        await this.cancelLink.click()
    }

    async enterValue(value: string) {
        await this.valueInput.fill(value)
    }

    /**
     * For list-based questions (checkboxes, radios, autocomplete, select), the
     * "Select a value" area is rendered as a set of checkboxes - one per list
     * item. Checking more than one lets a single condition match a range of
     * answers.
     */
    async selectListValues(labels: string[]) {
        for (const label of labels) {
            await this.page
                .getByRole('checkbox', { name: label, exact: true })
                .check()
        }
    }

    /**
     * Checkbox questions use the "contains" operator and offer a coordinator to
     * decide whether all selected values must be present (AND) or any one of
     * them (OR).
     */
    async setCheckboxCoordinator(mode: 'and' | 'or') {
        await this.page
            .locator(
                `input[name="items[0][value][itemsCoordinator]"][value="${mode}"]`
            )
            .check()
    }

    async selectYesNoValue(value: 'Yes' | 'No') {
        // Yes = value="true", No = value="false"
        const radioValue = value === 'Yes' ? 'true' : 'false'
        await this.page.locator(`input[type="radio"][name="items[0][value]"][value="${radioValue}"]`).check()
    }
} 