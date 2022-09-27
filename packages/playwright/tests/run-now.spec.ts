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
  await expect(page.locator('#monitor-result #result-url')).not.toHaveText('unknown')
  await expect(page.locator('#monitor-result #result-code')).not.toHaveText('0')
  await expect(page.locator('#monitor-result #response-time')).not.toHaveText('Response Time: 0ms')

  await page.locator('button#close-panel').click()
})

test('should monitor with global env', async ({ page }) => {
  await expect(page).toHaveURL('/console/monitors')

  await page.locator('div[role="group"]:has-text("Environments")').click()
  await expect(page).toHaveURL('/console/envs')

  const baseEleCount = await page.locator('[data-name="BASE"]').count()
  if (baseEleCount === 0) {
    await page.locator('button:has-text("Add variable")').click()
    // Fill [placeholder="Name"]
    await page.locator('.global-env [placeholder="Name"]').last().fill('BASE')
    // Fill [placeholder="Value"]
    await page.locator('.global-env [placeholder="Value"]').last().fill('https://www.proautoma.com')
    // Click button:has-text("Save")
    await page.locator('button:has-text("Save")').click()
  }

  await page.locator('div[role="group"]:has-text("Dashboard")').click()
  await expect(page).toHaveURL('/console/monitors')

  // Click button:has-text("New Monitor")
  await page.locator('button:has-text("New Monitor")').click()
  await expect(page).toHaveURL('/console/monitors/newapi')
  // Click [placeholder="https\:\/\/"]
  await page.locator('[placeholder="https\\:\\/\\/"]').click()
  // Fill [placeholder="https\:\/\/"]
  await page.locator('[placeholder="https\\:\\/\\/"]').fill('{{BASE}}')
  // Click button:has-text("Run now")
  await page.locator('button:has-text("Run now")').click()

  await page.locator('#tab-results [role=tab]:has-text("Headers")').click()
  await page.locator('#tab-results [role=tab]:has-text("Tests")').click()
  await page.locator('#tab-results [role=tab]:has-text("Body")').click()
  await expect(page.locator('#monitor-result #result-url')).not.toHaveText('unknown')
  await expect(page.locator('#monitor-result #result-code')).not.toHaveText('0')
  await expect(page.locator('#monitor-result #response-time')).not.toHaveText('Response Time: 0ms')

  await page.locator('button#close-panel').click()

  await page.locator('div[role="group"]:has-text("Environments")').click()
  await expect(page).toHaveURL('/console/envs')
  await page.locator(`[data-name="BASE"] .global-env-remove-btn`).last().click()
  // Click button:has-text("Save")
  await page.locator('button:has-text("Save")').click()
})
