import { test } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

test.skip('Log out', async ({ page }) => {
  const invalidEmail = 'invalid@fgdfg.com'

  const loginPage = new LoginPage(page)
  await loginPage.navigateToLoginPage()
  await loginPage.clickLogOut()
  loginPage.clickContinueBtn()
  loginPage.clickUseAnotherAccount()

  // Perform login with invalid credentials
  await loginPage.enterInvalidUserName(invalidEmail)
  await loginPage.isInvalidUsernameErrorMessageDisplayed()
})
