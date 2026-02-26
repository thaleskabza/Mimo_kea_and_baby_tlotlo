"""
DashboardPage - Page Object for FX Trading Dashboard

Handles:
- Dashboard navigation
- Menu interactions
- Quick stats viewing
"""

from playwright.sync_api import Page
import allure
from .base_page import BasePage


class DashboardPage(BasePage):
    """Page object for FX Trading dashboard."""
    
    # ========================================================================
    # LOCATORS
    # ========================================================================
    
    # FX Web App Widget (NEW - direct approach from codegen)
    FX_WEB_APP_WIDGET = "solar-starlink-widget"
    FX_WEB_APP_BUTTON = "solar-starlink-widget >> button"
    
    # Navigation menu
    DEALS_MENU = "text=Deals"
    ORDERS_MENU = "text=Orders"
    SETTINGS_MENU = "text=Settings"
    TRADE_MANAGER_LINK = "a[href*='trade-manager'], link[name='Trade Manager']"
    
    # Dashboard tiles
    DEAL_TILE = "div[data-testid='deal-tile'], div:has-text('Deal')"
    ORDER_TILE = "div[data-testid='order-tile'], div:has-text('Order')"
    
    # User menu
    USER_MENU = "button[aria-label='User menu'], div[class*='user-menu']"
    LOGOUT_BUTTON = "button:has-text('Logout'), a:has-text('Logout')"
    
    # ========================================================================
    # ACTIONS
    # ========================================================================
    
    @allure.step("Launch FX Web App from widget")
    def launch_fx_web_app(self):
        """Launch FX Web App directly from dashboard widget (NEW preferred method from codegen)."""
        # Wait for the widget to be available
        self.wait_for_selector(self.FX_WEB_APP_WIDGET, state="visible")
        # Click the launch button in the widget - using EXACT filter text from codegen
        widget = self.page.locator(self.FX_WEB_APP_WIDGET).filter(has_text="FX Web App Quick and easy")
        widget.get_by_role("button").click()
        self.wait_for_load_state("networkidle")
    
    @allure.step("Open tenor menu")
    def open_tenor_menu(self):
        """
        Click the tenor menu button to enable tenor selection.
        The label contains dynamic month/year (e.g., 'SP | Spot - 2026/03/').
        Uses filter to find button containing 'SP | Spot' text.
        """
        # Use filter instead of regex in get_by_role
        # Find button with role that contains "SP | Spot"
        tenor_button = self.page.get_by_role("button").filter(has_text="SP | Spot")
        tenor_button.first.click()
        self.page.wait_for_timeout(500)
    
    @allure.step("Navigate to Trade Manager")
    def navigate_to_trade_manager(self):
        """Navigate to Trade Manager page."""
        self.page.get_by_role("link", name="Trade Manager").click()
        self.wait_for_load_state("networkidle")
    
    @allure.step("Navigate to Deals page")
    def navigate_to_deals(self):
        """Navigate to Deals page."""
        # Wait for the deals menu to be available
        self.wait_for_selector(self.DEALS_MENU, state="visible")
        # Scroll into view and click
        self.page.locator(self.DEALS_MENU).scroll_into_view_if_needed()
        self.click(self.DEALS_MENU)
        self.wait_for_load_state("networkidle")
    
    @allure.step("Navigate to Orders page")
    def navigate_to_orders(self):
        """Navigate to Orders page."""
        # Wait for the orders menu to be available
        self.wait_for_selector(self.ORDERS_MENU, state="visible")
        # Scroll into view and click
        self.page.locator(self.ORDERS_MENU).scroll_into_view_if_needed()
        self.click(self.ORDERS_MENU)
        self.wait_for_load_state("networkidle")
    
    @allure.step("Click Deal tile")
    def click_deal_tile(self):
        """Click on Deal tile to create new deal."""
        self.click(self.DEAL_TILE)
        self.wait_for_load_state("networkidle")
    
    @allure.step("Click Order tile")
    def click_order_tile(self):
        """Click on Order tile to create new order."""
        self.click(self.ORDER_TILE)
        self.wait_for_load_state("networkidle")
    
    @allure.step("Logout from dashboard")
    def logout(self):
        """Logout from the application."""
        self.click(self.USER_MENU)
        self.click(self.LOGOUT_BUTTON)
    
    # ========================================================================
    # VALIDATIONS
    # ========================================================================
    
    @allure.step("Verify dashboard is displayed")
    def verify_dashboard_loaded(self):
        """Verify dashboard page is fully loaded."""
        self.assert_visible(self.DEALS_MENU)
        self.assert_visible(self.ORDERS_MENU)
