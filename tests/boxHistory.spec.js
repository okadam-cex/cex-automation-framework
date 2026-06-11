import { test } from '@playwright/test';
import { BoxHistoryPage } from '../src/pages/boxHistory/BoxHistoryPage.js';
import { writeAllureEnvironmentProperties } from './allureEnvWriter.js';
import { dashLocators } from '../src/common/dashLocators.js';
import { handleGlobalLoader } from '../src/common/dashHelpers.js';

const testData = {
  loginUser: "Omkar Kadam",
  branchName: "UTWATF - Cex Watford 2022",
  firstBoxId: "0045496380564",
  firstProductName: "Nintendo Amiibo Samus Aran Figure",
  secondBoxId: "04549650CPB8BITA",
  secondProductName: "NEW 3DS Cover Plate 8-Bit Characters" // Extracted from your 3rd screenshot
};

test.beforeEach(async ({ page }) => {
  // 1. Navigate directly to dashboard
  await page.goto('https://uat-dashwin2022.cex.webuy.dev/home/');
  
  // 2. Clear the session-specific Branch prompt
  await dashLocators.branchSelection.branchOption(page, testData.branchName).waitFor({ state: 'visible', timeout: 10000 });
  await dashLocators.branchSelection.branchOption(page, testData.branchName).click();
  await dashLocators.branchSelection.branchSaveBtn(page).click();

  // 3. Clear the session-specific Manager PIN prompt
  await dashLocators.branchSelection.staffTagInput(page).fill(process.env.APP_TAG || '666');
  await dashLocators.branchSelection.tagModalYesBtn(page).click();

  // 4. Wait for the dashboard to stabilize
  await handleGlobalLoader(page);
});

// TEST NAME ALIGNED EXACTLY WITH JIRA SCENARIO
test('DASH-TC-202: Regression testing of Box history module', async ({ page }) => {
  const jiraTestCaseId = 'DASH-TC-202';
  
  writeAllureEnvironmentProperties({
    "Test Case ID": jiraTestCaseId,
    "Test User": testData.loginUser,
    "Branch Location": testData.branchName,
    "Target Module": "Box History Tool"
  });

  const boxHistoryPage = new BoxHistoryPage(page);

  // Step 2: click on the box history module.
  await boxHistoryPage.navigateToModule();

  // Step 8: we can search particular transaction with boxid
  await boxHistoryPage.searchByBoxId(testData.firstBoxId);
  await boxHistoryPage.verifySearchResultVisible(testData.firstProductName);

  // Step 9: after entering box id and select the filters and click on the clear button
  await boxHistoryPage.clearFilters();

  // Custom step mapping to your workflow: Search the second box ID
  console.log(`Step: Enter the second box name and click on search button [ ${testData.secondBoxId} ]`);
  await boxHistoryPage.searchByBoxId(testData.secondBoxId);
  await boxHistoryPage.verifySearchResultVisible(testData.secondProductName);
  
  // Save final state screenshot for Allure / Jira evidence in the dedicated folder
  await page.screenshot({ path: `tests/outputScreenshots/boxHistory/${jiraTestCaseId}_Success_Snapshot.png`, fullPage: true });
});