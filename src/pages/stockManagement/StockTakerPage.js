import { expect } from '@playwright/test';
import { dashLocators } from '../../common/dashLocators.js';
import { 
  handleGlobalLoader, 
  clearStaffSecurityGate, 
  trackToastAlerts, 
  logStepAndCapture 
} from '../../common/dashHelpers.js';
// ARWA INTEGRATION: Importing her screenshot function
import { captureOrderScreenshotOrderProcessing } from '../../common/helpers.js';

export class StockTakerPage {
  constructor(page) {
    this.page = page;
  }

  async navigateToModule(managerTag) {
    await logStepAndCapture(this.page, 'Step 1', 'Navigate to "Stock Taker Tool" module', 'stockManagement/stockTaker', 'Navigate_To_Module');
    
    await dashLocators.stockTaker.managementGridCard(this.page).waitFor({ state: 'visible', timeout: 15000 });
    await dashLocators.stockTaker.managementGridCard(this.page).click();
    
    await dashLocators.stockTaker.stockTakerCard(this.page).waitFor({ state: 'visible', timeout: 10000 });
    await dashLocators.stockTaker.stockTakerCard(this.page).click();
    
    console.log('Step 2: Scan Level 3 tag'); 
    await clearStaffSecurityGate(
      this.page,
      dashLocators.stockTaker.initialTagInput(this.page),
      dashLocators.stockTaker.initialTagYesBtn(this.page),
      dashLocators.stockTaker.initialModalContainer(this.page),
      managerTag
    );

    await this.page.waitForLoadState('domcontentloaded');
    const closeBtn = dashLocators.stockTaker.releaseNoteCloseBtn(this.page);
    if (await closeBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await closeBtn.click();
    }
    
    await logStepAndCapture(this.page, 'Step 2', 'Scan Level 3 tag (Landing Page Loaded)', 'stockManagement/stockTaker', 'Landing_Page');
  }

  async startNewStockCheck(categoryName, categoryId = '997') {
    await logStepAndCapture(this.page, 'Step 3', 'Click "Start New Stock Check"', 'stockManagement/stockTaker', 'Start_New_Check');
    await dashLocators.stockTaker.newStockCheckBtn(this.page).click({ force: true });

    await logStepAndCapture(this.page, 'Step 4', 'Select Box categories', 'stockManagement/stockTaker', 'Select_Categories');
    await dashLocators.stockTaker.categorySearchInput(this.page).fill(categoryName);
    await this.page.waitForTimeout(1500); 
    await dashLocators.stockTaker.categoryCheckbox(this.page, categoryId).dispatchEvent('click');
    
    await logStepAndCapture(this.page, 'Step 5', 'Click "Proceed to Scan"', 'stockManagement/stockTaker', 'Proceed_To_Scan');
    await dashLocators.stockTaker.proceedToScanBtn(this.page).click({ force: true });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async scanBoxIdViaKeyboardReturn(boxId) {
    const targetField = dashLocators.stockTaker.barcodeScannerInput(this.page);
    await targetField.waitFor({ state: 'visible', timeout: 15000 });
    await targetField.fill(boxId);
    await targetField.press('Enter');
    
    await this.page.waitForTimeout(1500); 
    await trackToastAlerts(this.page);
    
    await logStepAndCapture(this.page, 'Step 6', `Scan multiple boxIDs (including duplicates) -> Box ID: [ ${boxId} ]`, 'stockManagement/stockTaker', `Scanned_${boxId}`);
  }

  async verifyProductVisibleInGrid(productNameText) {
    await expect(dashLocators.stockTaker.gridProductItem(this.page, productNameText)).toBeVisible({ timeout: 10000 });
  }

  async clickNextToProceed() {
    await dashLocators.stockTaker.nextBtn(this.page).click();
    await handleGlobalLoader(this.page);
    
    await logStepAndCapture(this.page, 'Step 7', 'Click "Next"', 'stockManagement/stockTaker', 'Variance_Preview_Screen');
  }

  async incrementActualQuantityForBox(boxId, fallbackValue = "1") {
    const targetedDataRow = dashLocators.stockTaker.varianceTableRows(this.page).filter({ hasText: boxId }).first();
    await targetedDataRow.scrollIntoViewIfNeeded();

    const actualCellElement = targetedDataRow.locator('td:nth-child(6)').first();
    const actionPlusControl = actualCellElement.locator('i.mdi-plus, button').first();
    const actionInputControl = actualCellElement.locator('input').first();

    if (await actionPlusControl.isVisible({ timeout: 2000 }).catch(() => false)) {
      await actionPlusControl.click();
    } else if (await actionInputControl.isVisible({ timeout: 2000 }).catch(() => false)) {
      await actionInputControl.click();
      await actionInputControl.clear();
      await actionInputControl.fill(fallbackValue.toString());
      await actionInputControl.press('Tab');
    } else {
      await actualCellElement.click();
      await this.page.keyboard.type(fallbackValue.toString());
      await this.page.keyboard.press('Tab');
    }
    
    await this.page.waitForTimeout(1000); 
    await logStepAndCapture(this.page, 'Step 8', `Manually updated actual value to test field functionality for Box [ ${boxId} ]`, 'stockManagement/stockTaker', 'Variance_Field_Tested');
  }

  async completeVariancePreview() {
    await logStepAndCapture(this.page, 'Step 9', 'Click "Next"', 'stockManagement/stockTaker', 'Click_Next_Variance');
    await dashLocators.stockTaker.varianceNextBtn(this.page).scrollIntoViewIfNeeded();
    await dashLocators.stockTaker.varianceNextBtn(this.page).click();
    
    try {
      await dashLocators.stockTaker.processingDataModal(this.page).waitFor({ state: 'hidden', timeout: 20000 });
    } catch (e) {}
    await handleGlobalLoader(this.page);
    
    await logStepAndCapture(this.page, 'Step 10', 'Validate summary & variance grid', 'stockManagement/stockTaker', 'Final_Variance_Summary');
  }

  async clickVarianceNow() {
    await logStepAndCapture(this.page, 'Step 11', 'Click "Variance Now"', 'stockManagement/stockTaker', 'Click_Variance_Now');
    await dashLocators.stockTaker.varianceNowBtn(this.page).scrollIntoViewIfNeeded();
    await dashLocators.stockTaker.varianceNowBtn(this.page).click();
  }

  async handleVarianceConfirmationModal(managerTag) {
    const finalTagModalContainer = this.page.locator('#StaffTagModal_StaffTagModal').last();

    await clearStaffSecurityGate(
      this.page,
      dashLocators.stockTaker.finalTagInput(this.page),
      dashLocators.stockTaker.finalTagYesBtn(this.page),
      finalTagModalContainer,
      managerTag
    );
  }

  async verifyAndResetStockTakerSuccessState(testInfo) {
    await expect(dashLocators.stockTaker.successModalContainer(this.page)).toBeVisible({ timeout: 15000 });
    
    // ARWA INTEGRATION: Captures the screenshot natively for her portal app
    const timestamp = new Date().getTime();
    await captureOrderScreenshotOrderProcessing(this.page, testInfo, `STOCKCHECK_${timestamp}`);

    await logStepAndCapture(this.page, 'Step 12', 'Return to Landing Page', 'stockManagement/stockTaker', 'Stock_Check_Success');
    
    await dashLocators.stockTaker.successNewStockCheckBtn(this.page).click();
    await expect(dashLocators.stockTaker.successModalContainer(this.page)).toBeHidden({ timeout: 10000 });
  }
}