import { test, expect } from '@playwright/test'

test('test', async ({ page }) => {
  // Go to http://localhost:3000/
  await page.goto('http://localhost:3000/')
  // Go to http://localhost:3000/console/signin
  await page.goto('http://localhost:3000/console/signin')
  // Click input[name="email"]
  await page.locator('input[name="email"]').click()
  // Fill input[name="email"]
  await page.locator('input[name="email"]').fill('patestuser@proautoma.com')
  // Press Tab
  await page.locator('input[name="email"]').press('Tab')
  // Fill input[name="password"]
  await page.locator('input[name="password"]').fill('helloproautoma123')
  // Click input[name="password"]
  await page.locator('input[name="password"]').click()
  // Click button:has-text("Sign in")
  await page.locator('button:has-text("Sign in")').click()
  await expect(page).toHaveURL('http://localhost:3000/console/monitors')
  // Click text=Activity
  await page.locator('text=Activity').click()
  await expect(page).toHaveURL('http://localhost:3000/console/activity')
  // Click text=Environments
  await page.locator('text=Environments').click()
  await expect(page).toHaveURL('http://localhost:3000/console/envs')
  // Click text=No environments.
  await page.locator('text=No environments.').click()
  // Click text=Status Pages
  await page.locator('text=Status Pages').click()
  await expect(page).toHaveURL('http://localhost:3000/console/status-pages')
  // Click .css-n0javg
  await page.locator('.css-n0javg').click()
  // Click text=Settings
  await page.locator('text=Settings').click()
  await expect(page).toHaveURL('http://localhost:3000/console/settings/profile')
  // Click text=Security
  await page.locator('text=Security').click()
  await expect(page).toHaveURL('http://localhost:3000/console/settings/security')
  // Click text=Notifications
  await page.locator('text=Notifications').click()
  await expect(page).toHaveURL('http://localhost:3000/console/settings/notifications')
  // Click text=A monitor is failing for
  await page.locator('text=A monitor is failing for').click()
  // Click text=A monitor fails for
  await page.locator('text=A monitor fails for').click()
  // Select 2
  await page.locator('select[name="alert\\.failCount"]').selectOption('2')
  // Select 1
  await page.locator('select[name="alert\\.failCount"]').selectOption('1')
  // Click button:has-text("New notification")
  await page.locator('button:has-text("New notification")').click()
  // Click #menu-button-24
  await page.locator('#menu-button-24').click()
  // Click button[role="menuitem"]:has-text("Email")
  await page.locator('button[role="menuitem"]:has-text("Email")').click()
  // Select patestuser@proautoma.com
  await page
    .locator('select[name="new_notification\\.channel\\.email"]')
    .selectOption('patestuser@proautoma.com')
  // Click section[role="dialog"] button:has-text("Cancel")
  await page.locator('section[role="dialog"] button:has-text("Cancel")').click()
  // Click text=API Keys
  await page.locator('text=API Keys').click()
  await expect(page).toHaveURL('http://localhost:3000/console/settings/api-keys')
  // Click div[role="group"]:has-text("Team")
  await page.locator('div[role="group"]:has-text("Team")').click()
  await expect(page).toHaveURL('http://localhost:3000/console/settings/users')
  // Click text=Billing & Usage
  await page.locator('text=Billing & Usage').click()
  await expect(page).toHaveURL('http://localhost:3000/console/settings/billing')
  // Click button:has-text("Add card")
  await page.locator('button:has-text("Add card")').click()
  // Click [aria-label="Close"]
  await page.locator('[aria-label="Close"]').click()
  // Click text=Dashboard
  await page.locator('text=Dashboard').click()
  await expect(page).toHaveURL('http://localhost:3000/console/monitors')
  // Click button:has-text("New Monitor")
  await page.locator('button:has-text("New Monitor")').click()
  await expect(page).toHaveURL('http://localhost:3000/console/monitors/newapi')
  // Click [placeholder="Monitor Name"]
  await page.locator('[placeholder="Monitor Name"]').click()
  // Fill [placeholder="Monitor Name"]
  await page.locator('[placeholder="Monitor Name"]').fill('test')
  // Click [placeholder="https\:\/\/"]
  await page.locator('[placeholder="https\\:\\/\\/"]').click()
  // Fill [placeholder="https\:\/\/"]
  await page.locator('[placeholder="https\\:\\/\\/"]').fill('https://httpbin.org/get')
  // Click button:has-text("Run now")
  await page.locator('button:has-text("Run now")').click()
  // Click text=Headers 7
  await page.locator('text=Headers 7').click()
  // Click text=Tests 1
  await page.locator('text=Tests 1').click()
  // Click button:has-text("Save")
  await page.locator('button:has-text("Save")').click()
  await expect(page).toHaveURL('http://localhost:3000/console/monitors')
  // Click text=test0.000.000.00 >> button >> nth=0
  await page.locator('text=test0.000.000.00 >> button').first().click()
  // Click button:has-text("Delete")
  await page.locator('button:has-text("Delete")').click()
  // Click button:has-text("CDC Dharcdhar300@gmail.com")
  await page.locator('#menu-button-profile-button').click()
  // Click text=Signout
  await page.locator('text=Signout').click()
  await expect(page).toHaveURL('http://localhost:3000/console/signin')
})
