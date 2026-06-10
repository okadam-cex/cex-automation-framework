import { test, expect } from '@playwright/test';
import { BoxHistoryPage } from '../src/pages/boxHistory/BoxHistoryPage.js';
import { writeAllureEnvironmentProperties } from './allureEnvWriter.js';

let testCaseIdCounter = 1;

const testData = {
  loginUser: "Omkar Kadam",
  branchName: "UTWATF - Watford 2022",
  targetItemCode: "0045496380564",
  productName: "Nintendo Amiibo Samus Aran Figure"
};

test.beforeEach(async ({ page }) => {
  await page.goto('https://uat-dashwin2022.cex.webuy.dev/home/', { waitUntil: 'domcontentloaded' });
  const dashboardContainer = page.locator('#wrapper, #app, .dash-main-container');
  await dashboardContainer.waitFor({ state: 'attached', timeout: 15000 });

  const branchOption = page.getByText('UTWATF - Cex Watford 2022');
  await branchOption.waitFor({ state: 'visible', timeout: 10000 });
  await branchOption.click();
  await page.locator('button:has-text("Save Changes"), #branches-save').click();

  const staffTagInput = page.locator('#BranchSelection_StaffTagInput, input[type="password"]');
  await staffTagInput.waitFor({ state: 'visible', timeout: 10000 });
  await staffTagInput.fill(process.env.APP_TAG || '666'); 
  await page.locator('#BranchSelection_StaffTagModal input[value="Yes"], button:has-text("Yes")').click();

  const mainLoader = page.locator('#Splashloader, .dash-main-loader');
  await expect(mainLoader).toBeHidden({ timeout: 15000 });
  await page.waitForLoadState('networkidle').catch(() => {});
});

test('E2E Suite - Complete Box History Search Execution', async ({ page }) => {
  const dynamicTestCaseId = `DASH-TC-BH-${testCaseIdCounter}`;
  
  // 🎯 THE FIX: Maps the Box History parameters into the horizontal grid spreadsheet cells!
  writeAllureEnvironmentProperties({
    "Test Case ID": dynamicTestCaseId,
    "Test User": testData.loginUser,
    "Branch Location": testData.branchName,
    "Target Module": "Box History Tool",
    "Audited Code": testData.targetItemCode
  });

  testCaseIdCounter++;
  const boxHistoryPage = new BoxHistoryPage(page);

  await boxHistoryPage.navigateToModule();
  await boxHistoryPage.searchBox(testData.targetItemCode, testData.productName);
  await boxHistoryPage.verifySearchResultVisible(testData.productName);
  
  await page.screenshot({ path: `tests/outputScreenshots/${dynamicTestCaseId}_Success_Snapshot.png`, fullPage: true });
});