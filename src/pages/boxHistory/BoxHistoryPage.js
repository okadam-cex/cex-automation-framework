import { expect } from '@playwright/test';
import { dashLocators } from '../../common/dashLocators.js';
import { handleGlobalLoader } from '../../common/dashHelpers.js';

export class BoxHistoryPage {
  constructor(page) {
    this.page = page;
  }

  async navigateToModule(step = 'Step 1') {
    console.log(`${step}: Navigate to the Box History module.`);
    await dashLocators.boxHistory.boxHistoryCard(this.page).click();
    
    await this.page.waitForURL('**/boxhistory/**', { timeout: 10000 });
    await handleGlobalLoader(this.page);
    
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/${step.replace(' ', '')}_Module_Loaded.png`, fullPage: true });
  }

  async searchByBoxId(boxId, step = 'Step 2') {
    console.log(`${step}: Search particular transaction with boxid [ ${boxId} ]`);
    await dashLocators.boxHistory.searchInput(this.page).fill(boxId);
    await dashLocators.boxHistory.searchBtn(this.page).click();
    await handleGlobalLoader(this.page);
    
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/${step.replace(' ', '')}_Search_Executed_For_${boxId}.png`, fullPage: true });
  }

  async verifySearchResultVisible(expectedItemText, step = 'Step 3') {
    console.log(`${step}: Verify visibility of product record: "${expectedItemText}"`);
    const targetElement = dashLocators.boxHistory.searchResultItem(this.page, expectedItemText);
    await expect(targetElement).toBeVisible({ timeout: 15000 });
    
    const safeFilename = expectedItemText.replace(/[^a-zA-Z0-9]/g, '_');
    
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/${step.replace(' ', '')}_Verified_Result_${safeFilename}.png`, fullPage: true });
  }

  async clearFilters(step = 'Step 4') {
    console.log(`${step}: Click on the clear button to reset filters.`);
    await dashLocators.boxHistory.clearBtn(this.page).click();
    await handleGlobalLoader(this.page);
    
    await expect(dashLocators.boxHistory.searchInput(this.page)).toBeEmpty();
    
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/${step.replace(' ', '')}_Filters_Cleared_Successfully.png`, fullPage: true });
  }

  async searchBoxWithAutocomplete(boxIdOrName, autocompleteText, step = 'Step 5') {
    console.log(`${step}: Enter the box name and search via autocomplete [ ${boxIdOrName} ]`);
    await dashLocators.boxHistory.searchInput(this.page).fill(boxIdOrName);
    await this.page.getByText(autocompleteText).click();
    await dashLocators.boxHistory.searchBtn(this.page).click();
    await handleGlobalLoader(this.page);

    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/${step.replace(' ', '')}_Search_Autocomplete_${boxIdOrName}.png`, fullPage: true });
  }

  async openBoxDetails(expectedItemText, step = 'Step 7') {
    console.log(`${step}: Click on the search result card to open box details [ ${expectedItemText} ]`);
    
    const textLocator = this.page.getByText(expectedItemText).last();
    await textLocator.waitFor({ state: 'visible', timeout: 15000 });
    
    const targetCardRow = this.page.locator('div.card-table-details-holder', { hasText: expectedItemText }).first();
    await targetCardRow.waitFor({ state: 'visible', timeout: 10000 });
    
    await targetCardRow.click({ force: true });
    
    await handleGlobalLoader(this.page);
    await this.page.waitForURL('**/boxhistory/history**', { timeout: 10000 }).catch(() => {});
    
    const safeFilename = expectedItemText.replace(/[^a-zA-Z0-9]/g, '_');
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/${step.replace(' ', '')}_Opened_Details_${safeFilename}.png`, fullPage: true });
  }

  async searchInnerHistoryRecords(step = 'Step 8') {
    console.log(`${step}: Click the inner history filter Search button.`);
    
    const innerSearchButton = dashLocators.boxHistory.innerHistorySearchBtn(this.page);
    await innerSearchButton.waitFor({ state: 'visible', timeout: 10000 });
    await innerSearchButton.click();
    
    await handleGlobalLoader(this.page);

    await expect(this.page.getByText('Showing search results from').first()).toBeVisible({ timeout: 15000 });
    
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/${step.replace(' ', '')}_Inner_History_Records_Populated.png`, fullPage: true });
  }

  async exportHistoryToCSV(saveDirectoryPath, step = 'Step 9') {
    console.log(`${step}: Click Export and select Export to CSV option.`);
    
    const closeBtn = dashLocators.boxHistory.popupCloseBtn(this.page);
    if (await closeBtn.isVisible()) {
      console.log('Dismissing active notification popup overlay');
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
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/${step.replace(' ', '')}_CSV_Export_Completed.png`, fullPage: true });

    return completeFilePath;
  }

  async openFirstTransactionRecord(step = 'Step 10') {
    console.log(`${step}: Wait a moment, then click the first transaction record to open the print page.`);
    
    await this.page.waitForTimeout(2000);
    
    const firstRecord = dashLocators.boxHistory.firstHistoryRecord(this.page);
    await firstRecord.waitFor({ state: 'visible', timeout: 10000 });
    
    await firstRecord.click();
    
    await handleGlobalLoader(this.page);
    
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/${step.replace(' ', '')}_Navigated_To_Print_Page.png`, fullPage: true });
  }

  async printTransactionReceipt(step = 'Step 11') {
    console.log(`${step}: Wait for the PDF receipt to render, take a screenshot, and click Print Receipt.`);
    
    // 1. Wait for the PDF canvas to successfully render on the screen (allowing up to 30s for heavy PDFs)
    const pdfDocument = dashLocators.boxHistory.pdfCanvas(this.page);
    await pdfDocument.waitFor({ state: 'visible', timeout: 30000 });
    
    // 2. Take a screenshot proving the PDF loaded correctly
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/${step.replace(' ', '')}_PDF_Receipt_Loaded.png`, fullPage: true });
    
    // 3. Click the Print Receipt button
    const printBtn = dashLocators.boxHistory.printReceiptBtn(this.page);
    await printBtn.waitFor({ state: 'visible', timeout: 5000 });
    await printBtn.click();
    
    console.log(`[SUCCESS] Print Receipt button clicked successfully.`);
  }

  async authorizePrintReceipt(managerTag, step = 'Step 12') {
    console.log(`${step}: Enter Manager Tag to authorize printing.`);
    
    // 1. Wait for the print-specific authorization modal input to appear
    const tagInput = dashLocators.boxHistory.printTagInput(this.page);
    await tagInput.waitFor({ state: 'visible', timeout: 10000 });
    await tagInput.fill(managerTag);
    
    // Capture the state before clicking Yes
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/${step.replace(' ', '')}_Manager_Tag_Entered.png`, fullPage: true });

    // 2. Click Yes to authorize using FORCE to bypass modal animation overlays
    const yesBtn = dashLocators.boxHistory.printTagYesBtn(this.page);
    await yesBtn.click({ force: true });
    
    // 3. Wait a moment for the print event to fire
    await this.page.waitForTimeout(2000);
    
    console.log(`[SUCCESS] Receipt print authorized.`);
  }

  async selectPrinterAndPrint(printerName, step = 'Step 13') {
    console.log(`${step}: Select printer [ ${printerName} ] and click Save & Print.`);
    
    // 1. Target and click the specific printer label
    const targetPrinter = dashLocators.boxHistory.printerOption(this.page, printerName);
    await targetPrinter.waitFor({ state: 'visible', timeout: 5000 });
    await targetPrinter.click();
    
    // Capture the state with the radio button selected
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/${step.replace(' ', '')}_Printer_Selected.png`, fullPage: true });

    // 2. Click the Save & Print action button
    const saveBtn = dashLocators.boxHistory.saveAndPrintBtn(this.page);
    await saveBtn.click();
    
    // 3. Stabilize the page after the print job is dispatched
    await handleGlobalLoader(this.page);
    
    console.log(`[SUCCESS] Print job dispatched to ${printerName}.`);
  }
}