import { test, expect } from '@playwright/test'
test('test', async ({ page }) => {
  // Go to /
  await page.goto('/')
  // Go to /console/signin
  await page.goto('/console/signin')
  // Click input[name="email"]
  await page.locator('input[name="email"]').click()
  // Fill input[name="email"]
  await page.locator('input[name="email"]').fill('patestuser@proautoma.com')
  // Press Tab
  await page.locator('input[name="email"]').press('Tab')
  // Fill input[name="password"]
  await page.locator('input[name="password"]').fill('helloproautoma123')
  // Press Enter
  await page.locator('input[name="password"]').press('Enter')
  await expect(page).toHaveURL('/console/monitors')
  // Click text=Activity
  await page.locator('text=Activity').click()
  await expect(page).toHaveURL('/console/activity')
  // Click text=Environments
  await page.locator('text=Environments').click()
  await expect(page).toHaveURL('/console/envs')
  // Click button:has-text("Add environment")
  await page.locator('button:has-text("Add environment")').click()
  await expect(page).toHaveURL('/console/envs/new')
  // Click text=Status Pages
  await page.locator('text=Status Pages').click()
  await expect(page).toHaveURL('/console/status-pages')
  // Click text=Settings
  await page.locator('text=Settings').click()
  await expect(page).toHaveURL('/console/settings/profile')
  // Click text=Security
  await page.locator('text=Security').click()
  await expect(page).toHaveURL('/console/settings/security')
  // Click text=Notifications
  await page.locator('text=Notifications').click()
  await expect(page).toHaveURL('/console/settings/notifications')
  // Click .chakra-radio__control >> nth=0
  await page.locator('.chakra-radio__control').first().click()
  // Select 7
  await page.locator('select[name="alert\\.failCount"]').selectOption('7')
  // Click div[role="group"]:has-text("API Keys")
  await page.locator('div[role="group"]:has-text("API Keys")').click()
  await expect(page).toHaveURL('/console/settings/api-keys')
  // Click div[role="group"]:has-text("Team")
  await page.locator('div[role="group"]:has-text("Team")').click()
  await expect(page).toHaveURL('/console/settings/users')
  // Click button:has-text("Invite User")
  await page.locator('button:has-text("Invite User")').click()
  // Select viewer
  await page.locator('select[name="role"]').selectOption('viewer')
  // Click [aria-label="Close"]
  await page.locator('[aria-label="Close"]').click()
  // Click text=Billing & Usage
  await page.locator('text=Billing & Usage').click()
  await expect(page).toHaveURL('/console/settings/billing')
  // Click button:has-text("Switch")
  await page.locator('button:has-text("Switch")').click()
  await expect(page).toHaveURL('/console/settings/billing/plans')
  // Click text=Team
  await page.locator('text=Team').click()
  await expect(page).toHaveURL('/console/settings/users')
  // Click div[role="group"]:has-text("Security")
  await page.locator('div[role="group"]:has-text("Security")').click()
  await expect(page).toHaveURL('/console/settings/security')
  // Click div[role="group"]:has-text("Profile")
  await page.locator('div[role="group"]:has-text("Profile")').click()
  await expect(page).toHaveURL('/console/settings/profile')
  // Click text=Dashboard
  await page.locator('text=Dashboard').click()
  await expect(page).toHaveURL('/console/monitors')
  // Click button:has-text("New monitor")
  await page.locator('button:has-text("New monitor")').click()
  await expect(page).toHaveURL('/console/monitors/newapi')
  // Click text=ActiveSave >> span >> nth=1
  await page.locator('text=ActiveSave >> span').nth(1).click()
  // Click text=PausedSave >> span >> nth=2
  await page.locator('text=PausedSave >> span').nth(2).click()
  // Click div[role="group"]:has-text("Activity")
  await page.locator('div[role="group"]:has-text("Activity")').click()
  await expect(page).toHaveURL('/console/activity')
  // Click button:has-text("PTPA Test Userpatestuser@proautoma.com")
  await page.locator('button:has-text("PTPA Test Userpatestuser@proautoma.com")').click()
  // Click text=Signout
  await page.locator('text=Signout').click()
  await expect(page).toHaveURL('/console/signin')
})
