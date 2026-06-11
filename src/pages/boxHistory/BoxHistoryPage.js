import { expect } from '@playwright/test';

export class BoxHistoryPage {
  constructor(page) {
    this.page = page;
    // Locators based on original verified working steps
    this.boxHistoryCard = page.getByRole('heading', { name: 'Box History' });
    this.searchInput = page.locator('#algoliaSearchInput');
    this.searchBtn = page.locator('button.box-search-btn');
  }

  async navigateToModule() {
    console.log('Step 1: Navigating to Box History module and verifying URL target redirection...');
    await this.boxHistoryCard.click();
    await this.page.waitForURL('**/boxhistory/search', { timeout: 10000 });
  }

  async searchBox(boxIdOrName, autocompleteText) {
    console.log(`Step 2: Typing search query: [ ${boxIdOrName} ]`);
    await this.searchInput.fill(boxIdOrName);
    
    // Select the target item from the auto-complete dropdown list overlay
    const dropdownOption = this.page.getByText(autocompleteText);
    await dropdownOption.click();
    
    // Trigger search
    await this.searchBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  async verifySearchResultVisible(expectedItemText) {
    console.log(`Step 3: Confirming search record visibility for text: "${expectedItemText}"`);
    // Selects the text block inside the data results row rather than the input box
    const resultItem = this.page.getByText(expectedItemText).last();
    await expect(resultItem).toBeVisible({ timeout: 15000 });
  }
}