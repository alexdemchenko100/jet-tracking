import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Go to /console/signin
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

test('test', async ({ page }) => {
  // Click button:has-text("New monitor")
  await page.locator('button:has-text("New monitor")').click()
  await expect(page).toHaveURL('/console/monitors/newapi')
  // Click [placeholder="https\:\/\/"]
  await page.locator('[placeholder="https\\:\\/\\/"]').click()
  // Fill [placeholder="https\:\/\/"]
  await page.locator('[placeholder="https\\:\\/\\/"]').fill('{{BASE}}/headers')
  // Click button:has-text("Advanced")
  await page.locator('button:has-text("Advanced")').click()
  // Click text=Env Variables
  await page.locator('text=Env Variables').click()
  // Click button:has-text("Add Env Variable")
  await page.locator('button:has-text("Add Env Variable")').click()
  // Fill input[name="variables\.0\.0"]
  await page.locator('input[name="variables\\.0\\.0"]').fill('BASE')
  // Press Tab
  await page.locator('input[name="variables\\.0\\.0"]').press('Tab')
  // Fill input[name="variables\.0\.1"]
  await page.locator('input[name="variables\\.0\\.1"]').fill('https://httpbin.org')
  // Click button:has-text("Run now")
  await page.locator('button:has-text("Run now")').click()
  await expect(page.locator('text=200 Ok')).toBeVisible()
})
