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
  secondProductName: "NEW 3DS Cover Plate 8-Bit Characters" 
};

test.beforeEach(async ({ page }) => {
  await page.goto('https://uat-dashwin2022.cex.webuy.dev/home/');
  
  await dashLocators.branchSelection.branchOption(page, testData.branchName).waitFor({ state: 'visible', timeout: 10000 });
  await dashLocators.branchSelection.branchOption(page, testData.branchName).click();
  await dashLocators.branchSelection.branchSaveBtn(page).click();

  await dashLocators.branchSelection.staffTagInput(page).fill(process.env.APP_TAG || '666');
  await dashLocators.branchSelection.tagModalYesBtn(page).click();

  await handleGlobalLoader(page);
});

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

  // Step 8: search particular transaction with boxid
  await boxHistoryPage.searchByBoxId(testData.firstBoxId, 'Step8');
  await boxHistoryPage.verifySearchResultVisible(testData.firstProductName);

  // Step 9: clear filters
  await boxHistoryPage.clearFilters();

  // Step 10: Enter the second box name utilizing the autocomplete picker
  await boxHistoryPage.searchBoxWithAutocomplete(testData.secondBoxId, testData.secondProductName);
  await boxHistoryPage.verifySearchResultVisible(testData.secondProductName);
  
  // Step 11: Click the search result item to open details
  await boxHistoryPage.openBoxDetails(testData.secondProductName);
  
  // Step 12: Click inner filter search button to populate history logs
  await boxHistoryPage.searchInnerHistoryRecords();
  
  // Step 13: Intercept and save the CSV file export directly to the runner output directory
  const targetDownloadDirectory = test.info().outputDir;
  await boxHistoryPage.exportHistoryToCSV(targetDownloadDirectory);
  
  // Save final state screenshot
  await page.screenshot({ path: `tests/outputScreenshots/boxHistory/${jiraTestCaseId}_Final_State.png`, fullPage: true });
});