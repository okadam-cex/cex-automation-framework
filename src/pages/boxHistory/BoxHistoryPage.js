import { expect } from '@playwright/test';
import { dashLocators } from '../../common/dashLocators.js';
import { handleGlobalLoader, logStepAndCapture } from '../../common/dashHelpers.js';
// ARWA INTEGRATION: Importing her screenshot function
import { captureOrderScreenshotOrderProcessing } from '../../common/helpers.js';

export class BoxHistoryPage {
  constructor(page) {
    this.page = page;
  }

  async navigateToModule(step = 'Step 1') {
    await dashLocators.boxHistory.boxHistoryCard(this.page).click();
    
    await this.page.waitForURL('**/boxhistory/**', { timeout: 10000 });
    await handleGlobalLoader(this.page);
    
    await logStepAndCapture(this.page, step, 'Navigated to the Box History module layout workspace.', 'stockManagement/boxHistory', 'Module_Loaded');
  }

  async searchByBoxId(boxId, step = 'Step 2') {
    await dashLocators.boxHistory.searchInput(this.page).fill(boxId);
    await dashLocators.boxHistory.searchBtn(this.page).click();
    await handleGlobalLoader(this.page);
    
    await logStepAndCapture(this.page, step, `Executed particular transaction lookup for Box ID: [ ${boxId} ].`, 'stockManagement/boxHistory', `Search_Executed_For_${boxId}`);
  }

  async verifySearchResultVisible(expectedItemText, step = 'Step 3') {
    // FIX: Set exact: false so UAT text variations don't break the match
    const targetElement = this.page.getByText(expectedItemText, { exact: false }).last();
    await expect(targetElement).toBeVisible({ timeout: 15000 });
    
    const safeFilename = expectedItemText.replace(/[^a-zA-Z0-9]/g, '_');
    await logStepAndCapture(this.page, step, `Verified visibility assertion of product record text context: "${expectedItemText}".`, 'stockManagement/boxHistory', `Verified_Result_${safeFilename}`);
  }

  async clearFilters(step = 'Step 4') {
    await dashLocators.boxHistory.clearBtn(this.page).click();
    await handleGlobalLoader(this.page);
    
    await expect(dashLocators.boxHistory.searchInput(this.page)).toBeEmpty();
    
    await logStepAndCapture(this.page, step, 'Clicked on the clear filter control element to fully reset lookup inputs.', 'stockManagement/boxHistory', 'Filters_Cleared_Successfully');
  }

  async searchBoxWithAutocomplete(boxIdOrName, autocompleteText, step = 'Step 5') {
    await dashLocators.boxHistory.searchInput(this.page).fill(boxIdOrName);
    await this.page.getByText(autocompleteText).click();
    await dashLocators.boxHistory.searchBtn(this.page).click();
    await handleGlobalLoader(this.page);

    await logStepAndCapture(this.page, step, `Populated box name filter and handled autocomplete transaction tracking parameters for [ ${boxIdOrName} ].`, 'stockManagement/boxHistory', `Search_Autocomplete_${boxIdOrName}`);
  }

  async openBoxDetails(expectedItemText, step = 'Step 7') {
    const textLocator = this.page.getByText(expectedItemText).last();
    await textLocator.waitFor({ state: 'visible', timeout: 15000 });
    
    const targetCardRow = this.page.locator('div.card-table-details-holder', { hasText: expectedItemText }).first();
    await targetCardRow.waitFor({ state: 'visible', timeout: 10000 });
    
    await targetCardRow.click({ force: true });
    await handleGlobalLoader(this.page);
    await this.page.waitForURL('**/boxhistory/history**', { timeout: 10000 }).catch(() => {});
    
    const safeFilename = expectedItemText.replace(/[^a-zA-Z0-9]/g, '_');
    await logStepAndCapture(this.page, step, `Clicked on search result entry card panel to access Box Details view context for [ ${expectedItemText} ].`, 'stockManagement/boxHistory', `Opened_Details_${safeFilename}`);
  }

  async searchInnerHistoryRecords(step = 'Step 8') {
    const innerSearchButton = dashLocators.boxHistory.innerHistorySearchBtn(this.page);
    await innerSearchButton.waitFor({ state: 'visible', timeout: 10000 });
    await innerSearchButton.click();
    await handleGlobalLoader(this.page);

    await expect(this.page.getByText('Showing search results from').first()).toBeVisible({ timeout: 15000 });
    
    await logStepAndCapture(this.page, step, 'Dispatched inner transactional history lookup parameter criteria trackers.', 'stockManagement/boxHistory', 'Inner_History_Records_Populated');
  }

  async exportHistoryToCSV(saveDirectoryPath, step = 'Step 9') {
    const closeBtn = dashLocators.boxHistory.popupCloseBtn(this.page);
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
    
    const exportBtn = dashLocators.boxHistory.exportDropdownBtn(this.page);
    await exportBtn.waitFor({ state: 'visible', timeout: 10000 });
    await exportBtn.click();
    
    const csvOption = dashLocators.boxHistory.exportCsvOption(this.page);
    await csvOption.waitFor({ state: 'visible', timeout: 5000 });
    
    const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });
    await csvOption.click();
    
    const download = await downloadPromise;
    const completeFilePath = `${saveDirectoryPath}/Box_History_Export.csv`;
    await download.saveAs(completeFilePath);
    
    console.log(`[SUCCESS] Download intercepted! File saved directly to: ${completeFilePath}`);
    await logStepAndCapture(this.page, step, 'Triggered system dataset table generation and exported content directly into localized CSV flat file schemas.', 'stockManagement/boxHistory', 'CSV_Export_Completed');

    return completeFilePath;
  }

  async openFirstTransactionRecord(step = 'Step 10') {
    await this.page.waitForTimeout(2000);
    
    const firstRecord = dashLocators.boxHistory.firstHistoryRecord(this.page);
    await firstRecord.waitFor({ state: 'visible', timeout: 10000 });
    await firstRecord.click();
    await handleGlobalLoader(this.page);
    
    await logStepAndCapture(this.page, step, 'Accessed the localized historical index transaction array to render print layout view components.', 'stockManagement/boxHistory', 'Navigated_To_Print_Page');
  }

  async printTransactionReceipt(step = 'Step 11') {
    const pdfDocument = dashLocators.boxHistory.pdfCanvas(this.page);
    await pdfDocument.waitFor({ state: 'visible', timeout: 30000 });
    
    await logStepAndCapture(this.page, step, 'Verified the PDF transaction receipt fully initialized and rendered layout details cleanly on screen.', 'stockManagement/boxHistory', 'PDF_Receipt_Loaded');
    
    const printBtn = dashLocators.boxHistory.printReceiptBtn(this.page);
    await printBtn.waitFor({ state: 'visible', timeout: 5000 });
    await printBtn.click();
    
    console.log(`[SUCCESS] Print Receipt button clicked successfully.`);
  }

  async authorizePrintReceipt(managerTag, step = 'Step 12') {
    const tagInput = dashLocators.boxHistory.printTagInput(this.page);
    await tagInput.waitFor({ state: 'visible', timeout: 10000 });
    await tagInput.fill(managerTag);
    
    await logStepAndCapture(this.page, step, 'Populated the print authorization dialog verification panel with secure Level 3 tag characters context.', 'stockManagement/boxHistory', 'Manager_Tag_Entered');

    const yesBtn = dashLocators.boxHistory.printTagYesBtn(this.page);
    await yesBtn.click({ force: true });
    
    await this.page.waitForTimeout(2000);
    console.log(`[SUCCESS] Receipt print authorized.`);
  }

  async selectPrinterAndPrint(testInfo, printerName, step = 'Step 13') {
    const targetPrinter = dashLocators.boxHistory.printerOption(this.page, printerName);
    await targetPrinter.waitFor({ state: 'visible', timeout: 5000 });
    await targetPrinter.click();
    
    // ARWA INTEGRATION: Captures the screenshot natively for her portal app
    const timestamp = new Date().getTime();
    await captureOrderScreenshotOrderProcessing(this.page, testInfo, `PRINTPRINT_${timestamp}`);

    await logStepAndCapture(this.page, step, `Selected target hardware printer profile element node: [ ${printerName} ]. Ready to submit.`, 'stockManagement/boxHistory', 'Printer_Selected');

    const saveBtn = dashLocators.boxHistory.saveAndPrintBtn(this.page);
    await saveBtn.click();
    
    await handleGlobalLoader(this.page);
    console.log(`[SUCCESS] Print job dispatched successfully to ${printerName}.`);
  }
}