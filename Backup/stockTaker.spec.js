import { test, expect } from '@playwright/test';
import { StockTakerPage } from '../src/pages/stockManagement/StockTakerPage.js';
import { writeAllureEnvironmentProperties } from './allureEnvWriter.js';

let testCaseIdCounter = 1;

const testData = {
  loginUser: "Omkar Kadam",              
  staffTag: "666",                       
  category: "NFC Figures",
  branchName: "UTWATF - Watford 2022",
  // 🚨 BUG REPRODUCTION DATA: The first barcode is deliberately repeated at the end of the scan cycle
  barcodes: ['00045496893989', '0000505189323', '00045496893996', '00045496893989']
};

test.beforeEach(async ({ page }) => {
  // Navigation rule adjusted for smoother execution under network load spikes
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
  
  writeAllureEnvironmentProperties({
    "Test Case ID": dynamicTestCaseId,
    "Test User": testData.loginUser,
    "Branch Location": testData.branchName,
    "Target Module": "Stock Taker Tool",
    "Audit Category": `${testData.category} (Duplicate Scan)`
  });

  testCaseIdCounter++;
  const stockTakerPage = new StockTakerPage(page);

  await stockTakerPage.navigateToModule(testData.staffTag);
  await stockTakerPage.startNewStockCheck(testData.category);

  // Loops through and simulates laser scanning every barcode item
  for (const currentBoxId of testData.barcodes) {
    await stockTakerPage.scanBoxIdViaKeyboardReturn(currentBoxId);
  }

  // Verifies the UI table container updated successfully
  await stockTakerPage.verifyProductVisibleInGrid('Amiibo');

  // Progress past the scanning stage grid layout to load backend variance math calculations
  await stockTakerPage.clickNextToProceed();
  
  // 🛑 BREAKPOINT OVERRIDE: Freezes UI mode execution here so you can verify calculation anomalies live
  console.log('🛑 BREAKPOINT ENGAGED: Holding screen position on the Variance Preview layer...');
  await page.waitForTimeout(600000); // Keeps browser view active for 10 full minutes
});