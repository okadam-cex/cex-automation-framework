import { expect } from '@playwright/test';

/**
 * Captures a stable memory buffer snapshot of the processed order success layout
 * and appends it natively to the Playwright execution attachments payload.
 * * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {import('@playwright/test').TestInfo} testInfo - Active test runner information metadata
 * @param {string} orderNumber - Extracted transaction order tracking string
 */
export var captureOrderScreenshotOrderProcessing = async function(page, testInfo, orderNumber) {
    console.log(`Verifying Order number on UI with ScreenShot: "${orderNumber}"`);

    // Allow transitional dialog animation frames to complete smoothly
    await page.waitForTimeout(5000);
    var screenshotBuffer = await page.screenshot();

    // Push directly into the native test reporter attachment data pipeline
    testInfo.attachments.push({
        name: `Transaction_Receipt_Frame_${orderNumber}`,
        contentType: 'image/png',
        body: screenshotBuffer
    });

    await page.waitForTimeout(5000);
    console.log(`Verification image uploaded for Order: "${orderNumber}".`);
};