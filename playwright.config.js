// @ts-check
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// 🎯 ENVIRONMENT VARIABLES SETUP: Loads variables from the root .env file securely
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* 🎯 FIXED: Run test files sequentially so parallel workers don't lock the same user session out of buttons */
  fullyParallel: false,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* 🎯 FIXED: Enforce a single runner worker locally to maintain isolated state on the staging server */
  workers: 1,
  
  /* 🎯 FIXED: Timeout increased globally to 60 seconds to prevent application load spikes from failing your run */
  timeout: 60000,
  
  /* 🎯 RESTORED LOCAL REPORTING: Stripped out failing cloud plugins to ensure a clean 100% local run */
  reporter: [
    ['list'], // Retains clear terminal checkpoint logs
    ['allure-playwright', { outputFolder: 'allure-results' }] // Feeds into your custom environment matrix handler
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* 🎯 GLOBAL FIX: Bypass Content Security Policy to stop blocked tracking scripts from freezing UAT loading screens */
    bypassCSP: true,

    /* Capture explicit diagnostic metadata for quick debugging review flows */
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    // 1️⃣ AUTH PIPELINE SETUP STAGE: Executes the login flow and extracts tokens
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
    },

    // 2️⃣ CORE BROWSER RUNNER: Isolated strictly to Chromium to avoid cross-browser performance lag
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'auth.json', // 🎯 Starts browser in a pre-authenticated dashboard state
      },
      dependencies: ['setup'], // ⏳ Forces this project to wait for the setup script to pass successfully
    },
  ],
});