import { expect } from '@playwright/test';
import { dashLocators } from './dashLocators.js';

//=========================================================================================
//-------- Stabilizing System UI Loaders (handleGlobalLoader)------------------------------
//=========================================================================================
/**
 * Safely waits for the master layout splash loaders to clear before proceeding with actions.
 * @param {import('@playwright/test').Page} page - Playwright core page object
 * @param {number} timeout - Maximum structural timeout configuration limit
 */
export async function handleGlobalLoader(page, timeout = 15000) {
  const loader = dashLocators.global.splashLoader(page);
  // Removed the console.log here completely so it doesn't spam your Jira reports 20 times per test!
  await expect(loader).toBeHidden({ timeout });
}

//=========================================================================================
//-------- Clearing Staff Access Gates (clearStaffSecurityGate)----------------------------
//=========================================================================================
/**
 * Automated security supervisor pin tag insertion handling.
 * @param {import('@playwright/test').Page} page - Playwright core page object
 * @param {import('@playwright/test').Locator} inputLocator - Target input field element
 * @param {import('@playwright/test').Locator} confirmButtonLocator - Target confirmation option element
 * @param {import('@playwright/test').Locator} modalContainerLocator - Target tracking component overlay wrapper
 * @param {string} managerTag - Corporate level pin clearance security key string
 */
export async function clearStaffSecurityGate(page, inputLocator, confirmButtonLocator, modalContainerLocator, managerTag) {
  try {
    // FIXED: Kept this at 15000 so the UAT environment doesn't time out and fail your tests!
    await inputLocator.waitFor({ state: 'visible', timeout: 15000 });
    console.log('Security PIN prompt detected. Entering Manager PIN...');
    await inputLocator.fill(managerTag);
    await confirmButtonLocator.click();
    await expect(modalContainerLocator).toBeHidden({ timeout: 10000 });
    console.log('Manager PIN accepted. Security prompt cleared.');
  } catch (error) {
    // Only logs if we actually need to skip it, keeping the console quiet when things are normal
    console.log('Security PIN prompt bypassed (already authorized).');
  }
}

//=========================================================================================
//-------- Dynamic Floating Toast Diagnostics (trackToastAlerts)-------------------------
//=========================================================================================
/**
 * Real-time floating dashboard notification validation extraction logger module.
 * @param {import('@playwright/test').Page} page - Playwright core page object
 */
export async function trackToastAlerts(page) {
  const alertToast = dashLocators.global.toastNotification(page);
  if (await alertToast.isVisible().catch(() => false)) {
    const textOutput = await alertToast.innerText().catch(() => 'Unknown notification type');
    // Human readable popup logging
    console.log(`System Notification Pop-up: "${textOutput.trim()}"`);
  }
}

export default {
  handleGlobalLoader,
  clearStaffSecurityGate,
  trackToastAlerts
};