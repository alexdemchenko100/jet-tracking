// global-setup.ts
import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(`${baseURL}/console/signin`)
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

  // Save signed-in state to 'storageState.json'.
  await page.context().storageState({ path: 'storageState.json' })
  await browser.close()
}

export default globalSetup
