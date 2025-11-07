import { Page, Locator } from '@playwright/test'
import { PageBase } from '~/pages/PageBase.js'


export class LoginPage extends PageBase{
    readonly emailInput: Locator
    // readonly nextButton: Locator
    readonly passwordInput: Locator
    readonly signInButton: Locator
    // readonly confirmYesButton: Locator
    readonly userProfileLink: Locator
    readonly loginErrorMessage: Locator
    readonly signOut: Locator
    // readonly continueBtn: Locator
    // readonly use_another_account: Locator




    constructor(page: Page, displayName: string) {
        super(page)

        this.emailInput = page.getByRole('textbox', { name: 'Username' })
        this.passwordInput = page.getByRole('textbox', { name: 'Password' })
        this.signInButton = page.getByRole('button', { name: 'Login' })
        this.signOut = page.getByRole('link', { name: 'Sign out' })
        this.loginErrorMessage = page.getByText("We c1ouldn\'t find an acco1unt")

        this.userProfileLink = page.getByRole('link', { name: displayName })
    }

    async navigateToLoginPage() {
        await this.page.goto('http://localhost:3000/library')
        await this.page.waitForLoadState()
    }

    async clickLogOut() {
        await this.signOut.click()
    }
    async isInvalidUsernameErrorMessageDisplayed() {
        await this.page.getByText("We couldn't find an account with that username.").click()
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email)
        await this.passwordInput.fill(password)
        await this.signInButton.click()
    }

    async enterInvalidUserName(email: string) {
        await this.emailInput.fill(email)
        await this.signInButton.click()
    }

    async verifyUserLoggedIn() {
        await this.userProfileLink.waitFor({ state: 'visible' })
    }
}