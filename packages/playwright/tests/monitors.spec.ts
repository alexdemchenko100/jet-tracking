import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Go to http://localhost:3000/console/signin
  await page.goto('/console/signin')
  // Click input[name="email"]
  await page.locator('input[name="email"]').click()
  // Fill input[name="email"]
  await page.locator('input[name="email"]').fill('patestuser@proautoma.com')
  // Click input[name="password"]
  await page.locator('input[name="password"]').click()
  // Fill input[name="password"]
  await page.locator('input[name="password"]').fill('helloproautoma123')
  // Click button:has-text("Sign in")
  await page.locator('button:has-text("Sign in")').click()
  await expect(page).toHaveURL('/console/monitors')
})

test('create new monitor', async ({ page }) => {
  // Click button:has-text("New Monitor")
  await page.locator('button:has-text("New Monitor")').click()
  await expect(page).toHaveURL('/console/monitors/newapi')
  // Click [placeholder="Monitor Name"]
  await page.locator('[placeholder="Monitor Name"]').click()
  // Fill [placeholder="Monitor Name"]
  await page.locator('[placeholder="Monitor Name"]').fill('Test')
  // Click [placeholder="https\:\/\/"]
  await page.locator('[placeholder="https\\:\\/\\/"]').click()
  // Fill [placeholder="https\:\/\/"]
  await page.locator('[placeholder="https\\:\\/\\/"]').fill('https://google.com')
  // Click button:has-text("Save")
  await page.locator('button:has-text("Save")').click()
  await expect(page).toHaveURL('/console/monitors')
})

test('delete monitor', async ({ page }) => {
  // Click div[role="group"]:has-text("Dashboard")
  await page.locator('div[role="group"]:has-text("Dashboard")').click()
  await expect(page).toHaveURL('/console/monitors')
  // Click button.monitor-delete-btn
  await page.locator('.listview button.monitor-delete-btn').first().click()
  // Click button:has-text("Delete")
  await page.locator('button:has-text("Delete")').click()
})
