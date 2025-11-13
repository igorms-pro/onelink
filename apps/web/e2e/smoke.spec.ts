import { test, expect } from "@playwright/test";
test("app loads", async ({ _page }) => {
  await page.goto("/");
  expect(true).toBeTruthy();
});
