import { expect } from '@playwright/test';

export class LoginPage {
  constructor(page) {
    this.page = page;
    
    // Core identity form components
    this.oauthCexToolsLoginBtn = page.getByRole('button', { name: 'Login with CeXTools' });
    this.oauthUsernameInput = page.locator('#UserName');
    this.oauthPasswordInput = page.locator('#Password');
    this.oauthSubmitBtn = page.getByRole('button', { name: 'Login', exact: true });
    
    // Interception locators for environment redirect anomalies
    this.errorGoBackHomeLink = page.getByRole('link', { name: 'Home', exact: true });
    this.splashLoader = page.locator('#Splashloader, .dash-main-loader');

    // BRAND SELECTION & SECURITY MODAL LOCATORS
    this.branchSaveBtn = page.locator('#branches-save');
    this.staffTagInput = page.locator('#BranchSelection_StaffTagInput');
    this.tagModalYesBtn = page.locator('#BranchSelection_StaffTagModal input[value="Yes"]');
    this.tagModalContainer = page.locator('#BranchSelection_StaffTagModal');
  }

  /**
   * Executes a single global session authorization loop, bypasses UAT redirect errors,
   * handles branch selection, and completes manager PIN clearance.
   */
  async loginWithOAuth(targetUrl, username, password, branchName, managerTag) {
    // 1. Navigate to the identity server URL
    await this.page.goto(targetUrl);
    
    // 2. Open login inputs
    await this.oauthCexToolsLoginBtn.click();
    
    // 3. Fill user credentials
    await this.oauthUsernameInput.fill(username);
    await this.oauthPasswordInput.fill(password);
    
    // 4. Submit form
    await this.oauthSubmitBtn.click();
    
    // 5. Intercept redirect anomalies if present
    try {
      await this.errorGoBackHomeLink.waitFor({ state: 'visible', timeout: 5000 });
      console.log('Redirect anomaly caught. Forcing page route...');
      await this.errorGoBackHomeLink.click();
    } catch (e) {
      console.log('App navigated past auth gate without errors.');
    }

    // 6. Change wait state behavior to trigger as soon as the DOM is parsed
    await this.page.waitForURL('**/home**', { 
      waitUntil: 'domcontentloaded', 
      timeout: 25000 
    });
    
    // 7. Settle baseline background loaders
    await expect(this.splashLoader).toBeHidden({ timeout: 15000 });

    // 8. SELECT TARGET REPOSITORY STORE BRANCH
    const targetStore = this.page.getByText(branchName);
    await targetStore.waitFor({ state: 'visible', timeout: 10000 });
    await targetStore.click();
    await this.branchSaveBtn.click();

    // 9. ENTER SECURITY PIN AUTHORIZATION GATES
    await this.staffTagInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.staffTagInput.fill(managerTag);
    await this.tagModalYesBtn.click();

    // 10. Confirm security clearance dialog hides and system unblocks
    await expect(this.tagModalContainer).toBeHidden({ timeout: 10000 });
    await expect(this.splashLoader).toBeHidden({ timeout: 15000 });
    
    // THE CRITICAL SOLUTION STABILIZATION:
    // Forces Playwright to wait until all backend API requests finish fetching 
    // and the dashboard layout stops spinning before saving state!
    await this.page.waitForLoadState('networkidle').catch(() => {});
    
    console.log('Login, Branch Selection, and Security clearance verified successfully!');
  }
}