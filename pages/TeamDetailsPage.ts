import { Page, Locator, expect } from '@playwright/test'
import { PageBase } from '~/pages/PageBase.js'

export class TeamDetailsPage extends PageBase {
    readonly heading: Locator
    readonly teamNameInput: Locator
    readonly teamNameHint: Locator
    readonly teamEmailInput: Locator
    readonly teamEmailHint: Locator
    readonly saveAndContinueButton: Locator

    constructor(page: Page) {
        super(page)
        this.heading = page.getByRole('heading', { level: 1, name: 'Team details' })
        this.teamNameInput = page.locator('#teamName')
        this.teamNameHint = page.locator('#teamName-hint')
        this.teamEmailInput = page.locator('#teamEmail')
        this.teamEmailHint = page.locator('#teamEmail-hint')
        this.saveAndContinueButton = page.getByRole('button', { name: 'Save and continue' })
    }

    async fillTeamDetails(teamName: string, teamEmail: string) {
        await this.teamNameInput.fill(teamName)
        await this.teamEmailInput.fill(teamEmail)
    }

    async clickSaveAndContinue() {
        await this.saveAndContinueButton.click()
        await this.waitUntilReady()
    }

    async expectOnPage() {
        await expect(this.heading).toBeVisible()
        await expect(this.teamNameInput).toBeVisible()
        await expect(this.teamEmailInput).toBeVisible()
    }
} 