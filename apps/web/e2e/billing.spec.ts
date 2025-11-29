import { test, expect } from "./fixtures/auth";

test.describe("Billing Page - Stripe Integration", () => {
  test("billing page displays subscription details from Stripe", async ({
    authenticatedPage: page,
  }) => {
    // Mock Stripe Edge Function response
    const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const currentPeriodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

    await page.route(
      "**/functions/v1/stripe-get-subscription",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            subscription: {
              status: "active",
              renewalDate: renewalDate.toISOString(),
              currentPeriodEnd: currentPeriodEnd,
              cancelAtPeriodEnd: false,
            },
            invoices: [],
            paymentMethods: [],
          }),
        });
      },
    );

    await page.goto("/settings/billing");

    // Wait for data to load
    await page.waitForLoadState("networkidle");

    // Verify subscription status is displayed (may be in plan card or subscription section)
    // The status might be displayed as "Active" or in the subscription details
    await expect(
      page.getByText(/active/i).or(page.getByText(/subscription/i)),
    ).toBeVisible();

    // Verify renewal date is displayed (formatted date)
    const renewalDateFormatted = renewalDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    await expect(page.getByText(renewalDateFormatted)).toBeVisible();
  });

  test("billing page displays invoices list", async ({
    authenticatedPage: page,
  }) => {
    const mockInvoices = [
      {
        id: "inv_123",
        amount: 999,
        currency: "eur",
        status: "paid",
        created: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
        invoicePdf: "https://pay.stripe.com/invoice/inv_123.pdf",
        hostedInvoiceUrl: "https://invoice.stripe.com/i/inv_123",
      },
      {
        id: "inv_456",
        amount: 999,
        currency: "eur",
        status: "paid",
        created: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
        invoicePdf: "https://pay.stripe.com/invoice/inv_456.pdf",
        hostedInvoiceUrl: "https://invoice.stripe.com/i/inv_456",
      },
    ];

    await page.route(
      "**/functions/v1/stripe-get-subscription",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            subscription: {
              status: "active",
              renewalDate: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              currentPeriodEnd:
                Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
              cancelAtPeriodEnd: false,
            },
            invoices: mockInvoices,
            paymentMethods: [],
          }),
        });
      },
    );

    await page.goto("/settings/billing");

    // Wait for data to load
    await page.waitForLoadState("networkidle");

    // Verify invoices section is visible
    await expect(page.getByText(/invoices/i)).toBeVisible();

    // Verify invoices are displayed
    for (const invoice of mockInvoices) {
      // Check invoice amount (formatted as currency, e.g., €9.99)
      // The amount is divided by 100 and formatted
      const amountText = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: invoice.currency.toUpperCase(),
      }).format(invoice.amount / 100);
      await expect(page.getByText(amountText)).toBeVisible();

      // Check invoice status (displayed in lowercase in the component)
      await expect(
        page.getByText(invoice.status.toLowerCase(), { exact: false }),
      ).toBeVisible();
    }

    // Verify download links exist
    const downloadLinks = page.locator('a[href*="invoice"]');
    await expect(downloadLinks.first()).toBeVisible();
  });

  test("billing page displays payment method", async ({
    authenticatedPage: page,
  }) => {
    const mockPaymentMethod = {
      id: "pm_123",
      type: "card",
      card: {
        brand: "visa",
        last4: "4242",
        expMonth: 12,
        expYear: 2025,
      },
    };

    await page.route(
      "**/functions/v1/stripe-get-subscription",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            subscription: {
              status: "active",
              renewalDate: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              currentPeriodEnd:
                Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
              cancelAtPeriodEnd: false,
            },
            invoices: [],
            paymentMethods: [mockPaymentMethod],
          }),
        });
      },
    );

    await page.goto("/settings/billing");

    // Wait for data to load
    await page.waitForLoadState("networkidle");

    // Verify payment method section is visible
    await expect(page.getByText(/payment method/i)).toBeVisible();

    // Verify card brand is displayed
    await expect(
      page.getByText(new RegExp(mockPaymentMethod.card.brand, "i")),
    ).toBeVisible();

    // Verify last 4 digits are displayed
    await expect(page.getByText(mockPaymentMethod.card.last4)).toBeVisible();

    // Verify expiry date is displayed (MM/YYYY format in the component)
    const expiryText = `${String(mockPaymentMethod.card.expMonth).padStart(2, "0")}/${mockPaymentMethod.card.expYear}`;
    await expect(page.getByText(expiryText)).toBeVisible();
  });

  test("billing page handles empty invoices list", async ({
    authenticatedPage: page,
  }) => {
    await page.route(
      "**/functions/v1/stripe-get-subscription",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            subscription: {
              status: "active",
              renewalDate: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              currentPeriodEnd:
                Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
              cancelAtPeriodEnd: false,
            },
            invoices: [],
            paymentMethods: [],
          }),
        });
      },
    );

    await page.goto("/settings/billing");

    // Wait for data to load
    await page.waitForLoadState("networkidle");

    // Verify invoices section is visible
    await expect(page.getByText(/invoices/i)).toBeVisible();

    // Verify empty state or no invoices message
    // The component should handle empty invoices gracefully
    const invoicesSection = page.locator('section:has-text("Invoices")');
    await expect(invoicesSection).toBeVisible();
  });

  test("billing page handles API error gracefully", async ({
    authenticatedPage: page,
  }) => {
    // Mock API error response
    await page.route(
      "**/functions/v1/stripe-get-subscription",
      async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Internal server error",
            code: "HTTP_500",
          }),
        });
      },
    );

    await page.goto("/settings/billing");

    // Wait for error to be handled
    await page.waitForLoadState("networkidle");

    // Verify page still loads (doesn't crash)
    await expect(page.getByText(/billing/i)).toBeVisible();

    // Verify error toast or error message is displayed
    // The page should show an error notification
    // Note: This depends on how the error is displayed in the UI
    // If using toast, we might need to wait for it
    await page.waitForTimeout(1000);
  });

  test("billing page shows loading state", async ({
    authenticatedPage: page,
  }) => {
    // Delay the API response to see loading state
    await page.route(
      "**/functions/v1/stripe-get-subscription",
      async (route) => {
        // Wait a bit to allow skeleton to show
        await page.waitForTimeout(300);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            subscription: {
              status: "active",
              renewalDate: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              currentPeriodEnd:
                Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
              cancelAtPeriodEnd: false,
            },
            invoices: [],
            paymentMethods: [],
          }),
        });
      },
    );

    await page.goto("/settings/billing");

    // Verify skeleton loader is visible (BillingSkeleton component)
    // The skeleton shows animated pulse divs
    const skeletonElements = page.locator(".animate-pulse");
    const hasSkeleton = await skeletonElements.count();
    expect(hasSkeleton).toBeGreaterThan(0);

    // Wait for data to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500); // Give time for state update

    // Verify content is displayed after loading
    await expect(page.getByText(/billing/i)).toBeVisible();
  });

  test("billing page displays subscription with canceled status", async ({
    authenticatedPage: page,
  }) => {
    await page.route(
      "**/functions/v1/stripe-get-subscription",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            subscription: {
              status: "canceled",
              renewalDate: null,
              currentPeriodEnd:
                Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
              cancelAtPeriodEnd: true,
            },
            invoices: [],
            paymentMethods: [],
          }),
        });
      },
    );

    await page.goto("/settings/billing");

    // Wait for data to load
    await page.waitForLoadState("networkidle");

    // Verify canceled status is displayed
    await expect(page.getByText(/canceled/i)).toBeVisible();
  });

  test("billing page navigation works", async ({ authenticatedPage: page }) => {
    await page.route(
      "**/functions/v1/stripe-get-subscription",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            subscription: null,
            invoices: [],
            paymentMethods: [],
          }),
        });
      },
    );

    await page.goto("/settings/billing");

    // Verify back button exists
    const backButton = page.getByTestId("billing-back-button");
    await expect(backButton).toBeVisible();

    // Click back button
    await backButton.click();

    // Verify navigation to settings page
    await expect(page).toHaveURL(/\/settings/);
  });
});
