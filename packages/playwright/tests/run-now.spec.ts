import { test, expect } from '@playwright/test'
test('test', async ({ page }) => {
  // Go to /
  await page.goto('/')
  // Go to /console/signin
  await page.goto('/console/signin')
  // Click div[role="group"]:has-text("Email")
  await page.locator('div[role="group"]:has-text("Email")').click()
  // Fill input[name="email"]
  await page.locator('input[name="email"]').fill('patestuser@proautoma.com')
  // Press Tab
  await page.locator('input[name="email"]').press('Tab')
  // Fill input[name="password"]
  await page.locator('input[name="password"]').fill('helloproautoma123')
  // Click button:has-text("Sign in")
  await page.locator('button:has-text("Sign in")').click()
  await expect(page).toHaveURL('/console/monitors')
  // Click button:has-text("New Monitor")
  await page.locator('button:has-text("New Monitor")').click()
  await expect(page).toHaveURL('/console/monitors/newapi')
  // Click [placeholder="https\:\/\/"]
  await page.locator('[placeholder="https\\:\\/\\/"]').click()
  // Fill [placeholder="https\:\/\/"]
  await page.locator('[placeholder="https\\:\\/\\/"]').fill('https://www.proautoma.com')
  // Click button:has-text("Run now")
  await page.locator('button:has-text("Run now")').click()

  await page.locator('#tab-results [role=tab]:has-text("Headers")').click()
  await page.locator('#tab-results [role=tab]:has-text("Tests")').click()
  await page.locator('#tab-results [role=tab]:has-text("Body")').click()

  await page.locator('button#close-panel').click()
})
