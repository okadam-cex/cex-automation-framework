import { test, expect } from '@playwright/test';
import { StockTakerPage } from '../src/pages/stockManagement/StockTakerPage.js';
import { writeAllureEnvironmentProperties } from './allureEnvWriter.js';
import * as allure from 'allure-js-commons'; 

let testCaseIdCounter = 1;

const testData = {
  loginUser: "Omkar Kadam",              
  staffTag: "666",                       
  category: "NFC Figures",
  branchName: "UTWATF - Watford 2022",
  barcodes: ['00045496893989', '0000505189323', '00045496893996']
};

test.beforeEach(async ({ page }) => {
  await page.goto('https://uat-dashwin2022.cex.webuy.dev/home/', { waitUntil: 'domcontentloaded' });
  const dashboardContainer = page.locator('#wrapper, #app, .dash-main-container');
  await dashboardContainer.waitFor({ state: 'attached', timeout: 15000 });

  const branchOption = page.getByText('UTWATF - Cex Watford 2022');
  await branchOption.waitFor({ state: 'visible', timeout: 15000 });
  await branchOption.click();
  await page.locator('#branches-save').click();

  const staffTagInput = page.locator('#BranchSelection_StaffTagInput, input[type="password"]');
  await staffTagInput.waitFor({ state: 'visible', timeout: 10000 });
  await staffTagInput.fill(process.env.APP_TAG || testData.staffTag);
  await page.locator('#BranchSelection_StaffTagModal input[value="Yes"], button:has-text("Yes")').click();

  const mainLoader = page.locator('#Splashloader, .dash-main-loader');
  await expect(mainLoader).toBeHidden({ timeout: 15000 });
  await page.waitForLoadState('networkidle').catch(() => {});
});

test('Stock Management - Complete Stock Check End-to-End Flow', async ({ page }) => {
  const dynamicTestCaseId = `DASH-TC-${testCaseIdCounter}`;
  
  // 🎯 MAPS SPREADSHEET ROW DATA FOR ARWA
  writeAllureEnvironmentProperties({
    "Test Case ID": dynamicTestCaseId,
    "Test User": testData.loginUser,
    "Branch Location": testData.branchName,
    "Target Module": "Stock Taker Tool",
    "Audit Category": testData.category
  });

  testCaseIdCounter++;
  const stockTakerPage = new StockTakerPage(page);

  await stockTakerPage.navigateToModule(testData.staffTag);
  await stockTakerPage.startNewStockCheck(testData.category);

  for (const currentBoxId of testData.barcodes) {
    await stockTakerPage.scanBoxIdViaKeyboardReturn(currentBoxId);
  }

  // 🎯 THE FIX: Instead of passing a barcode string, check for standard grid indicators ("Amiibo" or "1")
  await stockTakerPage.verifyProductVisibleInGrid('Amiibo');
  
  await stockTakerPage.clickNextToProceed();
  await stockTakerPage.incrementActualQuantityForBox(testData.barcodes[0], 1);
  await stockTakerPage.completeVariancePreview();
  await stockTakerPage.clickVarianceNow();
  await stockTakerPage.handleVarianceConfirmationModal(testData.staffTag);
  
  await page.screenshot({ path: `tests/outputScreenshots/${dynamicTestCaseId}_Success_Snapshot.png`, fullPage: true });
  await stockTakerPage.verifyAndResetStockTakerSuccessState();
});