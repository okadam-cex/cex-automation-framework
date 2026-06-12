import { expect, test } from '@playwright/test';
import { dashLocators } from './dashLocators.js';

//=========================================================================================
//-------- Handle Global Loading Spinners -------------------------------------------------
//=========================================================================================
/**
 * Waits for the main loading spinner to disappear so we don't click things before the page is ready.
 * @param {import('@playwright/test').Page} page - The Playwright page object.
 * @param {number} timeout - How long to wait before giving up (defaults to 15 seconds).
 */
export async function handleGlobalLoader(page, timeout = 15000) {
  const loader = dashLocators.global.splashLoader(page);
  
  // We removed the console log here so it doesn't clutter up your test output!
  await expect(loader).toBeHidden({ timeout });
}

//=========================================================================================
//-------- Manager PIN Authorization ------------------------------------------------------
//=========================================================================================
/**
 * Deals with the Manager PIN popup. If it shows up, it enters the PIN. If it's not there, it just moves on.
 * @param {import('@playwright/test').Page} page - The Playwright page object.
 * @param {import('@playwright/test').Locator} inputLocator - The PIN input box.
 * @param {import('@playwright/test').Locator} confirmButtonLocator - The 'Yes' or 'Confirm' button.
 * @param {import('@playwright/test').Locator} modalContainerLocator - The whole popup container.
 * @param {string} managerTag - The actual manager PIN to type in.
 */
export async function clearStaffSecurityGate(page, inputLocator, confirmButtonLocator, modalContainerLocator, managerTag) {
  try {
    // Give the UAT environment up to 15 seconds to show the prompt before giving up
    await inputLocator.waitFor({ state: 'visible', timeout: 15000 });
    
    console.log('Security PIN prompt detected. Entering Manager PIN...');
    await inputLocator.fill(managerTag);
    
    // Force click to bypass any fading modal animations
    await confirmButtonLocator.click({ force: true }); 
    await expect(modalContainerLocator).toBeHidden({ timeout: 10000 });
    
    console.log('Manager PIN accepted. Security prompt cleared.');
  } catch (error) {
    // If the popup didn't show up, we just log it and move on without failing the test
    console.log('Security PIN prompt bypassed (already authorized).');
  }
}

//=========================================================================================
//-------- Read Toast Notifications -------------------------------------------------------
//=========================================================================================
/**
 * Checks if a toast notification popped up on the screen and logs what it says.
 * @param {import('@playwright/test').Page} page - The Playwright page object.
 */
export async function trackToastAlerts(page) {
  const alertToast = dashLocators.global.toastNotification(page);
  
  // Only try to read it if it's actually visible
  if (await alertToast.isVisible().catch(() => false)) {
    const textOutput = await alertToast.innerText().catch(() => 'Unknown notification type');
    console.log(`System Notification Pop-up: "${textOutput.trim()}"`);
  }
}

//=========================================================================================
//-------- Standardized Screenshot & Step Logger ------------------------------------------
//=========================================================================================
/**
 * Logs what step we are on and takes a neatly named screenshot for your reports.
 * @param {import('@playwright/test').Page} page - The Playwright page object.
 * @param {string} stepStr - The step name (like 'Step 1').
 * @param {string} actionDescription - What are we doing in this step?
 * @param {string} moduleFolder - Which folder to save the screenshot in.
 * @param {string} screenshotName - A short name for the image file.
 */
export async function logStepAndCapture(page, stepStr, actionDescription, moduleFolder, screenshotName) {
  console.log(`${stepStr}: ${actionDescription}`);
  
  // Strip out any weird characters so the file saves safely on Windows/Mac
  const safeName = screenshotName.replace(/[^a-zA-Z0-9]/g, '_');
  const safeStep = stepStr.replace(/[^a-zA-Z0-9]/g, '');
  
  await page.screenshot({ 
    path: `tests/outputScreenshots/${moduleFolder}/${safeStep}_${safeName}.png`, 
    fullPage: true 
  });
}

//=========================================================================================
//-------- Smart File Download & Allure Attacher ------------------------------------------
//=========================================================================================
/**
 * Clicks a download button, waits for the file to save, and attaches it right to the Allure report.
 * @param {import('@playwright/test').Page} page - The Playwright page object.
 * @param {import('@playwright/test').Locator} triggerLocator - The button or link to click to start the download.
 * @param {string} targetFileName - What to name the downloaded file.
 * @param {string} contentType - The type of file (default is 'text/csv').
 */
export async function downloadAndAttach(page, triggerLocator, targetFileName, contentType = 'text/csv') {
  // Start listening for the download BEFORE we click the button
  const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
  
  await triggerLocator.click();
  
  const download = await downloadPromise;
  const targetPath = `${test.info().outputDir}/${targetFileName}`;
  await download.saveAs(targetPath);
  
  // Attach the file straight into Allure
  await test.info().attach(`Exported_${targetFileName}`, {
    path: targetPath,
    contentType: contentType
  });
  
  console.log(`[SUCCESS] File downloaded and attached to Allure: ${targetPath}`);
  return targetPath;
}

//=========================================================================================
//-------- Dismiss Blocking Popups --------------------------------------------------------
//=========================================================================================
/**
 * Closes annoying popups (like release notes) that get in the way of clicking other things.
 * @param {import('@playwright/test').Locator} closeBtnLocator - The 'X' or 'Close' button on the popup.
 */
export async function dismissBlockingPopups(closeBtnLocator) {
  if (await closeBtnLocator.isVisible().catch(() => false)) {
    console.log('Dismissing blocking popup overlay...');
    await closeBtnLocator.click({ force: true });
    
    // Give it a few seconds to fade away
    await closeBtnLocator.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {}); 
  }
}

export default {
  handleGlobalLoader,
  clearStaffSecurityGate,
  trackToastAlerts,
  logStepAndCapture,
  downloadAndAttach,
  dismissBlockingPopups
};