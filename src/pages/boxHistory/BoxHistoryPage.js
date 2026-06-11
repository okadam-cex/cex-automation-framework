import { expect } from '@playwright/test';
import { dashLocators } from '../../common/dashLocators.js';
import { handleGlobalLoader } from '../../common/dashHelpers.js';

export class BoxHistoryPage {
  constructor(page) {
    this.page = page;
  }

  async navigateToModule() {
    console.log('Step 1: click on the box history module.');
    await dashLocators.boxHistory.boxHistoryCard(this.page).click();
    
    await this.page.waitForURL('**/boxhistory/**', { timeout: 10000 });
    await handleGlobalLoader(this.page);
    
    await this.page.screenshot({ path: 'tests/outputScreenshots/boxHistory/Step1_BoxHistory_Module_Loaded.png', fullPage: true });
  }

  async searchByBoxId(boxId, stepName = 'Step2') {
    console.log(`${stepName}: we can search particular transaction with boxid [ ${boxId} ]`);
    await dashLocators.boxHistory.searchInput(this.page).fill(boxId);
    await dashLocators.boxHistory.searchBtn(this.page).click();
    await handleGlobalLoader(this.page);
    
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/${stepName}_Search_Executed_For_${boxId}.png`, fullPage: true });
  }

  async clearFilters() {
    console.log('Step 3: after entering box id and click on the clear button');
    await dashLocators.boxHistory.clearBtn(this.page).click();
    await handleGlobalLoader(this.page);
    
    await expect(dashLocators.boxHistory.searchInput(this.page)).toBeEmpty();
    
    await this.page.screenshot({ path: 'tests/outputScreenshots/boxHistory/Step3_Filters_Cleared_Successfully.png', fullPage: true });
  }

  async verifySearchResultVisible(expectedItemText) {
    console.log(`Verifying visibility of product record: "${expectedItemText}"`);
    const targetElement = dashLocators.boxHistory.searchResultItem(this.page, expectedItemText);
    await expect(targetElement).toBeVisible({ timeout: 15000 });
    
    const safeFilename = expectedItemText.replace(/[^a-zA-Z0-9]/g, '_');
    
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/Verified_Result_${safeFilename}.png`, fullPage: true });
  }

  async openBoxDetails(expectedItemText) {
    console.log(`Step 11: Click on the search result card to open box details [ ${expectedItemText} ]`);
    
    const textLocator = this.page.getByText(expectedItemText).last();
    await textLocator.waitFor({ state: 'visible', timeout: 15000 });
    
    const targetCardRow = this.page.locator('div.card-table-details-holder', { hasText: expectedItemText }).first();
    await targetCardRow.waitFor({ state: 'visible', timeout: 10000 });
    
    await targetCardRow.click({ force: true });
    
    await handleGlobalLoader(this.page);
    await this.page.waitForURL('**/boxhistory/history**', { timeout: 10000 }).catch(() => {});
    
    const safeFilename = expectedItemText.replace(/[^a-zA-Z0-9]/g, '_');
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/Step11_Opened_Details_${safeFilename}.png`, fullPage: true });
  }

  async searchBoxWithAutocomplete(boxIdOrName, autocompleteText) {
    console.log(`Step 4: enter the box name and click on search button [ ${boxIdOrName} ]`);
    await dashLocators.boxHistory.searchInput(this.page).fill(boxIdOrName);
    await this.page.getByText(autocompleteText).click();
    await dashLocators.boxHistory.searchBtn(this.page).click();
    await handleGlobalLoader(this.page);

    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/Step4_Search_Autocomplete_${boxIdOrName}.png`, fullPage: true });
  }

  async searchInnerHistoryRecords() {
    console.log('Step 12: Click the inner history filter Search button');
    
    const innerSearchButton = dashLocators.boxHistory.innerHistorySearchBtn(this.page);
    await innerSearchButton.waitFor({ state: 'visible', timeout: 10000 });
    await innerSearchButton.click();
    
    await handleGlobalLoader(this.page);

    await expect(this.page.getByText('Showing search results from').first()).toBeVisible({ timeout: 15000 });
    
    await this.page.screenshot({ path: 'tests/outputScreenshots/boxHistory/Step12_Inner_History_Records_Populated.png', fullPage: true });
  }

  async exportHistoryToCSV(saveDirectoryPath) {
    console.log('Step 13: Click Export and select Export to CSV option');
    
    // Dismiss popup if present
    const closeBtn = dashLocators.boxHistory.popupCloseBtn(this.page);
    if (await closeBtn.isVisible()) {
      console.log('Dismissing active notification popup overlay');
      await closeBtn.click();
    }
    
    // Open dropdown
    const exportBtn = dashLocators.boxHistory.exportDropdownBtn(this.page);
    await exportBtn.waitFor({ state: 'visible', timeout: 10000 });
    await exportBtn.click();
    
    // Wait for exact link
    const csvOption = dashLocators.boxHistory.exportCsvOption(this.page);
    await csvOption.waitFor({ state: 'visible', timeout: 5000 });
    
    // Initialize 30s download listener BEFORE clicking
    const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });
    
    // Trigger download
    await csvOption.click();
    
    // Save file
    const download = await downloadPromise;
    const completeFilePath = `${saveDirectoryPath}/Box_History_Export.csv`;
    await download.saveAs(completeFilePath);
    
    console.log(`[SUCCESS] Download intercepted! File saved directly to: ${completeFilePath}`);
    
    await this.page.screenshot({ path: 'tests/outputScreenshots/boxHistory/Step13_CSV_Export_Completed.png', fullPage: true });
  }
}