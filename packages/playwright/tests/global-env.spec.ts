import { test, expect } from '@playwright/test'
import { signIn } from './utils'

test.beforeEach(async ({ page }) => {
  await signIn(page)
})

test('add, edit and remove global env', async ({ page }) => {
  const value = Math.random().toString().slice(2, 9)
  const key = `API_KEY_${value}`

  // Click div[role="group"]:has-text("Environments")
  await page.locator('div[role="group"]:has-text("Environments")').click()
  await expect(page).toHaveURL('/console/envs')
  await expect(page.locator(`.global-env-title`)).toHaveText('Global Environment')

  await page.locator('button:has-text("Add variable")').click()
  // Fill [placeholder="Name"]
  await page.locator('.global-env [placeholder="Name"]').last().fill(key)
  // Fill [placeholder="Value"]
  await page.locator('.global-env [placeholder="Value"]').last().fill(value)
  // Click button:has-text("Save")
  await page.locator('button:has-text("Save")').click()

  await page.locator('div[role="group"]:has-text("Dashboard")').click()
  await expect(page).toHaveURL('/console/monitors')
  await page.locator('div[role="group"]:has-text("Environment")').click()
  await expect(page).toHaveURL('/console/envs')

  await expect(page.locator('.global-env-key').last()).toHaveValue(key)
  await expect(page.locator('.global-env-value').last()).toHaveValue(value)

  // Edit env test
  const updatedValue = Math.random().toString().slice(2, 9)
  await page.locator('.global-env-value').last().fill(updatedValue)
  // Click button:has-text("Save")
  await page.locator('button:has-text("Save")').click()

  await page.locator('div[role="group"]:has-text("Dashboard")').click()
  await expect(page).toHaveURL('/console/monitors')
  await page.locator('div[role="group"]:has-text("Environment")').click()
  await expect(page).toHaveURL('/console/envs')
  await expect(page.locator('.global-env-value').last()).toHaveValue(updatedValue)

  // Remove env test
  await page.locator('.global-env-remove-btn').last().click()
  // Click button:has-text("Save")
  await page.locator('button:has-text("Save")').click()
  await expect(page.locator('.global-env-key').last()).not.toHaveValue(key)
})
