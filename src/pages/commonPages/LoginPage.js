import { expect } from '@playwright/test';
import { dashLocators } from '../../common/dashLocators.js';
import { 
  handleGlobalLoader, 
  logStepAndCapture, 
  clearStaffSecurityGate 
} from '../../common/dashHelpers.js';

export class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async loginWithOAuth(targetUrl, username, password, branchName, managerTag) {
    // Step 1
    await this.page.goto(targetUrl);
    await logStepAndCapture(this.page, 'Step 1', 'Navigate to Login URL', 'login', 'Navigated_To_URL');
    
    // Step 2
    await dashLocators.login.oauthCexToolsLoginBtn(this.page).click();
    await dashLocators.login.oauthUsernameInput(this.page).fill(username);
    await dashLocators.login.oauthPasswordInput(this.page).fill(password);
    await dashLocators.login.oauthSubmitBtn(this.page).click();
    
    // Bypassing UAT redirection screen if it appears
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
    await logStepAndCapture(this.page, 'Step 2', 'Enter credentials and submit', 'login', 'Credentials_Submitted');

    // Step 3
    await dashLocators.branchSelection.branchOption(this.page, branchName).click();
    await dashLocators.branchSelection.branchSaveBtn(this.page).click();
    await logStepAndCapture(this.page, 'Step 3', `Select Branch Location [ ${branchName} ]`, 'login', 'Branch_Selected');

    // Step 4: Rely on our new helper for the Security Gate!
    const tagInput = dashLocators.branchSelection.staffTagInput(this.page);
    const yesBtn = dashLocators.branchSelection.tagModalYesBtn(this.page);
    const modalContainer = dashLocators.branchSelection.tagModalContainer(this.page);

    await clearStaffSecurityGate(this.page, tagInput, yesBtn, modalContainer, managerTag);
    await logStepAndCapture(this.page, 'Step 4', 'Enter Staff PIN to authorize session', 'login', 'Session_Authorized');

    // Final Stabilization
    await handleGlobalLoader(this.page);
    await this.page.waitForLoadState('networkidle').catch(() => {});
    
    console.log('[SUCCESS] Login sequence completed successfully.');
  }
}