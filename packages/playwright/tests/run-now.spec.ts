import { test, expect } from '@playwright/test'
import { signIn } from './utils'

test.beforeEach(async ({ page }) => {
  await signIn(page)
})

test('should monitor on demand', async ({ page }) => {
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
