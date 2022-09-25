import { test, expect } from '@playwright/test'
import { signIn } from './utils'

test.beforeEach(async ({ page }) => {
  await signIn(page)
})

test('create new env and delete it', async ({ page }) => {
  const envName = `Env-${Math.random().toString().slice(2, 9)}`

  // Click div[role="group"]:has-text("Environments")
  await page.locator('div[role="group"]:has-text("Environments")').click()
  await expect(page).toHaveURL('/console/envs')

  // Click button:has-text("Add environment")
  await page.locator('button:has-text("Add environment")').click()
  await expect(page).toHaveURL('/console/envs/new')

  // Fill [placeholder="Name"]
  await page.locator('[placeholder="Add name"]').fill(envName)
  // Fill [placeholder="Name"]
  await page.locator('[placeholder="Name"]').fill('API_KEY')
  // Fill [placeholder="Value"]
  await page.locator('[placeholder="Value"]').fill(Math.random().toString().slice(2, 9))
  // Click button:has-text("Save")
  await page.locator('button:has-text("Save")').click()

  await page.waitForSelector('[data-label="' + envName + '"] .env-details-btn')
  await page.locator('[data-label="' + envName + '"] .env-details-btn').click()
  await expect(page).toHaveURL(/\/console\/envs\/[a-zA-Z0-9-_]+/)
  // Fill [placeholder="Value"]
  await page.locator('[placeholder="Value"]').fill(Math.random().toString().slice(2, 9))
  // Click button:has-text("Save")
  await page.locator('button:has-text("Save")').click()

  //Twice to dismiss any of Toast messages that are hanging around
  await page.locator('div[role="group"]:has-text("Environments")').click()
  await page.locator('div[role="group"]:has-text("Environments")').click()

  await expect(page).toHaveURL('/console/envs')
  await expect(page).toHaveURL('/console/envs')

  await page.waitForSelector('[data-label="' + envName + '"] .env-delete-btn')
  // Click button.monitor-delete-btn
  await page.locator('[data-label="' + envName + '"] .env-delete-btn').click()
  // Click button:has-text("Delete")
  await page.locator('button:has-text("Delete")').click()
  await page.goto('/console/envs')

  const elementCount = await page.locator(`text=${envName}`).count()
  expect(elementCount).toEqual(0)
})
