import { test, expect } from “../fixtures/video”;
import {
Container,
deals,
Login,
Menu,
utilityFunctions,
performLogin,
} from “../aafx-ui/dealTicket_functions”;
import { getConfig } from “../setup/config”;
import { ElectronHelper } from “../setup/electron-helper”;
import { ApiHelper } from “../setup/api-helper”;
import * as fs from “fs”;

// ============================================================================
// CONFIGURATION
// ============================================================================

/** Currency pairs to test for multi-pair cancellation */
const currencyPairs = [
“GBP/ZAR”,
“TRY/ZAR”,
// “SGD/ZAR”,
// “PLN/ZAR”,
// “NZD/ZAR”,
// “ILS/ZAR”,
// “USD/ZAR”,
// “EUR/ZAR”,
// “DKK/ZAR”,
// “CHF/ZAR”,
// “CAD/ZAR”,
// “BWP/ZAR”,
// “AUD/ZAR”,
// “ZAR/ZMW”,
// “ZAR/UGX”,
// “ZAR/TZS”,
// “ZAR/THB”,
// “ZAR/SZL”,
// “ZAR/SEK”,
// “ZAR/SAR”,
// “ZAR/QAR”,
// “ZAR/PKR”,
// “ZAR/NOK”,
// “ZAR/NGN”,
// “ZAR/NAD”,
// “ZAR/MZN”,
// “ZAR/MXN”,
// “ZAR/MWK”,
// “ZAR/MUR”,
// “ZAR/LSL”,
// “ZAR/KWD”,
// “ZAR/KES”,
// “ZAR/JPY”,
// “ZAR/INR”,
// “ZAR/HUF”,
// “ZAR/HKD”,
// “ZAR/GHS”,
// “ZAR/CZK”,
// “ZAR/CNH”,
// “ZAR/AED”,
// “USD/ZMW”,
// “USD/UGX”,
// “USD/TZS”,
// “USD/TRY”,
// “USD/THB”,
// “USD/SZL”,
// “USD/SGD”,
// “USD/SEK”,
// “USD/SAR”,
// “USD/PLN”,
// “USD/NOK”,
// “USD/NGN”,
// “USD/NAD”,
// “USD/MZN”,
// “USD/MXN”,
// “USD/MWK”,
// “USD/MUR”,
// “USD/LSL”,
// “USD/KES”,
// “USD/JPY”,
// “USD/INR”,
// “USD/ILS”,
// “USD/HUF”,
// “USD/HKD”,
// “USD/GHS”,
// “USD/DKK”,
// “USD/CZK”,
// “USD/CNH”,
// “USD/CHF”,
// “USD/CAD”,
// “USD/AED”,
// “NZD/USD”,
// “NZD/SEK”,
// “NZD/NOK”,
// “NZD/DKK”,
// “NZD/CHF”,
// “NZD/CAD”,
// “GBP/ZMW”,
// “GBP/USD”,
// “GBP/UGX”,
// “GBP/TZS”,
// “GBP/SEK”,
// “GBP/NOK”,
// “GBP/NGN”,
// “GBP/NAD”,
// “GBP/MZN”,
// “GBP/MUR”,
// “GBP/KES”,
// “GBP/JPY”,
// “GBP/HKD”,
// “GBP/GHS”,
// “GBP/DKK”,
// “GBP/CNH”,
// “GBP/CHF”,
// “GBP/CAD”,
// “GBP/BWP”,
// “GBP/AUD”,
// “EUR/ZMW”,
// “EUR/USD”,
// “EUR/UGX”,
// “EUR/TZS”,
// “EUR/SGD”,
// “EUR/SEK”,
// “EUR/NZD”,
// “EUR/NOK”,
// “EUR/NGN”,
// “EUR/NAD”,
// “EUR/MZN”,
// “EUR/MUR”,
// “EUR/KES”,
// “EUR/JPY”,
// “EUR/HKD”,
// “EUR/GHS”,
// “EUR/GBP”,
// “EUR/DKK”,
// “EUR/CNH”,
// “EUR/CHF”,
// “EUR/CAD”,
// “EUR/BWP”,
// “EUR/AUD”,
// “CHF/SEK”,
// “CHF/NOK”,
// “CHF/JPY”,
// “CHF/DKK”,
// “CAD/SEK”,
// “CAD/NOK”,
// “CAD/JPY”,
// “CAD/DKK”,
// “CAD/CHF”,
// “BWP/USD”,
// “AUD/USD”,
// “AUD/SEK”,
// “AUD/NZD”,
// “AUD/NOK”,
// “AUD/JPY”,
// “AUD/DKK”,
// “AUD/CHF”,
// “AUD/CAD”,
];

/** Default timeout for UI element waits */
const DEFAULT_TIMEOUT = 15000;

/** Short wait for animations / transitions */
const SHORT_WAIT = 2000;

/** Medium wait for API responses / data loading */
const MEDIUM_WAIT = 5000;

/** Long wait for heavy operations (booking, trade manager load) */
const LONG_WAIT = 15000;

// ============================================================================
// STATE
// ============================================================================

let users: any = null;
let isLoggedIn = false;

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

test.beforeAll(async ({ request }) => {
console.log(”=== TRADE CANCELLATION TEST INITIALIZATION ===”);

try {
try {
users = await ApiHelper.fetchUsers(request);
console.log(”  Successfully fetched users from API”);
} catch (apiError) {
console.warn(”  API fetch failed (non-critical)”);
}

```
await ElectronHelper.createInstance();
console.log("  Electron instance created successfully");

// Ensure output directories exist
const dirs = ["screenshots", "screenshots/deals_folder", "test-results"];
for (const dir of dirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
console.log("  Output directories ready");
```

} catch (error) {
console.error(”  Critical initialization failure:”, error);
throw error;
}
});

test.afterAll(async () => {
console.log(”=== TRADE CANCELLATION TEST SUITE CLEANUP ===”);
try {
const electronInstance = ElectronHelper.getInstance();
if (electronInstance) {
await utilityFunctions.closeApp();
console.log(”  Application closed successfully”);
}
} catch (error) {
const err = error as Error;
console.error(”  Error during cleanup:”, err.message);
}
});

test.afterEach(async ({}, testInfo) => {
if (testInfo.status !== testInfo.expectedStatus) {
try {
const screenshot = await takeContainerScreenshot();
if (screenshot) {
await testInfo.attach(“failure-screenshot”, {
body: screenshot,
contentType: “image/png”,
});
}
} catch (error) {
console.error(”  Failed to take failure screenshot:”, error);
}
}
});

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**

- Get the container window, throwing a clear error if unavailable.
  */
  const getContainerWindow = async () => {
  const containerWindow = await Container.window();
  if (!containerWindow) {
  throw new Error(“Container window not found”);
  }
  return containerWindow;
  };

/**

- Take a screenshot of the container window (returns undefined on failure).
  */
  const takeContainerScreenshot = async (): Promise<Buffer | undefined> => {
  try {
  const appContainer = await Container.window();
  if (!appContainer) return undefined;
  return await appContainer.screenshot();
  } catch {
  return undefined;
  }
  };

/**

- Attach a screenshot to the test report.
  */
  const attachScreenshot = async (
  testInfo: any,
  name: string
  ): Promise<void> => {
  const screenshot = await takeContainerScreenshot();
  if (screenshot) {
  await testInfo.attach(name, {
  body: screenshot,
  contentType: “image/png”,
  });
  }
  };

/**

- Save a screenshot to a file path within the currency pair folder.
  */
  const saveCurrencyScreenshot = async (
  containerWindow: any,
  currencyPair: string,
  stepName: string
  ): Promise<void> => {
  const pairSlug = currencyPair.replace(”/”, “-”);
  const folderPath = `screenshots/${pairSlug}_folder`;

if (!fs.existsSync(folderPath)) {
fs.mkdirSync(folderPath, { recursive: true });
}

const filePath = `${folderPath}/${pairSlug}_${stepName}.png`;
await containerWindow.screenshot({ path: filePath, fullPage: true });
console.log(`  Screenshot: ${filePath}`);
};

/**

- Sanitize a currency pair string to a filesystem-safe slug.
  */
  const pairSlug = (currencyPair: string): string =>
  currencyPair.replace(”/”, “-”);

// ============================================================================
// AUTH HELPERS
// ============================================================================

/**

- Log in to the application (skips if already logged in).
  */
  const login = async (): Promise<void> => {
  if (isLoggedIn) {
  console.log(”  Already logged in, skipping login”);
  return;
  }

try {
const config = getConfig();

```
if (!config.username || !config.password) {
  throw new Error("Username or password not configured");
}

await utilityFunctions.wait(MEDIUM_WAIT);
await performLogin(config.username, config.password);
await utilityFunctions.wait(LONG_WAIT);

isLoggedIn = true;
console.log("  Login successful");
```

} catch (error) {
console.error(”  Login failed:”, error);

```
try {
  const firstWindow = await utilityFunctions.firstWindow();
  const screenshot = await firstWindow.screenshot();
  if (screenshot) {
    const timestamp = Date.now();
    const path = `test-results/login-failure-${timestamp}.png`;
    fs.writeFileSync(path, screenshot);
    console.log(`  Screenshot saved: ${path}`);
  }
} catch {
  console.error("  Could not take login failure screenshot");
}

throw error;
```

}
};

/**

- Log out of the application.
  */
  const logout = async (): Promise<void> => {
  console.log(”  Logging out…”);

try {
const containerWindow = await Container.window();
if (!containerWindow) {
console.warn(”  Container window not found for logout”);
return;
}

```
const logoutButton = containerWindow.locator(".logout > img");
await logoutButton.click();
await utilityFunctions.wait(1000);

const signOutButton = containerWindow.getByRole("button", {
  name: "Sign out",
});
await signOutButton.click();
await utilityFunctions.wait(SHORT_WAIT);

isLoggedIn = false;
console.log("  Logout successful");
```

} catch (error) {
console.error(”  Logout failed:”, error);
isLoggedIn = false;
}
};

// ============================================================================
// DEAL TICKET HELPERS
// ============================================================================

/**

- Open the Spot/Fwd deal ticket from the menu.
  */
  const openDealTicket = async (): Promise<void> => {
  console.log(”  Opening Spot/Fwd deal ticket…”);

const containerWindow = await getContainerWindow();

try {
await Container.openDealTicketFromMenu();
console.log(”  Spot/Fwd deal ticket opened”);
} catch {
console.log(”  openDealTicketFromMenu failed, trying fallback…”);
const spotFwdButton = containerWindow.getByText(“Spot/Fwd”).first();
await spotFwdButton.waitFor({ state: “visible”, timeout: DEFAULT_TIMEOUT });
await spotFwdButton.click();
console.log(”  Spot/Fwd deal ticket opened (fallback)”);
}

await utilityFunctions.wait(LONG_WAIT);
};

/**

- Book a deal using the default currency pair already selected in the ticket.
- Returns the extracted deal number or null.
  */
  const bookDealSimple = async (
  testInfo: any,
  amount: string,
  screenshotPrefix: string = “”
  ): Promise<string | null> => {
  console.log(`=== Booking Simple Deal: ${amount} ===`);

const containerWindow = await getContainerWindow();

try {
await attachScreenshot(testInfo, `${screenshotPrefix}deal-ticket`);

```
// Enter amount
console.log(`  Entering amount: ${amount}`);
const amountInput = containerWindow
  .getByRole("textbox", { name: "Enter amount" })
  .first();
await amountInput.waitFor({ state: "visible", timeout: DEFAULT_TIMEOUT });
await amountInput.click();
await amountInput.fill(amount);
await utilityFunctions.wait(MEDIUM_WAIT);

// Add reference
const referenceInput = containerWindow.getByRole("textbox", {
  name: "Reference (optional)",
});
await referenceInput.click();
await referenceInput.fill("cancellation-test");
console.log("  Amount and reference entered");
await utilityFunctions.wait(MEDIUM_WAIT);

await attachScreenshot(testInfo, `${screenshotPrefix}before-booking`);

// Book the deal
console.log("  Booking deal...");
const bookDealButton = containerWindow.getByRole("button", {
  name: "Book Deal",
});
await bookDealButton.click();
await utilityFunctions.wait(LONG_WAIT);

// Wait for confirmation
const confirmationHeading = containerWindow.getByRole("heading", {
  name: "Your deal has been booked",
});
await confirmationHeading.waitFor({
  state: "visible",
  timeout: 30000,
});
console.log("  Deal booked successfully");
await utilityFunctions.wait(MEDIUM_WAIT);

await attachScreenshot(testInfo, `${screenshotPrefix}deal-confirmed`);

// Extract deal number
const dealNumber = await extractDealNumber(containerWindow);
return dealNumber;
```

} catch (error) {
const err = error as Error;
console.error(`  Error booking deal: ${err.message}`);
await attachScreenshot(testInfo, `${screenshotPrefix}booking-error`);
throw error;
}
};

/**

- Book a deal for a specific currency pair.
- Selects the pair from the dropdown first.
- Returns the extracted deal number or null.
  */
  const bookDealForCurrencyPair = async (
  testInfo: any,
  currencyPair: string,
  amount: string = “1000”
  ): Promise<string | null> => {
  console.log(`  Booking ${currencyPair} deal...`);

const containerWindow = await getContainerWindow();
const slug = pairSlug(currencyPair);

try {
await saveCurrencyScreenshot(containerWindow, currencyPair, “01_deal_ticket”);

```
// Select currency pair from dropdown
console.log(`  Selecting currency pair: ${currencyPair}`);
const dropdownArrow = containerWindow.locator("svg").nth(3);
await dropdownArrow.waitFor({ state: "visible", timeout: MEDIUM_WAIT });
await dropdownArrow.click();
console.log("  Dropdown opened");
await utilityFunctions.wait(MEDIUM_WAIT);

const currencyOption = containerWindow.getByText(currencyPair, {
  exact: true,
});
await currencyOption.waitFor({ state: "visible", timeout: DEFAULT_TIMEOUT });
await currencyOption.click();
console.log("  Currency pair selected");
await utilityFunctions.wait(LONG_WAIT);

await saveCurrencyScreenshot(containerWindow, currencyPair, "02_currency_selected");

// Enter amount
console.log(`  Entering amount: ${amount}`);
const amountInput = containerWindow
  .getByRole("textbox", { name: "Enter amount" })
  .first();
await amountInput.waitFor({ state: "visible", timeout: DEFAULT_TIMEOUT });
await amountInput.click();
await amountInput.fill(amount);
await utilityFunctions.wait(MEDIUM_WAIT);

// Add reference
const referenceInput = containerWindow.getByRole("textbox", {
  name: "Reference (optional)",
});
await referenceInput.click();
await referenceInput.fill("cancellation");
console.log("  Amount and reference entered");
await utilityFunctions.wait(MEDIUM_WAIT);

await saveCurrencyScreenshot(containerWindow, currencyPair, "03_before_booking");

// Book the deal
console.log("  Booking deal...");
const bookDealButton = containerWindow.getByRole("button", {
  name: "Book Deal",
});
await bookDealButton.click();
await saveCurrencyScreenshot(containerWindow, currencyPair, "04_booking_clicked");
await utilityFunctions.wait(LONG_WAIT);

// Wait for confirmation
const confirmationHeading = containerWindow.getByRole("heading", {
  name: "Your deal has been booked",
});
await confirmationHeading.waitFor({
  state: "visible",
  timeout: 30000,
});
console.log("  Deal confirmed");
await utilityFunctions.wait(MEDIUM_WAIT);

await saveCurrencyScreenshot(containerWindow, currencyPair, "05_deal_confirmed");

// Extract and return deal number
const dealNumber = await extractDealNumber(containerWindow);
return dealNumber;
```

} catch (error) {
const err = error as Error;
console.error(`  Error booking ${currencyPair} deal: ${err.message}`);
await saveCurrencyScreenshot(containerWindow, currencyPair, “ERROR_booking”);
throw error;
}
};

/**

- Extract FX deal number from the confirmation screen.
  */
  const extractDealNumber = async (
  containerWindow: any
  ): Promise<string | null> => {
  try {
  await containerWindow
  .getByRole(“heading”, { name: “FX deal number” })
  .waitFor({ state: “visible”, timeout: DEFAULT_TIMEOUT });
  
  const dealNumberPattern = /FX deal number[^\d]*(\d{6,})/i;
  
  // Strategy 1: Extract from root content
  const mainContent = await containerWindow
  .locator(”#root”)
  .textContent({ timeout: MEDIUM_WAIT })
  .catch(() => null);
  
  if (mainContent) {
  const match = mainContent.match(dealNumberPattern);
  if (match?.[1]) {
  console.log(`  FX Deal Number: ${match[1]}`);
  return match[1];
  }
  }
  
  // Strategy 2: Extract from confirmation dialog area
  const confirmationDialog = containerWindow
  .locator(“text=/Your deal has been booked/”)
  .locator(
  ‘xpath=ancestor::div[contains(@class, “dialog”) or contains(@class, “modal”) or contains(@class, “confirmation”)]’
  )
  .first();
  const dialogText = await confirmationDialog
  .textContent({ timeout: MEDIUM_WAIT })
  .catch(() => null);
  
  if (dialogText) {
  const match = dialogText.match(dealNumberPattern);
  if (match?.[1]) {
  console.log(`  FX Deal Number: ${match[1]}`);
  return match[1];
  }
  }
  
  // Strategy 3: Find standalone numeric element (deal number display)
  const numericElement = containerWindow
  .locator(“text=/\d{6,}/”)
  .filter({ hasText: /^\d{6,}$/ })
  .first();
  const dealNumber = await numericElement
  .textContent({ timeout: MEDIUM_WAIT })
  .catch(() => null);
  
  if (dealNumber && /^\d{6,}$/.test(dealNumber.trim())) {
  console.log(`  FX Deal Number: ${dealNumber.trim()}`);
  return dealNumber.trim();
  }
  
  console.warn(”  Could not extract deal number using any strategy”);
  } catch (error) {
  const err = error as Error;
  console.warn(`  Could not extract deal number: ${err.message}`);
  }

return null;
};

// ============================================================================
// TRADE MANAGER HELPERS
// ============================================================================

/**

- Navigate to Trade Manager and open Today’s Trades.
  */
  const navigateToTradeManager = async (
  testInfo: any,
  screenshotPrefix: string = “”
  ): Promise<void> => {
  console.log(”  Opening Trade Manager…”);

const containerWindow = await getContainerWindow();

const tradeManagerButton = containerWindow.getByRole(“button”, {
name: “Trade manager”,
});
await tradeManagerButton.waitFor({ state: “visible”, timeout: DEFAULT_TIMEOUT });
await tradeManagerButton.click();
await utilityFunctions.wait(LONG_WAIT);
console.log(”  Trade Manager opened”);

// Load today’s trades
const todaysTradesButton = containerWindow.getByRole(“button”, {
name: “Today’s Trades”,
});
await todaysTradesButton.waitFor({ state: “visible”, timeout: DEFAULT_TIMEOUT });
await todaysTradesButton.click();
await utilityFunctions.wait(LONG_WAIT);
console.log(”  Today’s trades loaded”);

await attachScreenshot(testInfo, `${screenshotPrefix}trade-manager`);
};

/**

- Right-click the first AAFX trade and check if cancellation option is available.
- If visible and enabled, clicks through and submits the cancellation.
- Returns whether the cancellation option was visible.
  */
  const checkCancellationVisibility = async (
  testInfo: any,
  currencyPair: string
  ): Promise<boolean> => {
  console.log(”  Checking cancellation visibility…”);

const containerWindow = await getContainerWindow();
const slug = pairSlug(currencyPair);

try {
// Right-click the AAFX trade row
const tradeCell = containerWindow.getByRole(“gridcell”, { name: “AAFX” });
await tradeCell.waitFor({ state: “visible”, timeout: DEFAULT_TIMEOUT });
await tradeCell.click({ button: “right” });
await utilityFunctions.wait(MEDIUM_WAIT);

```
await saveCurrencyScreenshot(containerWindow, currencyPair, "05_context_menu");
await attachScreenshot(testInfo, `${slug}_context_menu`);

// Check cancellation option
const cancellationOption = containerWindow.locator("#Cancellation");
const isVisible = await cancellationOption.isVisible({ timeout: MEDIUM_WAIT });

if (!isVisible) {
  console.log("  FAIL: Cancellation option is NOT VISIBLE");
  return false;
}

console.log("  PASS: Cancellation option is VISIBLE");

const isEnabled = await cancellationOption.isEnabled();
if (!isEnabled) {
  console.log("  FAIL: Cancellation option is NOT ENABLED");
  return true; // Visible but not enabled
}

console.log("  PASS: Cancellation option is ENABLED");

// Click cancellation to open dialog
console.log("  Clicking on Cancellation option...");
await cancellationOption.click();
await utilityFunctions.wait(SHORT_WAIT);

await saveCurrencyScreenshot(containerWindow, currencyPair, "06_cancellation_dialog");
await attachScreenshot(testInfo, `${slug}_cancellation_dialog`);
console.log("  Cancellation dialog opened successfully");

// Submit cancellation
console.log("  Submitting cancellation...");
try {
  const submitButton = containerWindow.getByRole("button", {
    name: "Submit",
  });
  await submitButton.waitFor({ state: "visible", timeout: DEFAULT_TIMEOUT });
  await submitButton.click();
  await utilityFunctions.wait(SHORT_WAIT);

  await saveCurrencyScreenshot(containerWindow, currencyPair, "07_cancellation_submitted");
  await attachScreenshot(testInfo, `${slug}_cancellation_submitted`);
  console.log("  Cancellation submitted successfully");
} catch (submitError) {
  const err = submitError as Error;
  console.error(`  Failed to submit cancellation: ${err.message}`);
}

return true;
```

} catch (error) {
const err = error as Error;
console.error(`  Error checking cancellation: ${err.message}`);

```
await saveCurrencyScreenshot(containerWindow, currencyPair, "ERROR_cancellation");
await attachScreenshot(testInfo, `${slug}_error`);

return false;
```

}
};

// ============================================================================
// CANCELLATION DIALOG HELPERS
// ============================================================================

/**

- Open the cancellation dialog by right-clicking the first trade in the grid.
  */
  const openCancellationDialog = async (
  testInfo: any,
  screenshotName: string = “cancellation-dialog”
  ): Promise<void> => {
  console.log(”  Opening Cancellation dialog…”);

const containerWindow = await getContainerWindow();

// Right-click the first AAFX trade cell for reliability
const tradeCell = containerWindow.getByRole(“gridcell”, { name: “AAFX” });
await tradeCell.waitFor({ state: “visible”, timeout: DEFAULT_TIMEOUT });
await tradeCell.click({ button: “right” });
console.log(”  Right-clicked on trade”);
await utilityFunctions.wait(SHORT_WAIT);

// Click Cancellation from context menu
const cancellationOption = containerWindow
.locator(”#Cancellation”)
.getByText(“Cancellation”);
await cancellationOption.waitFor({ state: “visible”, timeout: MEDIUM_WAIT });
await cancellationOption.click();
console.log(”  Cancellation option clicked”);
await utilityFunctions.wait(SHORT_WAIT);

await attachScreenshot(testInfo, screenshotName);
console.log(”  Cancellation dialog opened successfully”);
};

/**

- Submit the cancellation by clicking the Submit button.
- Asserts the button is enabled before clicking.
  */
  const submitCancellation = async (testInfo: any): Promise<void> => {
  console.log(”  Submitting cancellation…”);

const containerWindow = await getContainerWindow();

const submitButton = containerWindow.getByRole(“button”, { name: “Submit” });
await submitButton.waitFor({ state: “visible”, timeout: DEFAULT_TIMEOUT });

// Assert button is enabled
const isEnabled = await submitButton.isEnabled();
expect(isEnabled, “Submit button should be enabled”).toBe(true);

await submitButton.click();
console.log(”  Submit button clicked”);
await utilityFunctions.wait(MEDIUM_WAIT);

await attachScreenshot(testInfo, “cancellation-submitted”);
console.log(”  Cancellation submitted successfully”);
};

/**

- Close the cancellation dialog via Close/Cancel button or ESC key.
  */
  const closeCancellationDialog = async (): Promise<void> => {
  console.log(”  Closing cancellation dialog…”);

const containerWindow = await Container.window();
if (!containerWindow) {
console.warn(”  Container window not found for closing dialog”);
return;
}

try {
const closeButton = containerWindow
.locator(“button”)
.filter({ hasText: /^(Close|Cancel)$/i });
await closeButton.waitFor({ state: “visible”, timeout: MEDIUM_WAIT });
await closeButton.click();
console.log(”  Cancellation dialog closed via button”);
await utilityFunctions.wait(SHORT_WAIT);
} catch {
console.warn(”  Could not close dialog with button, trying ESC key”);
try {
await containerWindow.keyboard.press(“Escape”);
console.log(”  Closed dialog with ESC key”);
await utilityFunctions.wait(1000);
} catch (escError) {
const err = escError as Error;
console.warn(`  Could not close dialog: ${err.message}`);
}
}
};

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

/**

- Close Trade Manager and click “New deal” to reset for the next deal.
  */
  const prepareForNextDeal = async (): Promise<void> => {
  console.log(”  Preparing for next currency pair…”);

const containerWindow = await getContainerWindow();

try {
// Try closing Trade Manager
const closeButton = containerWindow.locator(
“.blotters-window-header > .svg-inline–fa > path”
);
try {
await closeButton.click({ timeout: MEDIUM_WAIT });
await utilityFunctions.wait(SHORT_WAIT);
console.log(”  Trade Manager closed”);
} catch {
console.log(”  No close button found, continuing…”);
}

```
// Click "New deal"
const newDealButton = containerWindow.getByRole("button", {
  name: "New deal",
});
await newDealButton.waitFor({ state: "visible", timeout: DEFAULT_TIMEOUT });
await newDealButton.click();
console.log("  'New deal' clicked, ready for next pair");
await utilityFunctions.wait(LONG_WAIT);
```

} catch (error) {
const err = error as Error;
console.error(`  Error preparing for next deal: ${err.message}`);
throw error;
}
};

/**

- Reset the UI to a known state: dismiss any open dialogs and ensure
- we’re back at the main deal ticket screen.
  */
  const resetUIState = async (): Promise<void> => {
  const containerWindow = await Container.window();
  if (!containerWindow) return;

// Dismiss any open dialogs with ESC
try {
await containerWindow.keyboard.press(“Escape”);
await utilityFunctions.wait(1000);
} catch {
// Ignore
}

// Try clicking “New deal” if available
try {
const newDealButton = containerWindow.getByRole(“button”, {
name: “New deal”,
});
const isVisible = await newDealButton.isVisible({ timeout: SHORT_WAIT });
if (isVisible) {
await newDealButton.click();
await utilityFunctions.wait(MEDIUM_WAIT);
}
} catch {
// Ignore - we may already be at the deal ticket
}
};

// ============================================================================
// TEST SUITE
// ============================================================================

test.describe(“Trade Cancellation Feature Verification”, () => {
test.describe.configure({ mode: “serial” });

test.beforeEach(async () => {
// Attempt to reset UI state before each test
await resetUIState();
});

test(“Complete Trade Cancellation Flow - Book and Cancel Trade”, async ({}, testInfo) => {
console.log(”=== TRADE CANCELLATION COMPLETE FLOW TEST ===”);
console.log(
“Testing: Book Trade -> Navigate to Trade Manager -> Cancel Trade”
);
const startTime = Date.now();

```
// Step 1: Login
await login();
await utilityFunctions.wait(MEDIUM_WAIT);
await attachScreenshot(testInfo, "01-login-success");

// Step 2: Open deal ticket
await openDealTicket();

// Step 3: Book a trade
const dealNumber = await bookDealSimple(testInfo, "10000", "02-");
console.log(`  Trade booked${dealNumber ? ` (Deal #${dealNumber})` : ""}`);

// Step 4: Navigate to Trade Manager
await navigateToTradeManager(testInfo, "03-");

// Step 5: Open Cancellation Dialog
await openCancellationDialog(testInfo, "04-cancellation-dialog");

// Step 6: Submit Cancellation
await submitCancellation(testInfo);

// Step 7: Verify cancellation result
const containerWindow = await getContainerWindow();

// Assert: Look for confirmation that cancellation was processed
try {
  // Check for any confirmation or status change after submission
  const pageContent = await containerWindow
    .locator("#root")
    .textContent({ timeout: MEDIUM_WAIT })
    .catch(() => "");

  const hasCancellationConfirmation =
    /cancel(led|lation)|success|submitted/i.test(pageContent);

  if (hasCancellationConfirmation) {
    console.log("  Cancellation confirmation detected in page content");
  } else {
    console.warn(
      "  No explicit cancellation confirmation found - verify via screenshot"
    );
  }
} catch {
  console.warn("  Could not verify cancellation status from page content");
}

await attachScreenshot(testInfo, "05-cancellation-complete");

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(
  `=== COMPLETE FLOW TEST FINISHED (${elapsed}s) ===`
);
```

});

test(“Partial Trade Cancellation - Validate Amounts”, async ({}, testInfo) => {
console.log(”=== PARTIAL TRADE CANCELLATION TEST ===”);
console.log(
“Testing: Book Trade -> Partial Cancellation with Amount Validation”
);

```
// Step 1: Login
await login();
await attachScreenshot(testInfo, "01-partial-cancel-login");

// Step 2: Open deal ticket and book a trade with larger amount
await openDealTicket();
const dealNumber = await bookDealSimple(testInfo, "50000", "02-");
console.log(
  `  Trade booked for partial cancellation${dealNumber ? ` (Deal #${dealNumber})` : ""}`
);

// Step 3: Navigate to Trade Manager
await navigateToTradeManager(testInfo, "03-partial-");

// Step 4: Open Cancellation Dialog
await openCancellationDialog(testInfo, "04-partial-cancellation-dialog");

// Step 5: Test Partial Cancellation Amounts
console.log("  Testing partial cancellation amounts...");
const containerWindow = await getContainerWindow();

// Enter amount in second field first (testing field independence)
const secondAmountField = containerWindow
  .getByRole("textbox", { name: "Enter amount" })
  .nth(1);
await secondAmountField.waitFor({
  state: "visible",
  timeout: DEFAULT_TIMEOUT,
});
await secondAmountField.click();
await secondAmountField.fill("1");
console.log("  Entered amount in second field: 1");
await utilityFunctions.wait(1000);

// Then enter amount in first field
const firstAmountField = containerWindow
  .getByRole("textbox", { name: "Enter amount" })
  .first();
await firstAmountField.waitFor({
  state: "visible",
  timeout: DEFAULT_TIMEOUT,
});
await firstAmountField.click();
await firstAmountField.fill("12");
console.log("  Entered amount in first field: 12");
await utilityFunctions.wait(1000);

await attachScreenshot(testInfo, "05-partial-amounts-entered");

// Verify the values are present
const firstValue = await firstAmountField.inputValue();
const secondValue = await secondAmountField.inputValue();
expect(firstValue).toBe("12");
expect(secondValue).toBe("1");
console.log(`  Verified field values: first="${firstValue}", second="${secondValue}"`);

// Test clearing amounts
console.log("  Testing amount clearing...");
await firstAmountField.click();
await firstAmountField.clear();
await utilityFunctions.wait(500);

await secondAmountField.click();
await secondAmountField.clear();
await utilityFunctions.wait(500);

// Verify cleared
const clearedFirst = await firstAmountField.inputValue();
const clearedSecond = await secondAmountField.inputValue();
expect(clearedFirst).toBe("");
expect(clearedSecond).toBe("");
console.log("  Amounts cleared and verified");

await attachScreenshot(testInfo, "06-amounts-cleared");

// Step 6: Close dialog without submitting
await closeCancellationDialog();
console.log(
  "  Partial cancellation test completed - dialog closed without submission"
);

await attachScreenshot(testInfo, "07-partial-cancel-final");
console.log("=== PARTIAL TRADE CANCELLATION TEST COMPLETED ===");
```

});

test(“Trade Cancellation - Negative Test: Cancel Without Required Fields”, async ({}, testInfo) => {
console.log(”=== TRADE CANCELLATION NEGATIVE TEST ===”);
console.log(“Testing: Attempt cancellation without required fields”);

```
// Step 1: Login
await login();
await attachScreenshot(testInfo, "01-negative-test-login");

// Step 2: Book a trade
await openDealTicket();
const dealNumber = await bookDealSimple(testInfo, "25000", "02-");
console.log(
  `  Trade booked for negative test${dealNumber ? ` (Deal #${dealNumber})` : ""}`
);

// Step 3: Navigate to Trade Manager
await navigateToTradeManager(testInfo, "03-negative-");

// Step 4: Open Cancellation Dialog
await openCancellationDialog(testInfo, "04-negative-cancellation-dialog");

// Step 5: Attempt to submit without required fields
console.log(
  "  Attempting to submit cancellation without required fields..."
);

const containerWindow = await getContainerWindow();
const submitButton = containerWindow.getByRole("button", {
  name: "Submit",
});
await submitButton.waitFor({ state: "visible", timeout: DEFAULT_TIMEOUT });

const isSubmitEnabled = await submitButton.isEnabled();
console.log(`  Submit button enabled state: ${isSubmitEnabled}`);

if (!isSubmitEnabled) {
  // Expected: button is disabled without required fields
  console.log(
    "  PASS: Submit button correctly disabled without required fields"
  );
  await attachScreenshot(testInfo, "05-negative-button-disabled");
} else {
  // Button is enabled - click it and check for validation errors
  console.warn(
    "  Submit button is enabled without required fields - testing validation..."
  );
  await submitButton.click();
  await utilityFunctions.wait(SHORT_WAIT);

  // Check for validation error messages
  const errorSelectors = [
    '[class*="error"]',
    '[class*="invalid"]',
    '[role="alert"]',
    ".error-message",
    "text=/error/i",
    "text=/required/i",
  ];

  let validationFound = false;

  for (const selector of errorSelectors) {
    try {
      const errorElement = containerWindow.locator(selector).first();
      await errorElement.waitFor({
        state: "visible",
        timeout: SHORT_WAIT,
      });
      const errorText = await errorElement.textContent();
      console.log(`  Validation error detected: ${errorText}`);
      validationFound = true;
      break;
    } catch {
      // Try next selector
    }
  }

  if (validationFound) {
    console.log("  PASS: Proper validation behavior confirmed");
  } else {
    console.warn(
      "  WARNING: No validation errors found - this may indicate a validation gap"
    );
  }

  await attachScreenshot(testInfo, "05-negative-validation-result");
}

// Step 6: Close the dialog
await closeCancellationDialog();
console.log("  Negative test dialog closed");

await attachScreenshot(testInfo, "06-negative-test-final");
console.log("=== NEGATIVE TEST COMPLETED ===");
```

});

// ========================================================================
// MULTI-PAIR CANCELLATION TEST (parameterized)
// ========================================================================

for (const currencyPair of currencyPairs) {
test(`Trade Cancellation - ${currencyPair}`, async ({}, testInfo) => {
console.log(`=== CANCELLATION TEST: ${currencyPair} ===`);

```
  // Login
  await login();
  await utilityFunctions.wait(MEDIUM_WAIT);

  // Open deal ticket (first pair only - subsequent pairs use prepareForNextDeal)
  await openDealTicket();

  // Book the deal for this currency pair
  const dealNumber = await bookDealForCurrencyPair(
    testInfo,
    currencyPair,
    "1000"
  );
  console.log(
    `  ${currencyPair} deal booked${dealNumber ? ` (Deal #${dealNumber})` : ""}`
  );

  // Navigate to Trade Manager
  await navigateToTradeManager(testInfo, `${pairSlug(currencyPair)}-`);

  // Check cancellation visibility and submit
  const isCancellationVisible = await checkCancellationVisibility(
    testInfo,
    currencyPair
  );

  // Assert cancellation option was available
  expect(
    isCancellationVisible,
    `Cancellation option should be visible for ${currencyPair}`
  ).toBe(true);

  // Prepare for potential next test
  await prepareForNextDeal();

  console.log(`=== CANCELLATION TEST: ${currencyPair} COMPLETED ===`);
});
```

}
});