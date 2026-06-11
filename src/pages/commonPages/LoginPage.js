import { expect } from '@playwright/test';
import { dashLocators } from '../../common/dashLocators.js';
import { handleGlobalLoader } from '../../common/dashHelpers.js';

export class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async loginWithOAuth(targetUrl, username, password, branchName, managerTag) {
    console.log('Step 1: Navigate to Login URL');
    await this.page.goto(targetUrl);
    
    console.log('Step 2: Enter credentials and submit');
    await dashLocators.login.oauthCexToolsLoginBtn(this.page).click();
    await dashLocators.login.oauthUsernameInput(this.page).fill(username);
    await dashLocators.login.oauthPasswordInput(this.page).fill(password);
    await dashLocators.login.oauthSubmitBtn(this.page).click();
    
    try {
      const errorLink = dashLocators.login.errorGoBackHomeLink(this.page);
      await errorLink.waitFor({ state: 'visible', timeout: 5000 });
      console.log('Bypassing UAT redirection screen...');
      await errorLink.click();
    } catch (e) {
      // Bypassed cleanly
    }

    await this.page.waitForURL('**/home**', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await handleGlobalLoader(this.page);

    console.log(`Step 3: Select Branch Location [ ${branchName} ]`);
    await dashLocators.branchSelection.branchOption(this.page, branchName).click();
    await dashLocators.branchSelection.branchSaveBtn(this.page).click();

    console.log('Step 4: Enter Staff PIN to authorize session');
    await dashLocators.branchSelection.staffTagInput(this.page).fill(managerTag);
    await dashLocators.branchSelection.tagModalYesBtn(this.page).click();

    await expect(dashLocators.branchSelection.tagModalContainer(this.page)).toBeHidden({ timeout: 10000 });
    await handleGlobalLoader(this.page);
    await this.page.waitForLoadState('networkidle').catch(() => {});
    
    console.log('Login sequence completed successfully.');
  }
}