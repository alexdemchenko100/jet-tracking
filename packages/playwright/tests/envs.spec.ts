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
  // Click div[role="group"]:has-text("Environments")
  await page.locator('div[role="group"]:has-text("Environments")').click()
  await expect(page).toHaveURL('/console/envs')
})

test('create new env and delete it', async ({ page }) => {
  const envName = `Env-${new Date().getTime()}`
  // Click button:has-text("Add environment")
  await page.locator('button:has-text("Add environment")').click()
  await expect(page).toHaveURL('/console/envs/new')

  // Click [placeholder="Add name"]
  await page.locator('[placeholder="Add name"]').click()
  // Fill [placeholder="Name"]
  await page.locator('[placeholder="Add name"]').fill(envName)
  // Click [placeholder="Name"]
  await page.locator('[placeholder="Name"]').click()
  // Fill [placeholder="Name"]
  await page.locator('[placeholder="Name"]').fill('API_KEY')
  // Click [placeholder="Value"]
  await page.locator('[placeholder="Value"]').click()
  // Fill [placeholder="Value"]
  await page.locator('[placeholder="Value"]').fill(new Date().getTime().toString())
  // Click button:has-text("Save")
  await page.locator('button:has-text("Save")').click()
  await expect(page).toHaveURL('http://localhost:3000/console/envs')

  await page.locator('[data-label="' + envName + '"] .env-details-btn').click()
  const url = await page.url()
  await expect(url).toMatch(/\/console\/envs\/[a-zA-Z0-9-_]+/)
  // Click [placeholder="Value"]
  await page.locator('[placeholder="Value"]').click()
  // Fill [placeholder="Value"]
  await page.locator('[placeholder="Value"]').fill(new Date().getTime().toString())
  // Click button:has-text("Save")
  await page.locator('button:has-text("Save")').click()

  // Click div[role="group"]:has-text("Environments")
  await page.locator('div[role="group"]:has-text("Environments")').click()
  await expect(page).toHaveURL('/console/envs')

  // Click button.monitor-delete-btn
  await page.locator('[data-label="' + envName + '"] .env-delete-btn').click()
  // Click button:has-text("Delete")
  await page.locator('button:has-text("Delete")').click()
  await page.goto('/console/envs')

  const elementCount = await page.locator(`text=${envName}`).count()
  await expect(elementCount).toEqual(0)
})
