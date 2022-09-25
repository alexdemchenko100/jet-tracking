import { test, expect } from '@playwright/test'
import { signIn } from './utils'

test.beforeEach(async ({ page }) => {
  await signIn(page)
})

test('create new monitor and delete it', async ({ page }) => {
  // Click div[role="group"]:has-text("Dashboard")
  await page.locator('div[role="group"]:has-text("Dashboard")').click()
  await expect(page).toHaveURL('/console/monitors')

  const monitorName = `Test-${Math.random().toString().slice(2, 9)}`
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

  // Click monitor in gridview and move to the monitor edit page
  await page.locator('#set-grid-view-btn').click()
  await page.locator('.gridview [data-label="' + monitorName + '"] .monitor-edit-btn').click()
  const url = await page.url()
  await expect(url).toMatch(/\/console\/monitors\/[a-z0-9-]+\/edit/)
  // Click button:has-text("Save")

  //this makes sure editor is ready
  await expect(page.locator('button:has-text("Run now")')).toBeEnabled()
  await page.locator('button:has-text("Save")').click()

  await page.waitForSelector('.gridview [data-label="' + monitorName + '"]')
  // Click monitor in gridview and move to the monitor details page
  await page.locator('.gridview [data-label="' + monitorName + '"] .monitor-title').click()
  const url2 = await page.url()
  await expect(url2).toMatch(/\/console\/monitors\/[a-z0-9-]+/)
  // Click div[role="group"]:has-text("Dashboard")
  await page.locator('div[role="group"]:has-text("Dashboard")').click()
  await expect(page).toHaveURL('/console/monitors')

  // Click monitor in listview and move to the monitor details page
  await page.locator('#set-list-view-btn').click()
  await page.locator('.listview [data-label="' + monitorName + '"] .monitor-title').click()
  const url3 = await page.url()
  await expect(url3).toMatch(/\/console\/monitors\/[a-z0-9-]+/)
  // Click div[role="group"]:has-text("Dashboard")
  await page.locator('div[role="group"]:has-text("Dashboard")').click()
  await expect(page).toHaveURL('/console/monitors')

  // test to make sure monitor can be edited by renaming it
  await page.waitForSelector('.listview [data-label="' + monitorName + '"]')
  // Click monitor in listview and move to the monitor edit page
  await page.locator('.listview [data-label="' + monitorName + '"] .monitor-edit-btn').click()
  const url4 = page.url()
  await expect(url4).toMatch(/\/console\/monitors\/[a-z0-9-]+\/edit/)

  //this makes sure editor is ready
  await expect(page.locator('button:has-text("Run now")')).toBeEnabled()

  // Click button:has-text("Save")
  await page.locator('button:has-text("Save")').click()

  await page.waitForSelector('.listview [data-label="' + monitorName + '"]')
  // Click button.monitor-delete-btn
  await page
    .locator('.listview [data-label="' + monitorName + '"] button.monitor-delete-btn')
    .click()
  // Click button:has-text("Delete")
  await page.locator('button:has-text("Delete")').click()
})
