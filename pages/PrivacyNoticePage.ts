import { Page, Locator, expect } from '@playwright/test'
import { PageBase } from '~/pages/PageBase.js'

export class PrivacyNoticePage extends PageBase {
    readonly heading: Locator
    readonly caption: Locator
    readonly privacyNoticeInput: Locator
    readonly privacyNoticeHint: Locator
    readonly saveAndContinueButton: Locator
    readonly cancelButton: Locator

    constructor(page: Page) {
        super(page)
        this.heading = page.getByRole('heading', { level: 1, name: /Privacy notice for this form/ })
        this.caption = page.locator('.govuk-caption-l')
        this.privacyNoticeInput = page.locator('#privacyNoticeUrl')
        this.privacyNoticeHint = page.locator('#privacyNoticeUrl-hint')
        this.saveAndContinueButton = page.getByRole('button', { name: 'Save and continue' })
        this.cancelButton = page.getByRole('button', { name: 'Cancel' })
    }

    async fillPrivacyNoticeUrl(url: string) {
        await this.privacyNoticeInput.fill(url)
    }

    async clickSaveAndContinue() {
        await this.saveAndContinueButton.click()
        await this.page.waitForLoadState()
        await this.page.waitForLoadState()
    }

    async clickCancel() {
        await this.cancelButton.click()
    }

    async expectOnPage() {
        await expect(this.heading).toBeVisible()
        await expect(this.privacyNoticeInput).toBeVisible()
    }
} 