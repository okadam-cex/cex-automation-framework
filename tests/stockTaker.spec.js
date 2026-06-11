import { test } from '@playwright/test';
import { StockTakerPage } from '../src/pages/stockManagement/StockTakerPage.js';
import { writeAllureEnvironmentProperties } from './allureEnvWriter.js';
import { dashLocators } from '../src/common/dashLocators.js';
import { handleGlobalLoader } from '../src/common/dashHelpers.js';

const testData = {
  loginUser: "Omkar Kadam",              
  staffTag: "666",                       
  category: "NFC Figures",
  branchName: "UTWATF - Cex Watford 2022", 
  BoxID: ['00045496893989', '0000505189323', '00045496893996', '00045496893989'] 
};

test.beforeEach(async ({ page }) => {
  // 1. Navigate directly to dashboard (Login is bypassed via auth.json)
  await page.goto('https://uat-dashwin2022.cex.webuy.dev/home/');
  
  // 2. Clear the session-specific Branch prompt
  await dashLocators.branchSelection.branchOption(page, testData.branchName).waitFor({ state: 'visible', timeout: 10000 });
  await dashLocators.branchSelection.branchOption(page, testData.branchName).click();
  await dashLocators.branchSelection.branchSaveBtn(page).click();

  // 3. Clear the session-specific Manager PIN prompt
  await dashLocators.branchSelection.staffTagInput(page).fill(process.env.APP_TAG || testData.staffTag);
  await dashLocators.branchSelection.tagModalYesBtn(page).click();

  // 4. Wait for the dashboard to stabilize
  await handleGlobalLoader(page);
});

// TEST NAME ALIGNED EXACTLY WITH JIRA SCENARIO
test('DASH-TC-1483: Scenario 1 - Complete Stock Check End-to-End Flow', async ({ page }) => {
  const jiraTestCaseId = 'DASH-TC-1483';
  
  writeAllureEnvironmentProperties({
    "Test Case ID": jiraTestCaseId,
    "Test User": testData.loginUser,
    "Branch Location": testData.branchName,
    "Target Module": "Stock Taker Tool",
    "Audit Category": testData.category
  });

  const stockTakerPage = new StockTakerPage(page);

  await stockTakerPage.navigateToModule(testData.staffTag);
  await stockTakerPage.startNewStockCheck(testData.category);

  for (const currentBoxId of testData.BoxID) {
    await stockTakerPage.scanBoxIdViaKeyboardReturn(currentBoxId);
  }

  await stockTakerPage.verifyProductVisibleInGrid('Amiibo');
  await stockTakerPage.clickNextToProceed();
  await stockTakerPage.incrementActualQuantityForBox(testData.BoxID[0], 1);
  await stockTakerPage.completeVariancePreview();
  await stockTakerPage.clickVarianceNow();
  await stockTakerPage.handleVarianceConfirmationModal(testData.staffTag);
  
// Saves screenshot using the Jira ID inside the newly mapped nested folder!
  await page.screenshot({ path: `tests/outputScreenshots/stockManagement/stockTaker/${jiraTestCaseId}_Final_State.png`, fullPage: true });
  await stockTakerPage.verifyAndResetStockTakerSuccessState();
});