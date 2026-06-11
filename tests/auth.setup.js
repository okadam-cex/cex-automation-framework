import { test as setup } from '@playwright/test';
import { LoginPage } from '../src/pages/commonPages/LoginPage.js';
import path from 'path';

const authFile = path.join(process.cwd(), 'auth.json');

setup('Execute Global Auth Setup', async ({ page }) => {
  const loginPage = new LoginPage(page);

  const targetOAuthUrl = process.env.OAUTH_LOGIN_URL;
  const username = process.env.CEXTOOLS_USERNAME || 'okadam';
  const password = process.env.CEXTOOLS_PASSWORD || 'cex@12345';
  
  // Dynamic profile inputs for Branch variables
  const branchName = 'UTWATF - Cex Watford 2022';
  const managerTag = process.env.APP_TAG || '666';

  // Execute the expanded full authentication sequence method
  await loginPage.loginWithOAuth(targetOAuthUrl, username, password, branchName, managerTag);

  // Freeze session storage data including verified branch context to auth.json file
  await page.context().storageState({ path: authFile });
  console.log('Login completed.');
});