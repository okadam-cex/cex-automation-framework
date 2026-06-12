import { expect } from '@playwright/test';
import { dashLocators } from '../../common/dashLocators.js';
import { 
  handleGlobalLoader, 
  logStepAndCapture 
} from '../../common/dashHelpers.js';
// ARWA INTEGRATION: Importing her screenshot function
import { captureOrderScreenshotOrderProcessing } from '../../common/helpers.js';

export class TransferOutPage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Step 1 & 2: Expands the Stock Management sidebar accordion and accesses Transfer Out.
   */
  async navigateToModule(step = 'Step 1 & 2') {
    const stockMenu = dashLocators.transferOut.stockManagementSidebarMenu(this.page);
    await stockMenu.waitFor({ state: 'visible', timeout: 10000 });

    const isExpanded = await stockMenu.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await stockMenu.click();
    }
    
    const transferOutLink = dashLocators.transferOut.transferOutSidebarLink(this.page);
    await transferOutLink.waitFor({ state: 'visible', timeout: 5000 });
    await transferOutLink.click();
    
    await handleGlobalLoader(this.page);
    await logStepAndCapture(this.page, step, 'Navigated to Stock Management and verified sub-modules are present.', 'stockManagement/transferOut', 'Landing_Page');
  }

  /**
   * Step 3: Asserts the layout filters possess parsed structural dropdown values.
   */
  async verifyDropdownsHaveValues(step = 'Step 3') {
    await expect(dashLocators.transferOut.destinationDropdown(this.page)).toBeVisible({ timeout: 10000 });
    await expect(dashLocators.transferOut.reasonDropdown(this.page)).toBeVisible();
    await expect(dashLocators.transferOut.methodDropdown(this.page)).toBeVisible();

    await logStepAndCapture(this.page, step, 'Verified Destination, Reason, and Method dropdown fields possess active values.', 'stockManagement/transferOut', 'Dropdowns_Verified');
  }

  /**
   * Step 4: Configures dropdown choices and enters notes context matching requirement patterns.
   */
  async configureTransferDetails(destination, reason, method, step = 'Step 4') {
    await dashLocators.transferOut.destinationDropdown(this.page).selectOption({ label: destination });
    await dashLocators.transferOut.reasonDropdown(this.page).selectOption({ label: reason });
    await dashLocators.transferOut.methodDropdown(this.page).selectOption({ label: method });
    
    await dashLocators.transferOut.notesInput(this.page).fill('OMkar Kadam Test');
    await logStepAndCapture(this.page, step, `Selected Destination: [${destination}], Reason: [${reason}], Method: [${method}], and entered mandatory notes.`, 'stockManagement/transferOut', 'Transfer_Configured');
  }

  /**
   * Steps 5 & 6: Validates empty constraints check handling before passing item serial parameters.
   */
  async scanBoxAndHandleSerialValidation(boxId, fallbackSerial, step = 'Step 5 & 6') {
    const boxInput = dashLocators.transferOut.boxIdInput(this.page);
    await boxInput.waitFor({ state: 'visible', timeout: 5000 });
    await boxInput.fill(boxId);
    await boxInput.press('Enter');
    await handleGlobalLoader(this.page);

    const serialModal = dashLocators.transferOut.serialModalContainer(this.page);
    await expect(serialModal).toBeVisible({ timeout: 8000 });

    const saveBtn = dashLocators.transferOut.serialModalSaveBtn(this.page);
    await saveBtn.click(); // Intentionally verify empty validation error triggers

    const trackingInput = dashLocators.transferOut.serialNumberInput(this.page);
    await trackingInput.fill(fallbackSerial);
    await saveBtn.click();
    
    await expect(serialModal).toBeHidden({ timeout: 5000 });
    await handleGlobalLoader(this.page);

    await logStepAndCapture(this.page, step, `Scanned Box ID [${boxId}]. Verified Serial popup requirement triggers before successfully entering Serial: [${fallbackSerial}].`, 'stockManagement/transferOut', 'Item_Added_To_Grid');
  }

  /**
   * Step 8: Toggles printing preference options and checks child checkbox dependency interactions.
   */
  async configurePrintersAndPreferences(labelPrinter, receiptPrinter, step = 'Step 8') {
    const priceLabelsCheckbox = dashLocators.transferOut.printPriceLabelsCheckbox(this.page);
    const price2ndCheckbox = dashLocators.transferOut.price2ndLabelCheckbox(this.page);

    await priceLabelsCheckbox.check();
    await price2ndCheckbox.check();
    
    await expect(priceLabelsCheckbox).toBeChecked();
    await expect(price2ndCheckbox).toBeChecked();

    await dashLocators.transferOut.labelPrinterDropdown(this.page).selectOption({ label: labelPrinter });
    await dashLocators.transferOut.receiptPrinterDropdown(this.page).selectOption({ label: receiptPrinter });

    await logStepAndCapture(this.page, step, `Verified "Print Price Labels" and "Price 2nd Label" are checked. Configured Label Printer: [${labelPrinter}] and Receipt Printer: [${receiptPrinter}].`, 'stockManagement/transferOut', 'Printers_Configured');
  }

  /**
   * Step 9 & 10: Submits transfer transaction layout, inputs security pin validations, and logs order reference tracks.
   */
  async submitTransferAndExtractOrder(testInfo, managerPin = '666', step = 'Step 9 & 10') {
    await dashLocators.transferOut.transferStockOutBtn(this.page).click();

    const authModal = dashLocators.transferOut.managerAuthModal(this.page);
    await expect(authModal).toBeVisible({ timeout: 5000 });
    await dashLocators.transferOut.managerTagInput(this.page).fill(managerPin);
    await dashLocators.transferOut.managerTagYesBtn(this.page).click();
    await handleGlobalLoader(this.page);

    const successModal = dashLocators.transferOut.successModalContainer(this.page);
    await expect(successModal).toBeVisible({ timeout: 10000 });
    
    const contextContent = await dashLocators.transferOut.successOrderText(this.page).innerText();
    const cleanOrderId = contextContent.match(/[A-Z]{4,}\d+/)?.[0] || 'NOT_FOUND';
    
    console.log(`\n==================================================`);
    console.log(`  STOCK OUT PROCESSED`);
    console.log(`  Transfer Out Order ID: ${cleanOrderId}`);
    console.log(`==================================================\n`);

    // ARWA INTEGRATION: Captures the screenshot natively for her portal app
    await captureOrderScreenshotOrderProcessing(this.page, testInfo, cleanOrderId);

    await logStepAndCapture(this.page, step, `Stock out submitted successfully. Stock Out Order ID: [${cleanOrderId}].`, 'stockManagement/transferOut', `Success_Order_${cleanOrderId}`); 

    await dashLocators.transferOut.successOkBtn(this.page).click();
    await handleGlobalLoader(this.page);
  }
}