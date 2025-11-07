import { Page, Locator, expect } from '@playwright/test';
import { PageBase } from '~/pages/PageBase.js'

export class ManagerConditionsPage extends PageBase {
    readonly heading: Locator;
    readonly noConditionsMessage: Locator;
    readonly conditionsManagerLink: Locator;
    readonly andCreateText: Locator;
    readonly createNewConditionLink: Locator;

    constructor(page: Page) {
        super(page)
        this.heading = page.getByRole('heading', { name: /Manage conditions/i })
        this.noConditionsMessage = page.getByText('No conditions available to use. Create a new condition.')
        this.conditionsManagerLink = page.getByRole('link', { name: 'conditions manager' })
        this.andCreateText = page.getByText('and create a condition.')
        this.createNewConditionLink = page.getByRole('link', { name: 'Create new condition' })
    }

    async assertOnManagerConditionsPage() {
        await expect(this.heading).toBeVisible()
    }

    async verifyNoConditionsState() {
        await expect(this.noConditionsMessage).toBeVisible()
        await expect(this.conditionsManagerLink).toBeVisible()
        await expect(this.andCreateText).toBeVisible()
    }

    async goToCreateNewCondition() {
        await this.conditionsManagerLink.click()
        await this.clickCreateNewConditions()
    }

    async clickCreateNewConditions() {
        await this.createNewConditionLink.click()
    }

    async getPageHeadingText(): Promise<string> {
        return (await this.heading.textContent())?.trim() || ''
    }
} 