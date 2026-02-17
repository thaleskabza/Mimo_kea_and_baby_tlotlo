# Mimo_kea_and_baby_tlotlo

lets check :
```
import { test, expect } from "../fixtures/video";
import {
  Container,
  deals,
  Login,
  Menu,
  utilityFunctions,
  performLogin,
} from "../aafx-ui/dealTicket_functions";
import { getConfig } from "../setup/config";
import { ElectronHelper } from "../setup/electron-helper";
import { ApiHelper } from "../setup/api-helper";
import * as fs from "fs";


// Currency pairs to test
const currencyPairs = [
  "GBP/ZAR",
  "TRY/ZAR",
  // "SGD/ZAR",
  // "PLN/ZAR",
  // "NZD/ZAR",
  // "ILS/ZAR",
  // "USD/ZAR",
  // "EUR/ZAR",
  // "DKK/ZAR",
  // "CHF/ZAR",
  // "CAD/ZAR",
  // "BWP/ZAR",
  // "AUD/ZAR",
  // "ZAR/ZMW",
  // "ZAR/UGX",
  // "ZAR/TZS",
  // "ZAR/THB",
  // "ZAR/SZL",
  // "ZAR/SEK",
  //  "ZAR/SAR",
  // "ZAR/QAR",
  // "ZAR/PKR",
  // "ZAR/NOK",
  // "ZAR/NGN",
  // "ZAR/NAD",
  // "ZAR/MZN",
  // "ZAR/MXN",
  // "ZAR/MWK",
  // "ZAR/MUR",
  // "ZAR/LSL",
  // "ZAR/KWD",
  // "ZAR/KES",
  // "ZAR/JPY",
  // "ZAR/INR",
  // "ZAR/HUF",
  // "ZAR/HKD",
  // "ZAR/GHS",
  // "ZAR/CZK",
  // "ZAR/CNH",
  // "ZAR/AED",
  // "USD/ZMW",
  // "USD/UGX",
  // "USD/TZS",
  // "USD/TRY",
  // "USD/THB",
  // "USD/SZL",
  // "USD/SGD",
  // "USD/SEK",
  // "USD/SAR",
  // "USD/PLN",
  // "USD/NOK",
  // "USD/NGN",
  // "USD/NAD",
  // "USD/MZN",
  // "USD/MXN",
  // "USD/MWK",
  // "USD/MUR",
  // "USD/LSL",
  // "USD/KES",
  // "USD/JPY",
  // "USD/INR",
  // "USD/ILS",
  // "USD/HUF",
  // "USD/HKD",
  // "USD/GHS",
  // "USD/DKK",
  // "USD/CZK",
  // "USD/CNH",
  // "USD/CHF",
  // "USD/CAD",
  // "USD/AED",
  // "NZD/USD",
  // "NZD/SEK",
  // "NZD/NOK",
  // "NZD/DKK",
  // "NZD/CHF",
  // "NZD/CAD",
  // "GBP/ZMW",
  // "GBP/USD",
  // "GBP/UGX",
  // "GBP/TZS",
  // "GBP/SEK",
  // "GBP/NOK",
  // "GBP/NGN",
  // "GBP/NAD",
  // "GBP/MZN",
  // "GBP/MUR",
  // "GBP/KES",
  // "GBP/JPY",
  // "GBP/HKD",
  // "GBP/GHS",
  // "GBP/DKK",
  // "GBP/CNH",
  // "GBP/CHF",
  // "GBP/CAD",
  // "GBP/BWP",
  // "GBP/AUD",
  // "EUR/ZMW",
  // "EUR/USD",
  // "EUR/UGX",
  // "EUR/TZS",
  // "EUR/SGD",
  // "EUR/SEK",
  // "EUR/NZD",
  // "EUR/NOK",
  // "EUR/NGN",
  // "EUR/NAD",
  // "EUR/MZN",
  // "EUR/MUR",
  // "EUR/KES",
  // "EUR/JPY",
  // "EUR/HKD",
  // "EUR/GHS",
  // "EUR/GBP",
  // "EUR/DKK",
  // "EUR/CNH",
  // "EUR/CHF",
  // "EUR/CAD",
  // "EUR/BWP",
  // "EUR/AUD",
  // "CHF/SEK",
  // "CHF/NOK",
  // "CHF/JPY",
  // "CHF/DKK",
  // "CAD/SEK",
  // "CAD/NOK",
  // "CAD/JPY",
  // "CAD/DKK",
  // "CAD/CHF",
  // "BWP/USD",
  // "AUD/USD",
  // "AUD/SEK",
  // "AUD/NZD",
  // "AUD/NOK",
  // "AUD/JPY",
  // "AUD/DKK",
  // "AUD/CHF",
  // "AUD/CAD",
];
let users: any = null;
let isLoggedIn: boolean = false;

test.beforeAll(async ({ request }) => {
  console.log("=== TRADE CANCELLATION TEST INITIALIZATION ===");
  
  try {
    try {
      users = await ApiHelper.fetchUsers(request);
      console.log("✓ Successfully fetched users from API");
    } catch (apiError) {
      console.warn("⚠ API fetch failed (non-critical)");
    }

    await ElectronHelper.createInstance();
    console.log("✓ Electron instance created successfully");

    // Create screenshots directory if it doesn't exist
    if (!fs.existsSync("screenshots")) {
      fs.mkdirSync("screenshots", { recursive: true });
      console.log("✓ Screenshots directory created");
    }
  } catch (error) {
    console.error("✗ Critical initialization failure:", error);
    throw error;
  }
});

test.afterAll(async () => {
  console.log("=== TRADE CANCELLATION TEST SUITE CLEANUP ===");
  try {
    const electronInstance = ElectronHelper.getInstance();
    if (electronInstance) {
      await utilityFunctions.closeApp();
      console.log("✓ Application closed successfully");
    }
  } catch (error) {
    const err = error as Error;
    console.error("✗ Error during cleanup:", err.message);
  }
});

test.afterEach(async ({}, testInfo) => {
  // Take screenshot on test failure
  if (testInfo.status !== testInfo.expectedStatus) {
    try {
      const screenshot = await takeContainerScreenshot();
      if (screenshot) {
        await testInfo.attach("failure-screenshot", {
          body: screenshot,
          contentType: "image/png",
        });
      }
    } catch (error) {
      console.error("Failed to take failure screenshot:", error);
    }
  }
});

// Simplified login using the helper function
const login = async (): Promise<void> => {
  if (isLoggedIn) {
    console.log("✓ Already logged in, skipping login");
    return;
  }

  try {
    const config = getConfig();

    if (!config.username || !config.password) {
      throw new Error("Username or password not configured");
    }

    await utilityFunctions.wait(5000);

    await performLogin(config.username, config.password);

    await utilityFunctions.wait(20000);

    isLoggedIn = true;
    console.log("✓ Login successful!\n");
  } catch (error) {
    console.error("✗ Login failed:", error);

    try {
      const firstWindow = await utilityFunctions.firstWindow();
      const screenshot = await firstWindow.screenshot();
      if (screenshot) {
        const timestamp = Date.now();
        fs.writeFileSync(
          `test-results/login-failure-${timestamp}.png`,
          screenshot
        );
        console.log(
          `  Screenshot saved: test-results/login-failure-${timestamp}.png`
        );
      }
    } catch (screenshotError) {
      console.error("  Could not take screenshot");
    }

    throw error;
  }
};


const logout = async (): Promise<void> => {
  console.log("\nLogging out...");

  try {
    const containerWindow = await Container.window();
    if (!containerWindow) {
      console.warn("⚠ Container window not found for logout");
      return;
    }

    const logoutButton = containerWindow.locator(".logout > img");
    await logoutButton.click();
    await utilityFunctions.wait(1000);

    const signOutButton = containerWindow.getByRole("button", {
      name: "Sign out",
    });
    await signOutButton.click();
    await utilityFunctions.wait(2000);

    isLoggedIn = false;
    console.log("✓ Logout successful");
  } catch (error) {
    console.error("✗ Logout failed:", error);
    isLoggedIn = false;
  }
};

const takeContainerScreenshot = async (): Promise<Buffer | undefined> => {
  try {
    const appContainer = await Container.window();
    if (!appContainer) {
      return undefined;
    }

    const screenshot = await appContainer.screenshot();
    return screenshot;
  } catch (error) {
    return undefined;
  }
};

/**
 * Book a simple USD/ZAR deal (simplified version)
 * NOTE: Assumes deal ticket is already open
 */
const bookDealSimple = async (
  testInfo: any,
  usdAmount: string,
  screenshotPrefix: string = ""
): Promise<void> => {
  console.log(`=== Booking Simple Deal: USD ${usdAmount} ===`);
  
  const containerWindow = await Container.window();
  if (!containerWindow) {
    throw new Error("Container window not found");
  }

  try {
    // Take screenshot of deal ticket before entering amount
    const dealTicketScreenshot = await takeContainerScreenshot();
    if (dealTicketScreenshot) {
      await testInfo.attach(`${screenshotPrefix}deal-ticket`, {
        body: dealTicketScreenshot,
        contentType: "image/png",
      });
    }

    // Enter amount
    console.log(`💰 Entering amount: ${usdAmount}`);
    const amountInput = containerWindow
      .getByRole("textbox", { name: "Enter amount" })
      .first();
    await amountInput.waitFor({ state: "visible", timeout: 10000 });
    await amountInput.click();
    await amountInput.fill(usdAmount);
    await utilityFunctions.wait(5000);

    // Add reference
    const referenceInput = containerWindow.getByRole("textbox", {
      name: "Reference (optional)",
    });
    await referenceInput.click();
    await referenceInput.fill("cancellation-test");
    console.log(`✓ Amount and reference entered`);
    await utilityFunctions.wait(5000);

    // Take screenshot before booking
    const beforeBookingScreenshot = await takeContainerScreenshot();
    if (beforeBookingScreenshot) {
      await testInfo.attach(`${screenshotPrefix}before-booking`, {
        body: beforeBookingScreenshot,
        contentType: "image/png",
      });
    }

    // Book the deal
    console.log(`📤 Booking deal...`);
    const bookDealButton = containerWindow.getByRole("button", {
      name: "Book Deal",
    });
    await bookDealButton.click();
    await utilityFunctions.wait(20000);

    // Wait for confirmation
    await containerWindow
      .getByRole("heading", { name: "Your deal has been booked" })
      .waitFor({
        state: "visible",
        timeout: 20000,
      });
    console.log(`✓ Deal booked successfully`);
    await utilityFunctions.wait(10000);

    // Take screenshot of confirmation
    const confirmationScreenshot = await takeContainerScreenshot();
    if (confirmationScreenshot) {
      await testInfo.attach(`${screenshotPrefix}deal-confirmed`, {
        body: confirmationScreenshot,
        contentType: "image/png",
      });
    }
  } catch (error) {
    const err = error as Error;
    console.error(`✗ Error booking deal: ${err.message}`);
    
    // Take error screenshot
    const errorScreenshot = await takeContainerScreenshot();
    if (errorScreenshot) {
      await testInfo.attach(`${screenshotPrefix}booking-error`, {
        body: errorScreenshot,
        contentType: "image/png",
      });
    }
    
    throw error;
  }
};

/**
 * Extract FX deal number from confirmation screen
 */
const extractDealNumber = async (
  containerWindow: any
): Promise<string | null> => {
  try {
    // Wait for the "FX deal number" heading to be visible
    await containerWindow
      .getByRole("heading", { name: "FX deal number" })
      .waitFor({
        state: "visible",
        timeout: 15000,
      });

    // Take a screenshot to help debug if needed
    await containerWindow.screenshot({
      path: `screenshots/deals_folder/deal-number-extraction-${Date.now()}.png`,
      fullPage: true,
    });

    // Strategy 1: Look for text that matches pattern "FX deal number 346697"
    const dealNumberPattern = /FX deal number[^\d]*(\d{6,})/i;
    
    // Try getting from the main content area
    const mainContent = await containerWindow.locator('#root').textContent({ timeout: 5000 });
    
    if (mainContent) {
      const match = mainContent.match(dealNumberPattern);
      if (match && match[1]) {
        console.log(`  💎 FX Deal Number: ${match[1]}`);
        return match[1];
      }
    }

    // Strategy 2: Try to find by looking at the confirmation dialog specifically
    const confirmationDialog = containerWindow.locator('text=/Your deal has been booked/').locator('xpath=ancestor::div[contains(@class, "dialog") or contains(@class, "modal") or contains(@class, "confirmation")]').first();
    const dialogText = await confirmationDialog.textContent({ timeout: 5000 }).catch(() => null);
    
    if (dialogText) {
      const match = dialogText.match(dealNumberPattern);
      if (match && match[1]) {
        console.log(`  💎 FX Deal Number: ${match[1]}`);
        return match[1];
      }
    }

    // Strategy 3: Look for the green text that typically shows the deal number
    const greenTextElement = containerWindow.locator('text=/\\d{6,}/').filter({ hasText: /^\d{6,}$/ }).first();
    const dealNumber = await greenTextElement.textContent({ timeout: 5000 }).catch(() => null);
    
    if (dealNumber && /^\d{6,}$/.test(dealNumber.trim())) {
      console.log(`  💎 FX Deal Number: ${dealNumber.trim()}`);
      return dealNumber.trim();
    }

    console.warn(`  ⚠ Could not extract deal number using any strategy`);
  } catch (error) {
    const err = error as Error;
    console.warn(`  ⚠ Could not extract deal number: ${err.message}`);
  }

  return null;
};


/**
 * Book a deal for a specific currency pair
 * NOTE: Assumes deal ticket is already open - does NOT open menu
 */
const bookDealForCurrencyPair = async (
  testInfo: any,
  currencyPair: string,
  usdAmount: string = "1000"
): Promise<string | null> => {
  console.log(`  📝 Booking ${currencyPair} deal...`);

  const containerWindow = await Container.window();
  if (!containerWindow) {
    throw new Error("Container window not found");
  }

  try {
    // Take screenshot of deal ticket
    await containerWindow.screenshot({
      path: `screenshots/${currencyPair.replace("/", "-")}_folder/${currencyPair.replace("/", "-")}_01_deal_ticket.png`,
      fullPage: true,
    });
    console.log(
      `  📸 Screenshot: ${currencyPair.replace("/", "-")}_01_deal_ticket.png`
    );

    // Select currency pair
    console.log(`  💱 Selecting currency pair: ${currencyPair}`);

    const dropdownArrow = containerWindow.locator("svg").nth(3);
    await dropdownArrow.waitFor({ state: "visible", timeout: 5000 });
    await dropdownArrow.click();
    console.log(`  ✓ Dropdown opened`);

    await utilityFunctions.wait(5000);

    const currencyOption = containerWindow.getByText(currencyPair, {
      exact: true,
    });
    console.log("currencyOption to be selected:", currencyPair);
    console.log("currencyOption to be selected:", currencyOption);
    await currencyOption.waitFor({ state: "visible", timeout: 10000 });
    await currencyOption.click();
    console.log(`  ✓ Currency pair selected`);
    await utilityFunctions.wait(20000);

    // Take screenshot after currency selection
    await containerWindow.screenshot({
      path: `screenshots/${currencyPair.replace("/", "-")}_folder/${currencyPair.replace(
        "/",
        "-"
      )}_02_currency_selected.png`,
      fullPage: true,
    });
    console.log(
      `  📸 Screenshot: ${currencyPair.replace(
        "/",
        "-"
      )}_02_currency_selected.png`
    );

    // Enter amount
    console.log(`  💰 Entering amount: ${usdAmount}`);
    const amountInput = containerWindow
      .getByRole("textbox", { name: "Enter amount" })
      .first();
    await amountInput.waitFor({ state: "visible", timeout: 10000 });
    await amountInput.click();
    await amountInput.fill(usdAmount);
    await utilityFunctions.wait(5000);

    // Add reference
    const referenceInput = containerWindow.getByRole("textbox", {
      name: "Reference (optional)",
    });
    await referenceInput.click();
    await referenceInput.fill("cancellation");
    console.log(`  ✓ Amount and reference entered`);
    await utilityFunctions.wait(5000);

    // Take screenshot before booking
    await containerWindow.screenshot({
      path: `screenshots/${currencyPair.replace("/", "-")}_folder/${currencyPair.replace(
        "/",
        "-"
      )}_03_before_booking.png`,
      fullPage: true,
    });
    console.log(
      `  📸 Screenshot: ${currencyPair.replace("/", "-")}_03_before_booking.png`
    );

    // Book the deal
    console.log(`  📤 Booking deal...`);
    //getByRole('button', { name: 'Book Deal' }).click();
    const bookDealButton = containerWindow.getByRole("button", {
      name: "Book Deal",
    });
    await bookDealButton.click();
    await containerWindow.screenshot({
      path: `screenshots/${currencyPair.replace("/", "-")}_folder/${currencyPair.replace("/", "-")}_04_booked.png`,
      fullPage: true,
    });
    await utilityFunctions.wait(20000);
    await containerWindow.screenshot({
      path: `screenshots/${currencyPair.replace("/", "-")}_05_booked.png`,
      fullPage: true,
    });
    // Wait for confirmation
    await containerWindow
      .getByRole("heading", { name: "Your deal has been booked" })
      .waitFor({
        state: "visible",
        timeout: 20000,
      });
    console.log(`  ✓ Deal confirmed`);
    await utilityFunctions.wait(20000);
    console.log(
      `  📸 Screenshot: ${currencyPair.replace("/", "-")}_05_booked.png`
    );
    // Take screenshot of confirmation
    await containerWindow.screenshot({
      path: `screenshots/${currencyPair.replace("/", "-")}_folder/${currencyPair.replace("/", "-")}_06_booked.png`,
      fullPage: true,
    });
    console.log(
      `  📸 Screenshot: ${currencyPair.replace("/", "-")}_07_booked.png`
    );

    // Extract and return deal number
    const dealNumber = await extractDealNumber(containerWindow);
    return dealNumber;
  } catch (error) {
    const err = error as Error;
    console.error(`  ✗ Error booking deal: ${err.message}`);

    await containerWindow.screenshot({
      path: `screenshots/${currencyPair.replace("/", "-")}_folder/${currencyPair.replace("/", "-")}_ERROR_booking.png`,
      fullPage: true,
    });
    console.log(
      `  📸 Error screenshot: ${currencyPair.replace(
        "/",
        "-"
      )}_ERROR_booking.png`
    );

    throw error;
  }
};


/**
 * Navigate to Trade Manager
 */
const navigateToTradeManager = async (
  testInfo: any,
  screenshotPrefix: string = ""
): Promise<void> => {
  console.log(`📊 Opening Trade Manager...`);

  const containerWindow = await Container.window();
  if (!containerWindow) {
    throw new Error("Container window not found");
  }

  const tradeManagerButton = containerWindow.getByRole("button", {
    name: "Trade manager",
  });
  await tradeManagerButton.click();
  await utilityFunctions.wait(20000);

  console.log(`✓ Trade Manager opened`);

  // Click "Today's Trades" to show recent trades
  const todaysTradesButton = containerWindow.getByRole("button", {
    name: "Today's Trades",
  });
  await todaysTradesButton.click();
  await utilityFunctions.wait(20000);
  console.log(`✓ Today's trades loaded`);

  const tradeManagerScreenshot = await takeContainerScreenshot();
  if (tradeManagerScreenshot) {
    await testInfo.attach(`${screenshotPrefix}trade-manager`, {
      body: tradeManagerScreenshot,
      contentType: "image/png",
    });
  }
};
/**
 * Check if cancellation option is visible in the context menu
 */
const checkCancellationVisibility = async (
  testInfo: any,
  currencyPair: string
): Promise<boolean> => {
  console.log(`  🔍 Checking cancellation visibility...`);

  const containerWindow = await Container.window();
  if (!containerWindow) {
    throw new Error("Container window not found");
  }

  try {
    const tradeCell = containerWindow.getByRole('gridcell', { name: 'AAFX' });//getByRole('gridcell', { name: 'AAFX' }).
    await tradeCell.click({button: 'right'});
    await utilityFunctions.wait(5000);

    await containerWindow.screenshot({
      path: `screenshots/${currencyPair.replace("/", "-")}_folder/${currencyPair.replace("/", "-")}_05_context_menu.png`,
      fullPage: true,
    });
    console.log(
      `  📸 Screenshot: ${currencyPair.replace("/", "-")}_05_context_menu.png`
    );

    const contextMenuScreenshot = await takeContainerScreenshot();
    if (contextMenuScreenshot) {
      await testInfo.attach(`${currencyPair.replace("/", "-")}_context_menu`, {
        body: contextMenuScreenshot,
        contentType: "image/png",
      });
    }

const cancellationOption = containerWindow.locator("#Cancellation");
const isVisible = await cancellationOption.isVisible({ timeout: 5000 });

if (isVisible) {
  console.log(`  ✅ PASS: Cancellation option is VISIBLE`);
  
  const isEnabled = await cancellationOption.isEnabled();
  if (isEnabled) {
    console.log(`  ✅ PASS: Cancellation option is ENABLED`);
    
    // Click on the Cancellation option to open the dialog
    console.log(`  🖱️  Clicking on Cancellation option...`);
    await cancellationOption.click();
    await utilityFunctions.wait(3000); // Wait for cancellation dialog to load
    
    // Take screenshot of the cancellation dialog
    await containerWindow.screenshot({
      path: `screenshots/${currencyPair.replace("/", "-")}_folder/${currencyPair.replace("/", "-")}_06_cancellation_dialog.png`,
      fullPage: true,
    });
    console.log(`  📸 Screenshot: ${currencyPair.replace("/", "-")}_06_cancellation_dialog.png`);
    
    const dialogScreenshot = await takeContainerScreenshot();
    if (dialogScreenshot) {
      await testInfo.attach(`${currencyPair.replace("/", "-")}_cancellation_dialog`, {
        body: dialogScreenshot,
        contentType: "image/png",
      });
    }
    
    console.log(`  ✓ Cancellation dialog opened successfully`);
    
    // Now submit the cancellation
    console.log(`  📤 Submitting cancellation...`);
    try {
      const submitButton = containerWindow.getByRole('button', { name: 'Submit' });
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      await utilityFunctions.wait(3000);
      
      // Take screenshot after submission
      await containerWindow.screenshot({
        path: `screenshots/${currencyPair.replace("/", "-")}_folder/${currencyPair.replace("/", "-")}_07_cancellation_submitted.png`,
        fullPage: true,
      });
      console.log(`  📸 Screenshot: ${currencyPair.replace("/", "-")}_07_cancellation_submitted.png`);
      
      const submitScreenshot = await takeContainerScreenshot();
      if (submitScreenshot) {
        await testInfo.attach(`${currencyPair.replace("/", "-")}_cancellation_submitted`, {
          body: submitScreenshot,
          contentType: "image/png",
        });
      }
      
      console.log(`  ✓ Cancellation submitted successfully`);
    } catch (submitError) {
      const err = submitError as Error;
      console.error(`  ✗ Failed to submit cancellation: ${err.message}`);
    }
    
  } else {
    console.log(`  ❌ FAIL: Cancellation option is NOT ENABLED`);
  }
} else {
  console.log(`  ❌ FAIL: Cancellation option is NOT VISIBLE`);
}

    return isVisible;
  } catch (error) {
    const err = error as Error;
    console.error(`  ✗ Error checking cancellation: ${err.message}`);

    await containerWindow.screenshot({
      path: `screenshots/${currencyPair.replace(
        "/",
        "-"
      )}_ERROR_cancellation.png`,
      fullPage: true,
    });
    console.log(
      `  📸 Error screenshot: ${currencyPair.replace(
        "/",
        "-"
      )}_ERROR_cancellation.png`
    );

    const errorScreenshot = await takeContainerScreenshot();
    if (errorScreenshot) {
      await testInfo.attach(`${currencyPair.replace("/", "-")}_error`, {
        body: errorScreenshot,
        contentType: "image/png",
      });
    }

    return false;
  }
};

/**
 * Close Trade Manager and prepare for next deal
 */
const prepareForNextDeal = async (): Promise<void> => {
  console.log(`  🔄 Preparing for next currency pair...`);

  const containerWindow = await Container.window();
  if (!containerWindow) {
    throw new Error("Container window not found");
  }

  try {
    // Try to find and click a close/back button first
    const closeButton = containerWindow
      .locator('.blotters-window-header > .svg-inline--fa > path');
      
    try {
      await closeButton.click({ timeout: 5000 });
      await utilityFunctions.wait(3000);
      console.log(`  ✓ Trade Manager closed`);
    } catch (e) {
      console.log(`  ⚠ No close button found, continuing...`);
    }

    // Click "New deal" button
    const newDealButton = containerWindow.getByRole("button", {
      name: "New deal",
    });
    await newDealButton.waitFor({ state: "visible", timeout: 10000 });
    await newDealButton.click();
    console.log(`  ✓ "New deal" clicked, ready for next pair`);
    await utilityFunctions.wait(20000);
  } catch (error) {
    const err = error as Error;
    console.error(`  ✗ Error preparing for next deal: ${err.message}`);
    throw error;
  }
};
/**
 * Open cancellation dialog for the first trade in the grid
 */
const openCancellationDialog = async (testInfo: any, screenshotName: string = "cancellation-dialog"): Promise<void> => {
  console.log("Opening Cancellation dialog...");
  
  const containerWindow = await Container.window();
  if (!containerWindow) {
    throw new Error("Container window not found");
  }

  // Find and right-click the first trade in the grid
  const tradeCell = containerWindow.getByRole('gridcell').first();
  await tradeCell.waitFor({ state: 'visible', timeout: 10000 });
  
  await tradeCell.click({ button: 'right' });
  console.log("Right-clicked on trade");
  await utilityFunctions.wait(2000);
  
  // Click on Cancellation option from context menu
  const cancellationOption = containerWindow.locator('#Cancellation').getByText('Cancellation');
  await cancellationOption.waitFor({ state: 'visible', timeout: 5000 });
  await cancellationOption.click();
  console.log("Cancellation option clicked");
  
  await utilityFunctions.wait(3000); // Wait for cancellation dialog to load
  
  const dialogScreenshot = await takeContainerScreenshot();
  if (dialogScreenshot) {
    await testInfo.attach(screenshotName, {
      body: dialogScreenshot,
      contentType: "image/png",
    });
  }
  
  console.log(" Cancellation dialog opened successfully");
};

/**
 * Submit cancellation
 */
const submitCancellation = async (testInfo: any): Promise<void> => {
  console.log("Submitting cancellation...");
  
  const containerWindow = await Container.window();
  if (!containerWindow) {
    throw new Error("Container window not found");
  }

  const submitButton = containerWindow.getByRole('button', { name: 'Submit' });
  await submitButton.waitFor({ state: 'visible', timeout: 10000 });
  
  // Check if button is enabled
  const isEnabled = await submitButton.isEnabled();
  if (!isEnabled) {
    throw new Error("Submit button is disabled");
  }
  
  await submitButton.click();
  console.log("Submit button clicked");
  
  await utilityFunctions.wait(4000); // Wait for cancellation to process
  
  const submissionScreenshot = await takeContainerScreenshot();
  if (submissionScreenshot) {
    await testInfo.attach("cancellation-submitted", {
      body: submissionScreenshot,
      contentType: "image/png",
    });
  }
  
  console.log(" Cancellation submitted successfully");
};

/**
 * Close cancellation dialog
 */
const closeCancellationDialog = async (): Promise<void> => {
  console.log("Closing cancellation dialog...");
  
  const containerWindow = await Container.window();
  if (!containerWindow) {
    console.warn("Container window not found for closing dialog");
    return;
  }

  try {
    const closeButton = containerWindow.locator('button').filter({ hasText: /^(Close|Cancel)$/i });
    await closeButton.waitFor({ state: 'visible', timeout: 5000 });
    await closeButton.click();
    console.log("✓ Cancellation dialog closed");
    
    await utilityFunctions.wait(2000);
  } catch (error) {
    const err = error as Error;
    console.warn("Could not close dialog with button, trying ESC key");
    try {
      await containerWindow.keyboard.press('Escape');
      console.log("✓ Closed dialog with ESC key");
      await utilityFunctions.wait(1000);
    } catch (escError) {
      const escErr = escError as Error;
      console.warn(`Could not close dialog: ${escErr.message}`);
    }
  }
};

// ============================================================================
// TEST SUITE
// ============================================================================

test.describe("Trade Cancellation Feature Verification", () => {
  
  test("Complete Trade Cancellation Flow - Book and Cancel Trade", async ({}, testInfo) => {
    console.log("=== TRADE CANCELLATION COMPLETE FLOW TEST ===");
    console.log("Testing: Book Trade -> Navigate to Trade Manager -> Cancel Trade");
    const results: any[] = [];
    const startTime = Date.now();
    // Step 1: Login
    await login();
        // Open Spot/Fwd deal ticket ONCE at the beginning
    console.log(`\n🎬 Opening Spot/Fwd deal ticket...`);

    await utilityFunctions.wait(10000);

    const containerWindow = await Container.window();
    if (!containerWindow) {
      throw new Error("Container window not found after login");
    }

    
    // Open the deal ticket
    try {
      await Container.openDealTicketFromMenu();
      console.log(`✓ Spot/Fwd deal ticket opened`);
    } catch (error) {
      console.log(`  ⚠ openDealTicketFromMenu failed, trying direct click...`);
      const spotFwdButton = containerWindow.getByText("Spot/Fwd").first();
      await spotFwdButton.waitFor({ state: "visible", timeout: 20000 });
      await spotFwdButton.click();
      console.log(`✓ Spot/Fwd deal ticket opened (fallback)`);
    }
    await utilityFunctions.wait(20000);


    const loginScreenshot = await takeContainerScreenshot();
    if (loginScreenshot) {
      await testInfo.attach("01-login-success", {
        body: loginScreenshot,
        contentType: "image/png",
      });
    }

    // Step 2: Book a Trade (using simple USD-only pattern like fx-regression)
    try {
      await bookDealSimple(testInfo, '10000', '02-');
      console.log(" Trade booked successfully");
    } catch (error) {
      console.error("Failed to book trade:", error);
      throw error;
    }

    // Step 3: Navigate to Trade Manager
    try {
      await navigateToTradeManager(testInfo, "03-trade-manager");
    } catch (error) {
      console.error("Failed to navigate to Trade Manager:", error);
      throw error;
    }

    // Step 4: Open Cancellation Dialog
    try {
      await openCancellationDialog(testInfo, "04-cancellation-dialog");
    } catch (error) {
      console.error("Failed to open cancellation dialog:", error);
      throw error;
    }

    // Step 5: Submit Cancellation
    try {
      await submitCancellation(testInfo);
      
      const finalScreenshot = await takeContainerScreenshot();
      if (finalScreenshot) {
        await testInfo.attach("05-cancellation-complete", {
          body: finalScreenshot,
          contentType: "image/png",
        });
      }
    } catch (error) {
      console.error("Failed to submit cancellation:", error);
      throw error;
    }

    console.log("=== TRADE CANCELLATION COMPLETE FLOW TEST COMPLETED SUCCESSFULLY ===");
  });

  test("Partial Trade Cancellation - Validate Amounts", async ({}, testInfo) => {
    console.log("=== PARTIAL TRADE CANCELLATION TEST ===");
    console.log("Testing: Book Trade -> Partial Cancellation with Amount Validation");
    
    // Step 1: Login (or skip if already logged in)
    await login();

    const loginScreenshot = await takeContainerScreenshot();
    if (loginScreenshot) {
      await testInfo.attach("01-partial-cancel-login", {
        body: loginScreenshot,
        contentType: "image/png",
      });
    }

    // Step 2: Book a Trade with larger amount
    try {
      await bookDealSimple(testInfo, '50000', '02-');
      console.log(" Trade booked for partial cancellation");
    } catch (error) {
      console.error("Failed to book trade:", error);
      throw error;
    }

    // Step 3: Navigate to Trade Manager
    try {
      await navigateToTradeManager(testInfo, "03-partial-trade-manager");
    } catch (error) {
      console.error("Failed to navigate to Trade Manager:", error);
      throw error;
    }

    // Step 4: Open Cancellation Dialog
    try {
      await openCancellationDialog(testInfo, "04-partial-cancellation-dialog");
    } catch (error) {
      console.error("Failed to open cancellation dialog:", error);
      throw error;
    }

    // Step 5: Test Partial Cancellation Amounts
    console.log("Testing partial cancellation amounts...");
    try {
      const containerWindow = await Container.window();
      if (!containerWindow) {
        throw new Error("Container window not found");
      }

      // Test entering amount in second field first
      const secondAmountField = containerWindow.getByRole('textbox', { name: 'Enter amount' }).nth(1);
      await secondAmountField.waitFor({ state: 'visible', timeout: 10000 });
      await secondAmountField.click();
      await secondAmountField.fill('1');
      console.log(" Entered amount in second field: 1");
      await utilityFunctions.wait(1000);

      // Then enter amount in first field
      const firstAmountField = containerWindow.getByRole('textbox', { name: 'Enter amount' }).first();
      await firstAmountField.waitFor({ state: 'visible', timeout: 10000 });
      await firstAmountField.click();
      await firstAmountField.fill('12');
      console.log(" Entered amount in first field: 12");
      await utilityFunctions.wait(1000);

      const partialAmountScreenshot = await takeContainerScreenshot();
      if (partialAmountScreenshot) {
        await testInfo.attach("05-partial-amounts-entered", {
          body: partialAmountScreenshot,
          contentType: "image/png",
        });
      }

      // Test clearing amounts
      console.log("Testing amount clearing...");
      await firstAmountField.click();
      await firstAmountField.clear();
      await utilityFunctions.wait(500);
      
      await secondAmountField.click();
      await secondAmountField.clear();
      await utilityFunctions.wait(500);
      console.log(" Amounts cleared successfully");

      const clearedAmountScreenshot = await takeContainerScreenshot();
      if (clearedAmountScreenshot) {
        await testInfo.attach("06-amounts-cleared", {
          body: clearedAmountScreenshot,
          contentType: "image/png",
        });
      }

    } catch (error) {
      console.error("Failed during partial amount testing:", error);
      throw error;
    }

    // Step 6: Close the cancellation dialog without submitting
    try {
      await closeCancellationDialog();
      console.log("✓ Partial cancellation test completed - dialog closed without submission");
      
      const finalScreenshot = await takeContainerScreenshot();
      if (finalScreenshot) {
        await testInfo.attach("07-partial-cancel-final", {
          body: finalScreenshot,
          contentType: "image/png",
        });
      }
    } catch (error) {
      const err = error as Error;
      console.warn("Could not close dialog:", err.message);
    }

    console.log("=== PARTIAL TRADE CANCELLATION TEST COMPLETED ===");
  });

  test("Trade Cancellation - Negative Test: Cancel Without Required Fields", async ({}, testInfo) => {
    console.log("=== TRADE CANCELLATION NEGATIVE TEST ===");
    console.log("Testing: Attempt cancellation without required fields");
    
    // Step 1: Login (or skip if already logged in)
    await login();

    const loginScreenshot = await takeContainerScreenshot();
    if (loginScreenshot) {
      await testInfo.attach("01-negative-test-login", {
        body: loginScreenshot,
        contentType: "image/png",
      });
    }

    // Step 2: Book a Trade
    try {
      await bookDealSimple(testInfo, '25000', '02-');
      console.log(" Trade booked for negative test");
    } catch (error) {
      console.error("Failed to book trade:", error);
      throw error;
    }

    // Step 3: Navigate to Trade Manager
    try {
      await navigateToTradeManager(testInfo, "03-negative-trade-manager");
    } catch (error) {
      console.error("Failed to navigate to Trade Manager:", error);
      throw error;
    }

    // Step 4: Open Cancellation Dialog
    try {
      await openCancellationDialog(testInfo, "04-negative-cancellation-dialog");
    } catch (error) {
      console.error("Failed to open cancellation dialog:", error);
      throw error;
    }

    // Step 5: Attempt to submit without entering any amounts or required fields
    console.log("Attempting to submit cancellation without required fields...");
    
    try {
      const containerWindow = await Container.window();
      if (!containerWindow) {
        throw new Error("Container window not found");
      }

      const submitButton = containerWindow.getByRole('button', { name: 'Submit' });
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      
      // Check if submit button is disabled (expected behavior)
      const isSubmitEnabled = await submitButton.isEnabled();
      console.log(`Submit button enabled state: ${isSubmitEnabled}`);

      if (isSubmitEnabled) {
        console.log("⚠️ Submit button is enabled without required fields - testing validation...");
        await submitButton.click();
        await utilityFunctions.wait(3000);

        // Check for validation error message
        const errorSelectors = [
          '[class*="error"]',
          '[class*="invalid"]',
          '[role="alert"]',
          '.error-message',
          'text=/error/i',
          'text=/required/i'
        ];
        
        let validationFound = false;
        
        for (const selector of errorSelectors) {
          try {
            const errorElement = containerWindow.locator(selector).first();
            await errorElement.waitFor({ state: 'visible', timeout: 3000 });
            const errorText = await errorElement.textContent();
            console.log(` Validation error detected: ${errorText}`);
            validationFound = true;
            break;
          } catch (error) {
            // Try next selector
          }
        }
        
        if (validationFound) {
          console.log(" Proper validation behavior confirmed");
        } else {
          console.warn("⚠️ No validation errors found - this may indicate a validation gap");
        }

        const validationScreenshot = await takeContainerScreenshot();
        if (validationScreenshot) {
          await testInfo.attach("05-negative-validation-error", {
            body: validationScreenshot,
            contentType: "image/png",
          });
        }
      } else {
        console.log("✓ Submit button correctly disabled without required fields");
        
        const disabledButtonScreenshot = await takeContainerScreenshot();
        if (disabledButtonScreenshot) {
          await testInfo.attach("05-negative-button-disabled", {
            body: disabledButtonScreenshot,
            contentType: "image/png",
          });
        }
      }

    } catch (error) {
      const err = error as Error;
      console.log("Expected validation behavior - error encountered:", err.message);
    }

    // Step 6: Close the dialog
    try {
      await closeCancellationDialog();
      console.log("✓ Negative test dialog closed");
      
      const finalScreenshot = await takeContainerScreenshot();
      if (finalScreenshot) {
        await testInfo.attach("06-negative-test-final", {
          body: finalScreenshot,
          contentType: "image/png",
        });
      }
    } catch (error) {
      const err = error as Error;
      console.warn("Could not close dialog:", err.message);
    }

    console.log("=== NEGATIVE TEST COMPLETED ===");
  });
});

```
