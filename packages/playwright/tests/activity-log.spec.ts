import { test, expect } from '@playwright/test'
import { signIn } from './utils'

test.beforeEach(async ({ page }) => {
  await signIn(page)
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
