import { test } from '@playwright/test';
import { TransferOutPage } from '../src/pages/stockManagement/TransferOutPage.js';
import { writeAllureEnvironmentProperties } from './allureEnvWriter.js';
import { dashLocators } from '../src/common/dashLocators.js';
import { handleGlobalLoader } from '../src/common/dashHelpers.js';

const testData = {
  loginUser: "Omkar Kadam",              
  branchName: "UTWATF - Cex Watford 2022",
  destination: "CeX Media Centre",      
  reason: "RMA Stock Out",              
  method: "By Hand (Name in Notes)",    
  imeiBoxId: "04549650CPB8BITA",        
  testSerial: "356417995089964",
  labelPrinter: "SNBC_Cloud",
  receiptPrinter: "UAT_Receipt_DASH",
  managerPin: "666"
};

test.use({ storageState: 'auth.json' }); 

test.beforeEach(async ({ page }) => {
  await page.goto('https://uat-dashwin2022.cex.webuy.dev/home/');
  
  await dashLocators.branchSelection.branchOption(page, testData.branchName).waitFor({ state: 'visible', timeout: 10000 });
  await dashLocators.branchSelection.branchOption(page, testData.branchName).click();
  await dashLocators.branchSelection.branchSaveBtn(page).click();

  await dashLocators.branchSelection.staffTagInput(page).fill(process.env.APP_TAG || '666');
  await dashLocators.branchSelection.tagModalYesBtn(page).click();

  await handleGlobalLoader(page);
});

test('DASH-TC-1671: Scenario 1 - Complete Transfer Out End-to-End Workflow', async ({ page }, testInfo) => {
  const jiraTestCaseId = 'DASH-TC-1671';
  
  writeAllureEnvironmentProperties({
    "Test Case ID": jiraTestCaseId,
    "Test User": testData.loginUser,
    "Branch Location": testData.branchName,
    "Target Module": "Transfer Out"
  });

  const transferOutPage = new TransferOutPage(page);

  await transferOutPage.navigateToModule('Step 1 & 2');
  await transferOutPage.verifyDropdownsHaveValues('Step 3');
  await transferOutPage.configureTransferDetails(testData.destination, testData.reason, testData.method, 'Step 4');
  await transferOutPage.scanBoxAndHandleSerialValidation(testData.imeiBoxId, testData.testSerial, 'Step 5 & 6');
  await transferOutPage.configurePrintersAndPreferences(testData.labelPrinter, testData.receiptPrinter, 'Step 8');
  
  // Pass testInfo into the method call for Arwa's code
  await transferOutPage.submitTransferAndExtractOrder(testInfo, testData.managerPin, 'Step 9 & 10');
});