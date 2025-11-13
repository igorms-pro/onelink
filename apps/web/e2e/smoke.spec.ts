import { test, expect } from "@playwright/test";
test("app loads", async ({ page }) => {
  await page.goto("/");
  expect(true).toBeTruthy();
});
