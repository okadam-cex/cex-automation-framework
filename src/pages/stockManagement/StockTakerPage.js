import { expect } from '@playwright/test';
import { dashLocators } from '../../common/dashLocators.js';
import { handleGlobalLoader, clearStaffSecurityGate, trackToastAlerts } from '../../common/dashHelpers.js';

export class StockTakerPage {
  constructor(page) {
    this.page = page;
  }

  async navigateToModule(managerTag) {
    console.log('Step 1: Navigate to "Stock Taker Tool" module');
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
    
    // EVIDENCE CAPTURE: Landing Page loaded
    await this.page.screenshot({ path: 'tests/outputScreenshots/stockManagement/stockTaker/Step1_2_StockTaker_Landing_Page.png', fullPage: true });
  }

  async startNewStockCheck(categoryName, categoryId = '997') {
    console.log('Step 3: Click "Start New Stock Check"');
    await dashLocators.stockTaker.newStockCheckBtn(this.page).click({ force: true });

    console.log('Step 4: Select Box categories');
    await dashLocators.stockTaker.categorySearchInput(this.page).fill(categoryName);
    await this.page.waitForTimeout(1500); 

    await dashLocators.stockTaker.categoryCheckbox(this.page, categoryId).dispatchEvent('click');
    
    console.log('Step 5: Click "Proceed to Scan"');
    await dashLocators.stockTaker.proceedToScanBtn(this.page).click({ force: true });
    await this.page.waitForLoadState('networkidle').catch(() => {});
    
    // EVIDENCE CAPTURE: Category selected and proceeding to scan grid
    await this.page.screenshot({ path: 'tests/outputScreenshots/stockManagement/stockTaker/Step3_5_Category_Selected.png', fullPage: true });
  }

  async scanBoxIdViaKeyboardReturn(boxId) {
    console.log(`Step 6: Scan multiple boxIDs (including duplicates) -> Box ID: [ ${boxId} ]`);
    const targetField = dashLocators.stockTaker.barcodeScannerInput(this.page);
    await targetField.waitFor({ state: 'visible', timeout: 15000 });
    await targetField.fill(boxId);
    await targetField.press('Enter');
    await this.page.waitForTimeout(1500); 
    await trackToastAlerts(this.page);
    
    // EVIDENCE CAPTURE: Strip invalid characters from boxId for safe file naming
    const safeBoxId = boxId.replace(/[^a-zA-Z0-9]/g, '_');
    await this.page.screenshot({ path: `tests/outputScreenshots/stockManagement/stockTaker/Step6_Scanned_${safeBoxId}.png`, fullPage: true });
  }

  async verifyProductVisibleInGrid(productNameText) {
    await expect(dashLocators.stockTaker.gridProductItem(this.page, productNameText)).toBeVisible({ timeout: 10000 });
  }

  async clickNextToProceed() {
    console.log('Step 7: Click "Next"');
    await dashLocators.stockTaker.nextBtn(this.page).click();
    await handleGlobalLoader(this.page);
    
    // EVIDENCE CAPTURE: Variance preview screen
    await this.page.screenshot({ path: 'tests/outputScreenshots/stockManagement/stockTaker/Step7_Variance_Preview_Screen.png', fullPage: true });
  }

  async incrementActualQuantityForBox(boxId, fallbackValue = "1") {
    console.log('Step 8: Validate variance data');
    if (await dashLocators.stockTaker.allStockMatchesView(this.page).isVisible({ timeout: 3000 }).catch(() => false)) {
      return; 
    }

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
    
    // EVIDENCE CAPTURE: Adjusted quantities
    await this.page.screenshot({ path: 'tests/outputScreenshots/stockManagement/stockTaker/Step8_Variance_Data_Updated.png', fullPage: true });
  }

  async completeVariancePreview() {
    console.log('Step 9: Click "Next"');
    await dashLocators.stockTaker.varianceNextBtn(this.page).scrollIntoViewIfNeeded();
    await dashLocators.stockTaker.varianceNextBtn(this.page).click();
    
    try {
      await dashLocators.stockTaker.processingDataModal(this.page).waitFor({ state: 'hidden', timeout: 20000 });
    } catch (e) {}
    await handleGlobalLoader(this.page);
    
    console.log('Step 10: Validate summary & variance grid');
    // EVIDENCE CAPTURE: Final Variance Summary
    await this.page.screenshot({ path: 'tests/outputScreenshots/stockManagement/stockTaker/Step9_10_Final_Variance_Summary.png', fullPage: true });
  }

  async clickVarianceNow() {
    console.log('Step 11: Click "Variance Now"');
    await dashLocators.stockTaker.varianceNowBtn(this.page).scrollIntoViewIfNeeded();
    await dashLocators.stockTaker.varianceNowBtn(this.page).click();
  }

  async handleVarianceConfirmationModal(managerTag) {
    await clearStaffSecurityGate(
      this.page,
      dashLocators.stockTaker.finalTagInput(this.page),
      dashLocators.stockTaker.finalTagYesBtn(this.page),
      dashLocators.stockTaker.successModalContainer(this.page),
      managerTag
    );
  }

  async verifyAndResetStockTakerSuccessState() {
    console.log('Step 12: Return to Landing Page');
    await expect(dashLocators.stockTaker.successModalContainer(this.page)).toBeVisible({ timeout: 15000 });
    
    // EVIDENCE CAPTURE: Success modal displayed before closing
    await this.page.screenshot({ path: 'tests/outputScreenshots/stockManagement/stockTaker/Step11_12_Stock_Check_Success.png', fullPage: true });
    
    await dashLocators.stockTaker.successNewStockCheckBtn(this.page).click();
    await expect(dashLocators.stockTaker.successModalContainer(this.page)).toBeHidden({ timeout: 10000 });
  }
}