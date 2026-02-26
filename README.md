“””
DashboardPage - Page Object for FX Trading Dashboard

Handles:

- Dashboard navigation
- Menu interactions
- FX Web App widget launching
- Dashboard validation

Note: Tenor menu interactions have been moved to DealPage / RFQPage
where they logically belong.
“””

from playwright.sync_api import Page, Locator
import allure
from .base_page import BasePage

class DashboardPage(BasePage):
“”“Page object for FX Trading dashboard.”””

```
# ========================================================================
# LOCATORS  (properties returning Locator objects — no raw strings)
# ========================================================================

@property
def fx_web_app_widget(self) -> Locator:
    """The solar-starlink web component that hosts the FX Web App launcher."""
    return self.page.locator("solar-starlink-widget")

@property
def fx_web_app_launch_button(self) -> Locator:
    """Launch button inside the FX Web App widget (shadow-DOM safe chaining)."""
    return (
        self.fx_web_app_widget
        .filter(has_text="FX Web App Quick and easy")
        .get_by_role("button")
    )

@property
def deals_menu(self) -> Locator:
    return self.page.get_by_role("link", name="Deals")

@property
def orders_menu(self) -> Locator:
    return self.page.get_by_role("link", name="Orders")

@property
def settings_menu(self) -> Locator:
    return self.page.get_by_role("link", name="Settings")

@property
def trade_manager_link(self) -> Locator:
    return self.page.get_by_role("link", name="Trade Manager")

@property
def deal_tile(self) -> Locator:
    """Primary: test-id; no silent fallback — missing test-id is an app bug."""
    return self.page.get_by_test_id("deal-tile")

@property
def order_tile(self) -> Locator:
    return self.page.get_by_test_id("order-tile")

@property
def user_menu_button(self) -> Locator:
    return self.page.get_by_role("button", name="User menu")

@property
def logout_button(self) -> Locator:
    return self.page.get_by_role("button", name="Logout")

# ========================================================================
# ACTIONS
# ========================================================================

@allure.step("Launch FX Web App from widget")
def launch_fx_web_app(self) -> None:
    """
    Launch FX Web App via the solar-starlink dashboard widget.

    Uses locator chaining instead of the broken `>>` shadow-DOM syntax.
    Waits for the target URL rather than networkidle (unreliable with
    persistent WebSocket connections common in FX trading systems).
    """
    self.fx_web_app_widget.wait_for(state="visible")
    self.fx_web_app_launch_button.click()
    self.page.wait_for_url("**/fx-web-app**")

@allure.step("Navigate to Trade Manager")
def navigate_to_trade_manager(self) -> None:
    """Navigate to the Trade Manager page."""
    self.trade_manager_link.click()
    self.page.wait_for_url("**/trade-manager**")

@allure.step("Navigate to Deals page")
def navigate_to_deals(self) -> None:
    """Navigate to the Deals page."""
    self.deals_menu.click()
    self.page.wait_for_url("**/deals**")

@allure.step("Navigate to Orders page")
def navigate_to_orders(self) -> None:
    """Navigate to the Orders page."""
    self.orders_menu.click()
    self.page.wait_for_url("**/orders**")

@allure.step("Click Deal tile")
def click_deal_tile(self) -> None:
    """Open the new-deal flow from the dashboard tile."""
    self.deal_tile.click()
    # Wait for the deal form/modal to appear rather than networkidle
    self.page.get_by_role("dialog").wait_for(state="visible")

@allure.step("Click Order tile")
def click_order_tile(self) -> None:
    """Open the new-order flow from the dashboard tile."""
    self.order_tile.click()
    self.page.get_by_role("dialog").wait_for(state="visible")

@allure.step("Logout from dashboard")
def logout(self) -> None:
    """Log out of the application via the user menu."""
    self.user_menu_button.click()
    self.logout_button.click()
    # Confirm we land back on the login / unauthenticated page
    self.page.wait_for_url("**/login**")

# ========================================================================
# VALIDATIONS
# ========================================================================

@allure.step("Verify dashboard is displayed")
def verify_dashboard_loaded(self) -> None:
    """
    Confirm the dashboard is fully rendered.

    Checks three independent signals:
      1. Top-level navigation links are present.
      2. The FX Web App widget is visible.
      3. Both action tiles are visible.
    """
    self.deals_menu.wait_for(state="visible")
    self.orders_menu.wait_for(state="visible")
    self.fx_web_app_widget.wait_for(state="visible")
    self.deal_tile.wait_for(state="visible")
    self.order_tile.wait_for(state="visible")
```