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
    
    // SAVES TO MODULE SUBFOLDER
    await this.page.screenshot({ path: 'tests/outputScreenshots/boxHistory/Step1_BoxHistory_Module_Loaded.png', fullPage: true });
  }

  async searchByBoxId(boxId, stepName = 'Step2') {
    console.log(`${stepName}: we can search particular transaction with boxid [ ${boxId} ]`);
    await dashLocators.boxHistory.searchInput(this.page).fill(boxId);
    await dashLocators.boxHistory.searchBtn(this.page).click();
    await handleGlobalLoader(this.page);
    
    // SAVES TO MODULE SUBFOLDER
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/${stepName}_Search_Executed_For_${boxId}.png`, fullPage: true });
  }

  async clearFilters() {
    console.log('Step 3: after entering box id and click on the clear button');
    await dashLocators.boxHistory.clearBtn(this.page).click();
    await handleGlobalLoader(this.page);
    
    await expect(dashLocators.boxHistory.searchInput(this.page)).toBeEmpty();
    
    // SAVES TO MODULE SUBFOLDER
    await this.page.screenshot({ path: 'tests/outputScreenshots/boxHistory/Step3_Filters_Cleared_Successfully.png', fullPage: true });
  }

  async verifySearchResultVisible(expectedItemText) {
    console.log(`Verifying visibility of product record: "${expectedItemText}"`);
    const targetElement = dashLocators.boxHistory.searchResultItem(this.page, expectedItemText);
    await expect(targetElement).toBeVisible({ timeout: 15000 });
    
    const safeFilename = expectedItemText.replace(/[^a-zA-Z0-9]/g, '_');
    
    // SAVES TO MODULE SUBFOLDER
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/Verified_Result_${safeFilename}.png`, fullPage: true });
  }

  async searchBoxWithAutocomplete(boxIdOrName, autocompleteText) {
    console.log(`Step 4: enter the box name and click on search button [ ${boxIdOrName} ]`);
    await dashLocators.boxHistory.searchInput(this.page).fill(boxIdOrName);
    await this.page.getByText(autocompleteText).click();
    await dashLocators.boxHistory.searchBtn(this.page).click();
    await handleGlobalLoader(this.page);
    
    // SAVES TO MODULE SUBFOLDER
    await this.page.screenshot({ path: `tests/outputScreenshots/boxHistory/Step4_Search_Autocomplete_${boxIdOrName}.png`, fullPage: true });
  }
}