// trade-cancellation.spec.ts
import { test, expect } from "../fixtures/video";
import {
  Container,
  utilityFunctions,
  performLogin,
} from "../aafx-ui/dealTicket_functions";
import { getConfig } from "../setup/config";
import { ElectronHelper } from "../setup/electron-helper";
import { ApiHelper } from "../setup/api-helper";
import * as fs from "fs";
import * as path from "path";

// =====================================================================================
// CONFIG
// =====================================================================================
const SCREENSHOTS_DIR = "screenshots";
const RESULTS_DIR = "test-results";

const DEFAULT_TIMEOUT = 30_000;
const LONG_TIMEOUT = 60_000;

let isLoggedIn = false; // If you want strict isolation, set to false in beforeEach instead.

// =====================================================================================
// FS HELPERS
// =====================================================================================
const ensureDir = (dirPath: string) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const ensureDirForFile = (filePath: string) => {
  ensureDir(path.dirname(filePath));
};

const safeName = (name: string) =>
  name.replace(/[^\w\-]+/g, "_").replace(/_+/g, "_");

// =====================================================================================
// SCREENSHOT HELPERS
// =====================================================================================
const takeContainerScreenshot = async (): Promise<Buffer | undefined> => {
  try {
    const appContainer = await Container.window();
    if (!appContainer) return undefined;
    return await appContainer.screenshot();
  } catch {
    return undefined;
  }
};

const attachContainerScreenshot = async (
  testInfo: any,
  name: string
): Promise<void> => {
  const shot = await takeContainerScreenshot();
  if (shot) {
    await testInfo.attach(name, { body: shot, contentType: "image/png" });
  }
};

const saveContainerScreenshotToFile = async (
  filePath: string,
  fullPage: boolean = true
): Promise<void> => {
  const containerWindow = await Container.window();
  if (!containerWindow) return;
  ensureDirForFile(filePath);
  await containerWindow.screenshot({ path: filePath, fullPage });
};

// =====================================================================================
// UI WAITS (REPLACE fixed sleeps)
// =====================================================================================
const waitForAppReady = async () => {
  const win = await Container.window();
  if (!win) throw new Error("Container window not found");

  // Best-effort “app ready”: root exists and something interactive is visible.
  await expect(win.locator("#root")).toBeVisible({ timeout: LONG_TIMEOUT });
};

const waitForDealBooked = async (containerWindow: any) => {
  await expect(
    containerWindow.getByRole("heading", { name: "Your deal has been booked" })
  ).toBeVisible({ timeout: LONG_TIMEOUT });
};

// =====================================================================================
// LOGIN
// =====================================================================================
const login = async (testInfo?: any): Promise<void> => {
  if (isLoggedIn) return;

  const config = getConfig();
  if (!config.username || !config.password) {
    throw new Error("Username or password not configured");
  }

  await waitForAppReady();

  try {
    await performLogin(config.username, config.password);

    // Replace arbitrary waits with a landing-page assertion.
    const containerWindow = await Container.window();
    if (!containerWindow) throw new Error("Container window not found after login");

    // We don’t know your exact landing selector; keep this pragmatic:
    // If your app always shows "New deal" after login, assert that.
    await expect(
      containerWindow.getByRole("button", { name: "New deal" })
    ).toBeVisible({ timeout: LONG_TIMEOUT });

    isLoggedIn = true;

    if (testInfo) await attachContainerScreenshot(testInfo, "login-success");
  } catch (error) {
    // Capture screenshot on login failure
    try {
      const timestamp = Date.now();
      ensureDir(RESULTS_DIR);
      await saveContainerScreenshotToFile(
        `${RESULTS_DIR}/login-failure-${timestamp}.png`,
        true
      );
    } catch {
      // ignore
    }
    throw error;
  }
};

// =====================================================================================
// NAVIGATION
// =====================================================================================
const openSpotFwdDealTicket = async (testInfo: any): Promise<void> => {
  const containerWindow = await Container.window();
  if (!containerWindow) throw new Error("Container window not found");

  await test.step("Open Spot/Fwd deal ticket", async () => {
    try {
      await Container.openDealTicketFromMenu();
    } catch {
      // Fallback if helper fails
      const spotFwdButton = containerWindow.getByText("Spot/Fwd").first();
      await expect(spotFwdButton).toBeVisible({ timeout: LONG_TIMEOUT });
      await spotFwdButton.click();
    }

    // Assert deal ticket is visible (pick something that’s always present)
    const amountInput = containerWindow
      .getByRole("textbox", { name: "Enter amount" })
      .first();
    await expect(amountInput).toBeVisible({ timeout: LONG_TIMEOUT });

    await attachContainerScreenshot(testInfo, "deal-ticket-opened");
  });
};

const navigateToTradeManager = async (testInfo: any): Promise<void> => {
  const containerWindow = await Container.window();
  if (!containerWindow) throw new Error("Container window not found");

  await test.step("Open Trade Manager", async () => {
    const tradeManagerButton = containerWindow.getByRole("button", {
      name: "Trade manager",
    });
    await expect(tradeManagerButton).toBeVisible({ timeout: DEFAULT_TIMEOUT });
    await tradeManagerButton.click();

    // Assert Trade Manager UI is present
    await expect(
      containerWindow.getByRole("button", { name: "Today's Trades" })
    ).toBeVisible({ timeout: LONG_TIMEOUT });

    const todaysTradesButton = containerWindow.getByRole("button", {
      name: "Today's Trades",
    });
    await todaysTradesButton.click();

    // Assert grid/table presence (generic)
    // If your grid uses role="grid", this will be solid.
    const grid = containerWindow.getByRole("grid").first();
    await expect(grid).toBeVisible({ timeout: LONG_TIMEOUT });

    await attachContainerScreenshot(testInfo, "trade-manager-open");
  });
};

const returnToNewDeal = async (testInfo?: any) => {
  const containerWindow = await Container.window();
  if (!containerWindow) throw new Error("Container window not found");

  // Prefer a visible "New deal" button (common in your app).
  const newDealButton = containerWindow.getByRole("button", { name: "New deal" });
  await expect(newDealButton).toBeVisible({ timeout: LONG_TIMEOUT });
  await newDealButton.click();

  // Confirm we’re back to deal ticket / new deal state
  const amountInput = containerWindow
    .getByRole("textbox", { name: "Enter amount" })
    .first();
  await expect(amountInput).toBeVisible({ timeout: LONG_TIMEOUT });

  if (testInfo) await attachContainerScreenshot(testInfo, "ready-for-new-deal");
};

// =====================================================================================
// DEAL BOOKING
// =====================================================================================
const extractDealNumber = async (containerWindow: any): Promise<string | null> => {
  try {
    // Wait for the section header
    await expect(
      containerWindow.getByRole("heading", { name: "FX deal number" })
    ).toBeVisible({ timeout: LONG_TIMEOUT });

    // Try to read relevant nearby text, then regex it
    // Approach: get text from root and parse.
    const rootText = await containerWindow.locator("#root").textContent();
    if (!rootText) return null;

    const dealNumberPattern = /FX deal number[^\d]*(\d{6,})/i;
    const match = rootText.match(dealNumberPattern);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
};

const bookDealSimple = async (
  testInfo: any,
  usdAmount: string,
  reference: string
): Promise<{ dealNumber: string | null; reference: string }> => {
  const containerWindow = await Container.window();
  if (!containerWindow) throw new Error("Container window not found");

  await test.step(`Book deal (amount=${usdAmount}, ref=${reference})`, async () => {
    const amountInput = containerWindow
      .getByRole("textbox", { name: "Enter amount" })
      .first();

    await expect(amountInput).toBeVisible({ timeout: LONG_TIMEOUT });
    await amountInput.click();
    await amountInput.fill(usdAmount);

    const referenceInput = containerWindow.getByRole("textbox", {
      name: "Reference (optional)",
    });
    await expect(referenceInput).toBeVisible({ timeout: DEFAULT_TIMEOUT });
    await referenceInput.click();
    await referenceInput.fill(reference);

    await attachContainerScreenshot(testInfo, "before-booking");

    const bookDealButton = containerWindow.getByRole("button", {
      name: "Book Deal",
    });
    await expect(bookDealButton).toBeVisible({ timeout: DEFAULT_TIMEOUT });
    await expect(bookDealButton).toBeEnabled({ timeout: DEFAULT_TIMEOUT });
    await bookDealButton.click();

    await waitForDealBooked(containerWindow);

    await attachContainerScreenshot(testInfo, "deal-booked-confirmation");
  });

  const dealNumber = await extractDealNumber(containerWindow);
  if (dealNumber) {
    await testInfo.attach("deal-number", {
      body: Buffer.from(dealNumber, "utf-8"),
      contentType: "text/plain",
    });
  }

  return { dealNumber, reference };
};

// =====================================================================================
// TRADE ROW LOCATION (CRITICAL: cancel the trade you just booked)
// =====================================================================================
const findTradeRowByIdentifier = async (
  containerWindow: any,
  identifier: string
) => {
  // Prefer rows: role="row" within a grid/table
  const grid = containerWindow.getByRole("grid").first();
  await expect(grid).toBeVisible({ timeout: LONG_TIMEOUT });

  const row = grid.getByRole("row").filter({ hasText: identifier }).first();
  await expect(row).toBeVisible({ timeout: LONG_TIMEOUT });

  return row;
};

const openContextMenuOnTradeRow = async (row: any) => {
  // Right-click a specific cell within the row; if unknown, use first cell.
  const firstCell = row.getByRole("gridcell").first();
  await expect(firstCell).toBeVisible({ timeout: DEFAULT_TIMEOUT });
  await firstCell.click({ button: "right" });
};

const openCancellationDialogForTrade = async (
  testInfo: any,
  identifier: string
): Promise<void> => {
  const containerWindow = await Container.window();
  if (!containerWindow) throw new Error("Container window not found");

  await test.step(`Open cancellation dialog for trade: ${identifier}`, async () => {
    const row = await findTradeRowByIdentifier(containerWindow, identifier);
    await openContextMenuOnTradeRow(row);

    await attachContainerScreenshot(testInfo, "context-menu-open");

    // Prefer semantic menuitem role if available.
    const cancellationMenuItemCandidates = [
      containerWindow.getByRole("menuitem", { name: "Cancellation" }),
      containerWindow.getByText("Cancellation", { exact: true }),
      containerWindow.locator("#Cancellation"),
    ];

    let clicked = false;
    for (const candidate of cancellationMenuItemCandidates) {
      try {
        await expect(candidate.first()).toBeVisible({ timeout: 5_000 });
        await candidate.first().click();
        clicked = true;
        break;
      } catch {
        // try next
      }
    }

    if (!clicked) throw new Error("Could not find/click Cancellation menu item");

    // Assert the dialog is visible (generic: a heading or dialog role)
    const dialog = containerWindow.getByRole("dialog").first();
    await expect(dialog).toBeVisible({ timeout: LONG_TIMEOUT });

    await attachContainerScreenshot(testInfo, "cancellation-dialog-open");
  });
};

const submitCancellation = async (testInfo: any): Promise<void> => {
  const containerWindow = await Container.window();
  if (!containerWindow) throw new Error("Container window not found");

  await test.step("Submit cancellation", async () => {
    const dialog = containerWindow.getByRole("dialog").first();
    await expect(dialog).toBeVisible({ timeout: LONG_TIMEOUT });

    const submitButton = dialog.getByRole("button", { name: "Submit" });

    await expect(submitButton).toBeVisible({ timeout: DEFAULT_TIMEOUT });
    await expect(submitButton).toBeEnabled({ timeout: DEFAULT_TIMEOUT });

    await attachContainerScreenshot(testInfo, "before-submit-cancellation");
    await submitButton.click();

    // Success condition varies per app. Make this robust:
    // 1) dialog closes OR
    // 2) a success message appears OR
    // 3) submit becomes disabled and/or UI changes
    const successSignals = [
      () => expect(dialog).toBeHidden({ timeout: LONG_TIMEOUT }),
      () =>
        expect(
          containerWindow.locator('[role="alert"]').filter({ hasText: /success|submitted|sent/i }).first()
        ).toBeVisible({ timeout: LONG_TIMEOUT }),
      () => expect(submitButton).toBeDisabled({ timeout: LONG_TIMEOUT }),
    ];

    let success = false;
    for (const signal of successSignals) {
      try {
        await signal();
        success = true;
        break;
      } catch {
        // try next signal
      }
    }

    if (!success) {
      // If none of the success signals fired, fail loudly with screenshot.
      await attachContainerScreenshot(testInfo, "cancellation-submit-unknown-state");
      throw new Error("Cancellation submission did not produce a detectable success state");
    }

    await attachContainerScreenshot(testInfo, "cancellation-submitted");
  });
};

const closeCancellationDialog = async (): Promise<void> => {
  const containerWindow = await Container.window();
  if (!containerWindow) return;

  const dialog = containerWindow.getByRole("dialog").first();
  const isVisible = await dialog.isVisible().catch(() => false);
  if (!isVisible) return;

  const closeButtons = [
    dialog.getByRole("button", { name: "Close" }),
    dialog.getByRole("button", { name: "Cancel" }),
    dialog.getByRole("button", { name: "X" }),
    dialog.locator('button').filter({ hasText: /^(Close|Cancel)$/i }).first(),
  ];

  for (const btn of closeButtons) {
    try {
      if (await btn.isVisible({ timeout: 2000 })) {
        await btn.click();
        await expect(dialog).toBeHidden({ timeout: 10_000 });
        return;
      }
    } catch {
      // continue
    }
  }

  // ESC fallback
  try {
    await containerWindow.keyboard.press("Escape");
    await expect(dialog).toBeHidden({ timeout: 10_000 });
  } catch {
    // ignore
  }
};

// =====================================================================================
// HOOKS
// =====================================================================================
test.beforeAll(async ({ request }) => {
  console.log("=== TRADE CANCELLATION TEST INITIALIZATION ===");

  ensureDir(SCREENSHOTS_DIR);
  ensureDir(RESULTS_DIR);

  try {
    try {
      await ApiHelper.fetchUsers(request); // optional; keep if useful elsewhere
      console.log("✓ Successfully fetched users from API");
    } catch {
      console.warn("⚠ API fetch failed (non-critical)");
    }

    await ElectronHelper.createInstance();
    console.log("✓ Electron instance created successfully");
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
  if (testInfo.status !== testInfo.expectedStatus) {
    await attachContainerScreenshot(testInfo, "failure-screenshot");
  }
});

// =====================================================================================
// TEST SUITE
// =====================================================================================

// If you want the shared login session to be safe, run serial.
// If you want true isolation, remove isLoggedIn optimization and login in beforeEach.
test.describe.serial("Trade Cancellation Feature Verification", () => {
  test("Complete Trade Cancellation Flow - Book and Cancel Trade", async ({}, testInfo) => {
    const reference = `cancellation-test-${Date.now()}`;

    await login(testInfo);
    await openSpotFwdDealTicket(testInfo);

    const { dealNumber } = await bookDealSimple(testInfo, "10000", reference);

    await navigateToTradeManager(testInfo);

    // Prefer dealNumber; fallback to reference if dealNumber extraction failed.
    const identifier = dealNumber ?? reference;

    // Helpful evidence artifacts
    const pairFolder = path.join(SCREENSHOTS_DIR, safeName(identifier));
    ensureDir(pairFolder);

    await saveContainerScreenshotToFile(
      path.join(pairFolder, "01-trade-manager.png"),
      true
    );

    await openCancellationDialogForTrade(testInfo, identifier);
    await submitCancellation(testInfo);

    await saveContainerScreenshotToFile(
      path.join(pairFolder, "02-after-cancellation.png"),
      true
    );

    // Return to a stable state for the next test
    await returnToNewDeal(testInfo);
  });

  test("Partial Trade Cancellation - Validate Amount Fields", async ({}, testInfo) => {
    const reference = `partial-cancel-${Date.now()}`;

    await login(testInfo);
    await openSpotFwdDealTicket(testInfo);

    const { dealNumber } = await bookDealSimple(testInfo, "50000", reference);

    await navigateToTradeManager(testInfo);

    const identifier = dealNumber ?? reference;
    await openCancellationDialogForTrade(testInfo, identifier);

    const containerWindow = await Container.window();
    if (!containerWindow) throw new Error("Container window not found");

    await test.step("Validate amount entry and clearing", async () => {
      const dialog = containerWindow.getByRole("dialog").first();
      await expect(dialog).toBeVisible({ timeout: LONG_TIMEOUT });

      const amountFields = dialog.getByRole("textbox", { name: "Enter amount" });

      const firstAmountField = amountFields.first();
      const secondAmountField = amountFields.nth(1);

      await expect(firstAmountField).toBeVisible({ timeout: DEFAULT_TIMEOUT });
      await expect(secondAmountField).toBeVisible({ timeout: DEFAULT_TIMEOUT });

      // Enter amount in second first
      await secondAmountField.click();
      await secondAmountField.fill("1");

      // Then first
      await firstAmountField.click();
      await firstAmountField.fill("12");

      await attachContainerScreenshot(testInfo, "partial-amounts-entered");

      // Clear both
      await firstAmountField.click();
      await firstAmountField.fill("");
      await secondAmountField.click();
      await secondAmountField.fill("");

      await attachContainerScreenshot(testInfo, "partial-amounts-cleared");

      // Assert cleared
      await expect(firstAmountField).toHaveValue("", { timeout: DEFAULT_TIMEOUT });
      await expect(secondAmountField).toHaveValue("", { timeout: DEFAULT_TIMEOUT });
    });

    await closeCancellationDialog();
    await attachContainerScreenshot(testInfo, "partial-dialog-closed");

    await returnToNewDeal(testInfo);
  });

  test("Trade Cancellation - Negative: Submit Without Required Fields", async ({}, testInfo) => {
    const reference = `negative-cancel-${Date.now()}`;

    await login(testInfo);
    await openSpotFwdDealTicket(testInfo);

    const { dealNumber } = await bookDealSimple(testInfo, "25000", reference);

    await navigateToTradeManager(testInfo);

    const identifier = dealNumber ?? reference;
    await openCancellationDialogForTrade(testInfo, identifier);

    const containerWindow = await Container.window();
    if (!containerWindow) throw new Error("Container window not found");

    await test.step("Attempt submit with empty required fields and assert validation", async () => {
      const dialog = containerWindow.getByRole("dialog").first();
      await expect(dialog).toBeVisible({ timeout: LONG_TIMEOUT });

      const submitButton = dialog.getByRole("button", { name: "Submit" });
      await expect(submitButton).toBeVisible({ timeout: DEFAULT_TIMEOUT });

      const enabled = await submitButton.isEnabled();
      await attachContainerScreenshot(testInfo, "negative-before-submit");

      if (!enabled) {
        // Expected: disabled until required fields provided
        await expect(submitButton).toBeDisabled({ timeout: DEFAULT_TIMEOUT });
        await attachContainerScreenshot(testInfo, "negative-submit-disabled");
        return;
      }

      // If enabled, click and assert a validation message OR field error appears.
      await submitButton.click();

      const validationCandidates = [
        dialog.locator('[class*="error"]').first(),
        dialog.locator('[class*="invalid"]').first(),
        dialog.getByRole("alert").first(),
        dialog.getByText(/required|error|invalid/i).first(),
      ];

      let validationFound = false;
      for (const candidate of validationCandidates) {
        try {
          await expect(candidate).toBeVisible({ timeout: 10_000 });
          validationFound = true;
          break;
        } catch {
          // try next
        }
      }

      if (!validationFound) {
        await attachContainerScreenshot(testInfo, "negative-no-validation-found");
        throw new Error(
          "Submit was enabled with missing required fields, but no validation feedback was detected"
        );
      }

      await attachContainerScreenshot(testInfo, "negative-validation-visible");
    });

    await closeCancellationDialog();
    await returnToNewDeal(testInfo);
  });
});