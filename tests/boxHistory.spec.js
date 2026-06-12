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

test('DASH-TC-202: Regression testing of Box history module', async ({ page }, testInfo) => {
  const jiraTestCaseId = 'DASH-TC-202';
  
  writeAllureEnvironmentProperties({
    "Test Case ID": jiraTestCaseId,
    "Test User": testData.loginUser,
    "Branch Location": testData.branchName,
    "Target Module": "Box History Tool"
  });

  const boxHistoryPage = new BoxHistoryPage(page);

  await boxHistoryPage.navigateToModule('Step 1');
  await boxHistoryPage.searchByBoxId(testData.firstBoxId, 'Step 2');
  await boxHistoryPage.verifySearchResultVisible(testData.firstProductName, 'Step 3');
  await boxHistoryPage.clearFilters('Step 4');
  await boxHistoryPage.searchBoxWithAutocomplete(testData.secondBoxId, testData.secondProductName, 'Step 5');
  await boxHistoryPage.verifySearchResultVisible(testData.secondProductName, 'Step 6');
  await boxHistoryPage.openBoxDetails(testData.secondProductName, 'Step 7');
  await boxHistoryPage.searchInnerHistoryRecords('Step 8');
  
  const targetDownloadDirectory = testInfo.outputDir;
  const downloadedCsvPath = await boxHistoryPage.exportHistoryToCSV(targetDownloadDirectory, 'Step 9');
  
  await testInfo.attach('Box_History_CSV_Report', {
    path: downloadedCsvPath,
    contentType: 'text/csv'
  });
  
  await boxHistoryPage.openFirstTransactionRecord('Step 10');
  await boxHistoryPage.printTransactionReceipt('Step 11');
  
  const managerTag = process.env.APP_TAG || '666';
  await boxHistoryPage.authorizePrintReceipt(managerTag, 'Step 12');
  
  // Pass testInfo into the method call for Arwa's code
  await boxHistoryPage.selectPrinterAndPrint(testInfo, 'UAT_Receipt_DASH', 'Step 13');
});