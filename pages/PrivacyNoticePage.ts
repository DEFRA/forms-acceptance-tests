import { Page, Locator, expect } from '@playwright/test';

export class PrivacyNoticePage {
    readonly page: Page;
    readonly heading: Locator;
    readonly caption: Locator;
    readonly privacyNoticeTypes: Record<string, Locator>;
    readonly privacyNoticeText: Locator;
    readonly privacyNoticeUrl: Locator;
    readonly saveAndContinueButton: Locator;
    readonly cancelButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole('heading', { level: 1, name: /Privacy notice for this form/ });
        this.caption = page.locator('.govuk-caption-l');
        this.privacyNoticeTypes = {
            text: page.getByRole('radio', { name: 'Directly to the form' }),
            link: page.getByRole('radio', { name: 'Link to a privacy notice on GOV.UK' })
        }
        this.privacyNoticeText = page.locator('#privacyNoticeText');
        this.privacyNoticeUrl = page.locator('#privacyNoticeUrl');
        this.saveAndContinueButton = page.getByRole('button', { name: 'Save and continue' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    }

    async selectPrivacyNoticeType(type: keyof typeof this.privacyNoticeTypes) {
    const radioButton = this.privacyNoticeTypes[type]
    if (!radioButton) {
      throw new Error(`Unknown privacy notice type: ${type}`)
    }
    await radioButton.check()
  }

    async fillPrivacyNoticeUrl(url: string) {
        await this.privacyNoticeUrl.fill(url);
    }

    async fillPrivacyNoticeText(text: string) {
        await this.privacyNoticeText.fill(text);
    }

    async clickSaveAndContinue() {
        await this.saveAndContinueButton.click();
    }

    async clickCancel() {
        await this.cancelButton.click();
    }

    async expectOnPage() {
        await expect(this.heading).toBeVisible();
        await expect(this.privacyNoticeTypes.text).toBeVisible();
        await expect(this.privacyNoticeTypes.link).toBeVisible();
    }
} 