import { Page, Locator, expect } from '@playwright/test'
import { PageBase } from '~/pages/PageBase.js'

export class ReOrderPages extends PageBase {
    readonly mainHeading: Locator
    readonly caption: Locator
    readonly description: Locator
    readonly saveChangesButton: Locator
    readonly reorderableList: Locator
    readonly reorderableItems: Locator

    constructor(page: Page) {
        super(page)
        this.mainHeading = page.getByRole('heading', { level: 1, name: /Re-order pages/ })
        this.caption = page.locator('.app-masthead__caption')
        this.description = page.locator('.app-masthead__description')
        this.saveChangesButton = page.getByRole('button', { name: 'Save changes' })
        this.reorderableList = page.locator('ol.app-reorderable-list')
        this.reorderableItems = page.locator('li.app-reorderable-list__item')
    }

    async getPageTitles(): Promise<string[]> {
        return this.page.locator('.govuk-summary-card__title.page-title').allTextContents()
    }

    async movePageUp(pageTitle: string) {
        const item = this.page.locator('.govuk-summary-card__title.page-title', { hasText: pageTitle }).first().locator('..').locator('..').locator('..')
        await item.getByRole('button', { name: /Up/ }).first().click()
    }

    async movePageDown(pageTitle: string) {
        const item = this.page.locator('.govuk-summary-card__title.page-title', { hasText: pageTitle }).first().locator('..').locator('..').locator('..')
        await item.getByRole('button', { name: /Down/ }).first().click()
    }

    async saveChanges() {
        await this.saveChangesButton.click()
    }

    async verifyStructure() {
        await expect(this.mainHeading).toBeVisible()
        await expect(this.caption).toBeVisible()
        await expect(this.description).toBeVisible()
        await expect(this.saveChangesButton).toBeVisible()
        await expect(this.reorderableList).toBeVisible()
        await expect(this.reorderableItems.first()).toBeVisible()
    }

    async dragPage(fromIndex: number, toIndex: number) {
        const from = this.reorderableItems.nth(fromIndex)
        const to = this.reorderableItems.nth(toIndex)
        await from.dragTo(to)
    }
} 