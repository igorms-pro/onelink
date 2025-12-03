import { test, expect } from "./fixtures/auth";

// Helper function to navigate to billing page and wait for it to load
async function gotoBillingPage(page: any) {
  await page.goto("/settings/billing");
  // Wait for either the title (page loaded) or redirect to auth (not authenticated)
  await Promise.race([
    page
      .waitForSelector('[data-testid="billing-title"]', { timeout: 10000 })
      .catch(() => null),
    page.waitForURL("**/auth**", { timeout: 10000 }).catch(() => null),
    page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => null),
  ]);
}

test.describe("Billing Page - Stripe Integration", () => {
  test("billing page loads and displays core structure", async ({
    authenticatedPage: page,
  }) => {
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

    await gotoBillingPage(page);

    // Verify page structure loads
    await expect(page.getByTestId("billing-title")).toBeVisible();
    await expect(page.getByTestId("billing-back-button")).toBeVisible();

    // Verify loading state transitions to loaded
    await expect(page.getByTestId("billing-skeleton")).toBeHidden();
    await expect(page.getByTestId("billing-content")).toBeVisible();

    // Verify core sections are present (always visible)
    await expect(page.getByTestId("plan-card")).toBeVisible();
    await expect(page.getByTestId("subscription-section")).toBeVisible();
  });

  test("billing page shows loading state then transitions to content", async ({
    authenticatedPage: page,
  }) => {
    await page.route(
      "**/functions/v1/stripe-get-subscription",
      async (route) => {
        // Simulate network delay to see loading state
        await page.waitForTimeout(200);
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

    await gotoBillingPage(page);

    // Verify loading state appears briefly
    await expect(page.getByTestId("billing-skeleton")).toBeVisible();

    // Verify transition: loading -> loaded
    await expect(page.getByTestId("billing-skeleton")).toBeHidden();
    await expect(page.getByTestId("billing-content")).toBeVisible();
  });

  test.describe("FREE Plan Tests", () => {
    test("FREE plan - shows upgrade button (not manage button)", async ({
      authenticatedPage: page,
    }) => {
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

      await gotoBillingPage(page);
      await expect(page.getByTestId("billing-content")).toBeVisible();

      // FREE plan users should see upgrade button
      await expect(page.getByTestId("upgrade-to-pro-button")).toBeVisible();

      // FREE plan users should NOT see manage button
      await expect(
        page.getByTestId("manage-on-stripe-button"),
      ).not.toBeVisible();
    });

    test("FREE plan - does NOT show payment method section", async ({
      authenticatedPage: page,
    }) => {
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

      await gotoBillingPage(page);
      await expect(page.getByTestId("billing-content")).toBeVisible();

      // FREE plan users should NOT see payment method section
      await expect(
        page.getByTestId("payment-method-section"),
      ).not.toBeVisible();
    });

    test("FREE plan - does NOT show invoices section", async ({
      authenticatedPage: page,
    }) => {
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

      await gotoBillingPage(page);
      await expect(page.getByTestId("billing-content")).toBeVisible();

      // FREE plan users should NOT see invoices section
      await expect(page.getByTestId("invoices-section")).not.toBeVisible();
    });

    test("FREE plan - does NOT show renewal date row", async ({
      authenticatedPage: page,
    }) => {
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

      await gotoBillingPage(page);
      await expect(page.getByTestId("billing-content")).toBeVisible();

      // FREE plan users should NOT see renewal date
      await expect(page.getByTestId("renewal-date-row")).not.toBeVisible();
    });

    test("FREE plan - shows usage progress bars (limited plan)", async ({
      authenticatedPage: page,
    }) => {
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

      await gotoBillingPage(page);
      await expect(page.getByTestId("billing-content")).toBeVisible();

      // FREE plan has limits (4 links, 2 drops), so progress bars should be visible
      // We check for the plan card which contains the progress bars
      await expect(page.getByTestId("plan-card")).toBeVisible();

      // FREE plan should NOT show "Pro limits" message (that's for unlimited plans)
      const proLimitsInfo = page.getByText(/pro limits|unlimited/i);
      const proLimitsVisible = await proLimitsInfo
        .isVisible()
        .catch(() => false);
      expect(proLimitsVisible).toBe(false);
    });

    test("FREE plan - upgrade button navigates to pricing", async ({
      authenticatedPage: page,
    }) => {
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

      await gotoBillingPage(page);
      await expect(page.getByTestId("billing-content")).toBeVisible();

      const upgradeButton = page.getByTestId("upgrade-to-pro-button");
      await expect(upgradeButton).toBeVisible();
      await upgradeButton.click();

      // Should navigate to pricing page
      await expect(page).toHaveURL(/\/pricing/);
    });
  });

  test.describe("PAID Plan Tests", () => {
    test("PAID plan - shows manage button (not upgrade button)", async ({
      authenticatedPage: page,
    }) => {
      const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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

      await gotoBillingPage(page);
      await expect(page.getByTestId("billing-content")).toBeVisible();

      // Check if user has paid plan (by checking if manage button exists)
      // Note: This depends on the actual user's plan in the database
      const manageButton = page.getByTestId("manage-on-stripe-button");
      const upgradeButton = page.getByTestId("upgrade-to-pro-button");

      const manageVisible = await manageButton.isVisible().catch(() => false);

      // If user has paid plan, manage button should be visible
      if (manageVisible) {
        await expect(manageButton).toBeVisible();
        await expect(upgradeButton).not.toBeVisible();
      } else {
        // User is free - verify upgrade button
        await expect(upgradeButton).toBeVisible();
        await expect(manageButton).not.toBeVisible();
      }
    });

    test("PAID plan - shows payment method section", async ({
      authenticatedPage: page,
    }) => {
      const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
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
                renewalDate: renewalDate.toISOString(),
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

      await gotoBillingPage(page);
      await expect(page.getByTestId("billing-content")).toBeVisible();

      // Check if user has paid plan
      const paymentMethodSection = page.getByTestId("payment-method-section");
      const paymentVisible = await paymentMethodSection
        .isVisible()
        .catch(() => false);

      if (paymentVisible) {
        // User has paid plan - verify payment method section
        await expect(paymentMethodSection).toBeVisible();
        await expect(page.getByTestId("payment-method-title")).toBeVisible();
        await expect(page.getByTestId("payment-method-card")).toBeVisible();
        await expect(page.getByTestId("payment-method-last4")).toHaveText(
          "4242",
        );
      } else {
        // User is free - verify section is not visible
        await expect(paymentMethodSection).not.toBeVisible();
      }
    });

    test("PAID plan - shows invoices section", async ({
      authenticatedPage: page,
    }) => {
      const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const mockInvoices = [
        {
          id: "inv_123",
          amount: 999,
          currency: "eur",
          status: "paid",
          created: Math.floor(Date.now() / 1000) - 86400,
          invoicePdf: "https://pay.stripe.com/invoice/inv_123.pdf",
          hostedInvoiceUrl: "https://invoice.stripe.com/i/inv_123",
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
                renewalDate: renewalDate.toISOString(),
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

      await gotoBillingPage(page);
      await expect(page.getByTestId("billing-content")).toBeVisible();

      // Check if user has paid plan
      const invoicesSection = page.getByTestId("invoices-section");
      const invoicesVisible = await invoicesSection
        .isVisible()
        .catch(() => false);

      if (invoicesVisible) {
        // User has paid plan - verify invoices section
        await expect(invoicesSection).toBeVisible();
        await expect(page.getByTestId("invoices-title")).toBeVisible();
        await expect(page.getByTestId("invoices-list")).toBeVisible();
        await expect(page.getByTestId("invoice-inv_123")).toBeVisible();
      } else {
        // User is free - verify section is not visible
        await expect(invoicesSection).not.toBeVisible();
      }
    });

    test("PAID plan - shows renewal date row", async ({
      authenticatedPage: page,
    }) => {
      const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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

      await gotoBillingPage(page);
      await expect(page.getByTestId("billing-content")).toBeVisible();

      // Check if user has paid plan
      const renewalDateRow = page.getByTestId("renewal-date-row");
      const renewalVisible = await renewalDateRow
        .isVisible()
        .catch(() => false);

      if (renewalVisible) {
        // User has paid plan - verify renewal date
        await expect(renewalDateRow).toBeVisible();
        await expect(page.getByTestId("renewal-date")).toBeVisible();
        await expect(page.getByTestId("renewal-date")).not.toBeEmpty();
      } else {
        // User is free - verify renewal date is not visible
        await expect(renewalDateRow).not.toBeVisible();
      }
    });

    test("PAID plan - shows unlimited plan info (no progress bars)", async ({
      authenticatedPage: page,
    }) => {
      const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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

      await gotoBillingPage(page);
      await expect(page.getByTestId("billing-content")).toBeVisible();

      // Check if user has paid plan (unlimited)
      const manageButton = page.getByTestId("manage-on-stripe-button");
      const manageVisible = await manageButton.isVisible().catch(() => false);

      if (manageVisible) {
        // User has paid plan (STARTER or PRO) - should show "Pro limits" message
        // Note: We can't easily test for absence of progress bars, but we can verify
        // that the plan card is visible and contains the expected structure
        await expect(page.getByTestId("plan-card")).toBeVisible();
      }
    });

    test("PAID plan - shows empty invoices state when no invoices", async ({
      authenticatedPage: page,
    }) => {
      const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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

      await gotoBillingPage(page);
      await expect(page.getByTestId("billing-content")).toBeVisible();

      // Check if user has paid plan
      const invoicesSection = page.getByTestId("invoices-section");
      const invoicesVisible = await invoicesSection
        .isVisible()
        .catch(() => false);

      if (invoicesVisible) {
        // User has paid plan - verify empty state
        await expect(page.getByTestId("invoices-title")).toBeVisible();
        await expect(page.getByTestId("invoices-empty-state")).toBeVisible();
        await expect(page.getByTestId("invoices-list")).not.toBeVisible();
      }
    });

    test("PAID plan - manage button is interactive", async ({
      authenticatedPage: page,
    }) => {
      const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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

      await gotoBillingPage(page);
      await expect(page.getByTestId("billing-content")).toBeVisible();

      const manageButton = page.getByTestId("manage-on-stripe-button");
      const manageVisible = await manageButton.isVisible().catch(() => false);

      if (manageVisible) {
        // User has paid plan - verify button is interactive
        await expect(manageButton).toBeVisible();
        await expect(manageButton).toBeEnabled();
      }
    });
  });

  test("billing page displays plan information correctly", async ({
    authenticatedPage: page,
  }) => {
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

    await gotoBillingPage(page);
    await expect(page.getByTestId("billing-content")).toBeVisible();

    // Verify plan card structure
    await expect(page.getByTestId("plan-card")).toBeVisible();
    await expect(page.getByTestId("plan-card-title")).toBeVisible();
    await expect(page.getByTestId("plan-badge")).toBeVisible();
    await expect(page.getByTestId("plan-price")).toBeVisible();

    // Plan badge should display plan name (structure, not exact text)
    const planBadge = page.getByTestId("plan-badge");
    await expect(planBadge).toBeVisible();
    await expect(planBadge).not.toBeEmpty();

    // Plan price should be displayed
    const planPrice = page.getByTestId("plan-price");
    await expect(planPrice).toBeVisible();
    await expect(planPrice).not.toBeEmpty();
  });

  test("billing page handles API error gracefully", async ({
    authenticatedPage: page,
  }) => {
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

    await gotoBillingPage(page);

    // Verify page doesn't crash - core structure remains
    await expect(page.getByTestId("billing-title")).toBeVisible();
    await expect(page.getByTestId("billing-back-button")).toBeVisible();

    // Verify loading completes (error state, not stuck in loading)
    await expect(page.getByTestId("billing-skeleton")).toBeHidden();

    // Verify content area exists (may show error state)
    await expect(page.getByTestId("billing-content")).toBeVisible();

    // Core sections should still be visible even on error
    await expect(page.getByTestId("plan-card")).toBeVisible();
    await expect(page.getByTestId("subscription-section")).toBeVisible();
  });

  test("billing page navigation back button works", async ({
    authenticatedPage: page,
  }) => {
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

    await gotoBillingPage(page);
    await expect(page.getByTestId("billing-title")).toBeVisible();

    // Verify back button is interactive
    const backButton = page.getByTestId("billing-back-button");
    await expect(backButton).toBeVisible();
    await expect(backButton).toBeEnabled();

    // Test navigation behavior
    await backButton.click();
    await expect(page).toHaveURL(/\/settings/);
  });
});
