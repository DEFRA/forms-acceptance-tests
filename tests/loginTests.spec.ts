import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { log } from 'console';

test.skip('Log out', async ({ page }) => {

    const invalidEmail = 'invalid@fgdfg.com';
    const invalidPassword = 'wrongpassword';

    const loginPage = new LoginPage(page);
    loginPage.navigateToLoginPage();
    loginPage.clickLogOut();
    loginPage.clickContinueBtn();
    loginPage.clickUseAnotherAccount();

    // Perform login with invalid credentials
    await loginPage.enterInvalidUserName(invalidEmail);
    await loginPage.isInvalidUsernameErrorMessageDisplayed();

});