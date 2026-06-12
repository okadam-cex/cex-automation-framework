/**
 * Global DASH Module Locator Registry
 * Centralized element repository utilizing strict role and robust CSS query models.
 */
export const dashLocators = {
  
  //========================================================
  // LOGIN LOCATORS
  //========================================================
  login: {
    oauthCexToolsLoginBtn: (page) => page.getByRole('button', { name: 'Login with CeXTools' }),
    oauthUsernameInput: (page) => page.locator('#UserName'),
    oauthPasswordInput: (page) => page.locator('#Password'),
    oauthSubmitBtn: (page) => page.getByRole('button', { name: 'Login', exact: true }),
    errorGoBackHomeLink: (page) => page.getByRole('link', { name: 'Home', exact: true })
  },

  //========================================================
  // GLOBAL & DASHBOARD LOCATORS
  //========================================================
  global: {
    splashLoader: (page) => page.locator('#Splashloader, .dash-main-loader'),
    dashboardContainer: (page) => page.locator('#wrapper, #app, .dash-main-container'),
    toastNotification: (page) => page.locator('.toast, .toast-message, .alert, .notification-msg, [role="alert"]').first()
  },

  //========================================================
  // BRANCH SELECTION & SECURITY LOCATORS
  //========================================================
  branchSelection: {
    branchOption: (page, branchName) => page.getByText(branchName),
    branchSaveBtn: (page) => page.locator('#branches-save'),
    staffTagInput: (page) => page.locator('#BranchSelection_StaffTagInput, input[type="password"]'),
    tagModalYesBtn: (page) => page.locator('#BranchSelection_StaffTagModal input[value="Yes"], button:has-text("Yes")'),
    tagModalContainer: (page) => page.locator('#BranchSelection_StaffTagModal')
  },

  //========================================================
  // BOX HISTORY LOCATORS
  //========================================================
  boxHistory: {
    boxHistoryCard: (page) => page.getByRole('heading', { name: 'Box History' }),
    searchInput: (page) => page.locator('#algoliaSearchInput'),
    searchBtn: (page) => page.locator('button.box-search-btn'),
    clearBtn: (page) => page.getByRole('button', { name: 'Clear', exact: true }),
    searchResultItem: (page, itemText) => page.getByText(itemText).last(),
    searchResultCard: (page, itemText) => page.locator('div.card-table-details-holder', { hasText: itemText }).first(),
    innerHistorySearchBtn: (page) => page.locator('#box-history-one button[type="submit"], button.btn-primary:has-text("Search")').first(),
    
    // EXPORT CSV LOCATORS
    popupCloseBtn: (page) => page.locator('#btn-releasenote-close, .toast-close-button, .close').first(),
    exportDropdownBtn: (page) => page.locator('#exportBtn, a:has-text("Export")').first(),
    exportCsvOption: (page) => page.getByRole('link', { name: 'Export to CSV', exact: true }),
  
    // BOX RECEIPT PRINT LOCATORS
    firstHistoryRecord: (page) => page.getByRole('listitem').filter({ hasText: 'Transaction:' }).first(),
    pdfCanvas: (page) => page.locator('canvas.pdf-page').first(),
    printReceiptBtn: (page) => page.getByRole('button', { name: 'Print Receipt' }),
    printerOption: (page, printerName) => page.locator(`label:has-text("${printerName}")`),
    saveAndPrintBtn: (page) => page.locator('input[value="Save & Print"]'),

    // PRINT AUTHORIZATION MODAL LOCATORS
    printTagInput: (page) => page.locator('#ReprintReceiptStaffTagModal_StaffTagInput'),
    printTagYesBtn: (page) => page.locator('#ReprintReceiptStaffTagModal_StaffTagModal input[value="Yes"].btn-primary')
  },

  //========================================================
  // STOCK TAKER TOOL LOCATORS
  //========================================================
  stockTaker: {
    managementGridCard: (page) => page.locator('div.module-box:has-text("Stock Management"), div:has(> h5:has-text("Stock Management"))').first(),
    stockTakerCard: (page) => page.locator('a:has-text("Stock Taker Tool"), .sub-module-names:has-text("Stock Taker Tool")').first(),
    initialTagInput: (page) => page.locator('#StaffTagModal_StaffTagInput').first(),
    initialTagYesBtn: (page) => page.locator('input[type="button"][value="Yes"], #StaffTagModal_StaffTagModal button:has-text("Yes"), .modal-footer input[value="Yes"]').first(),
    initialModalContainer: (page) => page.locator('#StaffTagModal_StaffTagModal, div.modal-content').first(),
    releaseNoteCloseBtn: (page) => page.locator('#btn-releasenote-close, .releasenote-close, #releasenote .mdi-close').first(),
    newStockCheckBtn: (page) => page.locator('button.new-stk-check-btn, button:has-text("New Stock Check")').first(),
    categorySearchInput: (page) => page.locator('input#search[placeholder*="Search by category"]').first(),
    categoryCheckbox: (page, categoryId) => page.locator(`input#cat_${categoryId}, label[for="cat_${categoryId}"]`).first(),
    proceedToScanBtn: (page) => page.locator('button:has-text("Proceed To Scan"), .modal-footer button').first(),
    barcodeScannerInput: (page) => page.locator('input[placeholder="Use the scanner to add items"]').first(),
    gridProductItem: (page, text) => page.locator('div.stockchecks-container, table, tr, td').getByText(text).last(),
    nextBtn: (page) => page.locator('button:has-text("Next"), .sticky-footer-btns button:has-text("Next")').first(),
    varianceTableRows: (page) => page.locator('table tbody tr'),
    allStockMatchesView: (page) => page.getByText('Hooray!', { exact: false }).or(page.getByText('All stock matches', { exact: false })).first(),
    varianceNextBtn: (page) => page.locator('button[type="submit"].click-next-button, .variance-preview-container button:has-text("Next"), button:has-text("Next")').last(),
    processingDataModal: (page) => page.locator('div:has-text("Processing Your Data..."), .modal-body:has-text("Processing")').first(),
    varianceNowBtn: (page) => page.locator('button:has-text("Variance Now"), button.variance-now-button').last(),
    finalTagInput: (page) => page.locator('#StaffTagModal_StaffTagInput').last(),
    finalTagYesBtn: (page) => page.locator('#StaffTagModal_StaffTagModal button:has-text("Yes"), button:has-text("Yes"), #StaffTagModal_StaffTagModal input[value="Yes"]').last(),
    successModalContainer: (page) => page.locator('div:has-text("Stock Check Completed!"), .modal-content:has-text("Completed")').first(),
    successNewStockCheckBtn: (page) => page.locator('.modal-content button:has-text("New Stock Check"), button:has-text("New Stock Check")').last()
  },

//========================================================
  // TRANSFER OUT LOCATORS
  //========================================================
  transferOut: {
    // Sidebar Navigation Accordion Triggers
    stockManagementSidebarMenu: (page) => page.locator('a[href="#StockManagement"], [data-target="#StockManagement"]').first(),
    transferOutSidebarLink: (page) => page.locator('a[href*="/stockmanagement/stockout"]'),
    
    // Core Filter Selection Form Controls
    destinationDropdown: (page) => page.locator('select.selectfield').nth(0),
    reasonDropdown: (page) => page.locator('select.selectfield').nth(1),
    methodDropdown: (page) => page.locator('select.selectfield').nth(2),
    crateInput: (page) => page.getByPlaceholder('Number'),
    notesInput: (page) => page.getByPlaceholder('Please provide a reason for transfer'),
    boxIdInput: (page) => page.getByPlaceholder('Enter / Scan Box ID'),
    addItemBtn: (page) => page.getByRole('button', { name: 'Add Item' }),
    clearGridBtn: (page) => page.getByRole('button', { name: 'Clear Grid' }),
    individualDeleteIcon: (page) => page.locator('table tbody tr i.mdi-delete, .card-table-details-holder i.mdi-delete').first(),

    // Serial Entry Dynamic Modal Panel
    serialModalContainer: (page) => page.locator('div.modal-dialog .modal-content').filter({ hasText: 'Serial Number' }),
    serialNumberInput: (page) => page.locator('#SerialNumberInput'),
    serialModalSaveBtn: (page) => page.locator('input[value="Save"], button:has-text("Save")').filter({ hasText: 'Save' }),

    // Printing Layout Configuration Elements
    printPriceLabelsCheckbox: (page) => page.locator('input#PrintPriceLabels, label:has-text("Print Price Labels") input, input[type="checkbox"]').first(),
    price2ndLabelCheckbox: (page) => page.locator('input#Price2ndLabel, label:has-text("Price 2nd Label") input, input[type="checkbox"]').nth(1),
    labelPrinterDropdown: (page) => page.locator('select.selectfield').nth(3), 
    receiptPrinterDropdown: (page) => page.locator('select.selectfield').nth(4), 
    transferStockOutBtn: (page) => page.locator('#ProcessStockTransfer, button:has-text("Transfer Stock Out")'),

  // Security Manager Authorization Verification Popups (Fixed strictness)
    managerAuthModal: (page) => page.locator('div#StockOutStaffTagModal_StaffTagModal'),
    managerTagInput: (page) => page.locator('#StockOutStaffTagModal_StaffTagInput'),
    managerTagYesBtn: (page) => page.locator('#StockOutStaffTagModal_StaffTagModal button:has-text("Yes"), #StockOutStaffTagModal_StaffTagModal input[value="Yes"]'),

    // Operational Completion Toast Summary Panels
    successModalContainer: (page) => page.locator('#StockOutSuccessModal, div.modal-content:has-text("Transfer Out Successful")'),
    successOrderText: (page) => page.locator('#StockOutSuccessModal .modal-body, div.modal-content:has-text("Successful. Order no:")'),
    successOkBtn: (page) => page.locator('#StockOutSuccessModal_OkButton')
  }
};