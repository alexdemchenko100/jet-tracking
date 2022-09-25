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

test('activity page should list created/deleted monitors', async ({ page }) => {
  const monitorName = `Test-${Math.random().toString().slice(2, 9)}`

  // Click div[role="group"]:has-text("Dashboard")
  await page.locator('div[role="group"]:has-text("Dashboard")').click()
  await expect(page).toHaveURL('/console/monitors')

  // Click button:has-text("New Monitor")
  await page.locator('button:has-text("New Monitor")').click()
  await expect(page).toHaveURL('/console/monitors/newapi')
  // Click [placeholder="Monitor Name"]
  await page.locator('[placeholder="Monitor Name"]').click()
  // Fill [placeholder="Monitor Name"]
  await page.locator('[placeholder="Monitor Name"]').fill(monitorName)
  // Click [placeholder="https\:\/\/"]
  await page.locator('[placeholder="https\\:\\/\\/"]').click()
  // Fill [placeholder="https\:\/\/"]
  await page
    .locator('[placeholder="https\\:\\/\\/"]')
    .fill('https://jsonplaceholder.typicode.com/todos/1')
  // Click button:has-text("Save")
  await page.locator('button:has-text("Save")').click()
  await expect(page).toHaveURL('/console/monitors')

  await page.locator('div[role="group"]:has-text("Activity")').click()
  await expect(page).toHaveURL('/console/activity')

  await page.waitForSelector(`.activity-title`)
  const elementCount = await page
    .locator(`.activity-title:has-text("Monitor ${monitorName} is created.")`)
    .count()
  await expect(elementCount).toBe(1)

  // Click div[role="group"]:has-text("Dashboard")
  await page.locator('div[role="group"]:has-text("Dashboard")').click()
  await expect(page).toHaveURL('/console/monitors')

  // Click monitor in listview and move to the monitor details page
  await page.locator('#set-list-view-btn').click()

  // Click button.monitor-delete-btn
  await page
    .locator('.listview [data-label="' + monitorName + '"] button.monitor-delete-btn')
    .click()
  // Click button:has-text("Delete")
  await page.locator('button:has-text("Delete")').click()

  await page.locator('div[role="group"]:has-text("Activity")').click()
  await expect(page).toHaveURL('/console/activity')

  await page.waitForSelector(`.activity-title`)
  const elementCount2 = await page
    .locator(`.activity-title:has-text("Monitor ${monitorName} is removed.")`)
    .count()
  await expect(elementCount2).toBe(1)
})
