import { test, expect } from '@playwright/test'

const BASE_URL = 'https://app.proautoma.com' //'http://localhost:3000'

test.beforeEach(async ({ page }) => {
  // Go to http://localhost:3000/console/signin
  await page.goto('/console/signin')
})

test('navigate to signup page', async ({ page }) => {
  // Click text=Remember me
  await page.locator('text=Remember me').click()
  // Click text=Forgot password?
  await page.locator('text=Forgot password?').click()
  await expect(page).toHaveURL('/console/forgot')
  // Go to http://localhost:3000/console/signin
  await page.goto('/console/signin')
  // Click text=Remember me
  await page.locator('text=Remember me').click()
  // Click text=Sign up
  await page.locator('text=Sign up').click()
  await expect(page).toHaveURL('/console/signup')
  // Click text=Sign in
  await page.locator('text=Sign in').click()
  await expect(page).toHaveURL('/console/signin')
})

test('try to login without any data', async ({ page }) => {
  // Click input[name="email"]
  await page.locator('input[name="email"]').click()
  // Click input[name="password"]
  await page.locator('input[name="password"]').click()
  // Click text=Remember me
  await page.locator('text=Remember me').click()
  // Click button:has-text("Sign in")
  await page.locator('button:has-text("Sign in")').click()
})

test('login with wrong password', async ({ page }) => {
  // Click input[name="email"]
  await page.locator('input[name="email"]').click()
  // Fill input[name="email"]
  await page.locator('input[name="email"]').fill('patestuser@proautoma.com')
  // Click input[name="password"]
  await page.locator('input[name="password"]').click()
  // Fill input[name="password"]
  await page.locator('input[name="password"]').fill('helloproautoma')
  // Click button:has-text("Sign in")
  await page.locator('button:has-text("Sign in")').click()
})

test('login with correct credential', async ({ page }) => {
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

test('try google login', async ({ page }) => {
  // Click text=Remember meForgot password?Sign inor continue with >> img
  if (!process.env.baseUrl?.includes('localhost')) return
  await page.locator('#google-signin').click()
  await expect(page).toHaveURL(
    'https://www.proautoma.com/__/auth/handler?apiKey=AIzaSyAqn0-0Bq3yUQaoVm3Yf-XU8dSN3nNUa9g&appName=%5BDEFAULT%5D&authType=signInViaRedirect&redirectUrl=http%3A%2F%2Flocalhost%3A3000%2Fconsole%2Fsignin&v=9.6.7&providerId=google.com&scopes=profile'
  )
  // Go to https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=439355076640-hfq9remm5c7jrtvpkcnifbbnhki5t1od.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fwww.proautoma.com%2F__%2Fauth%2Fhandler&state=AMbdmDmiiKn36sPt1K5xMDQa8Qbkq9Io6iK96kEqwyKD7nFDVzX7q86Fi6NkOVC-oEBSWjwmx40Sfy9EEhq6d9SuIcsXMtObQPQkuLXGk4ul4pGUkXU2vrJg27KFzAtLkkn2aCwRewhtqZQs4YAk6U3UMcU6gxvZNi9Q8CiHIKwyFDmjTMFNCOJjuOuxokyKMo4_rm5Qi8DvE7WQHKGLPfMfhyFGWl2cRAYWi32u7FG1iKZumQrT1C-sgdHTxA2BsiBGyHIWQs7HBrx-v8-IrIXRCDOWwyHHOYnmzZ4vyOyokyACDUa8mzeaLOs&scope=openid%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20profile&context_uri=http%3A%2F%2Flocalhost%3A3000
  await page.goto(
    'https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=439355076640-hfq9remm5c7jrtvpkcnifbbnhki5t1od.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fwww.proautoma.com%2F__%2Fauth%2Fhandler&state=AMbdmDmiiKn36sPt1K5xMDQa8Qbkq9Io6iK96kEqwyKD7nFDVzX7q86Fi6NkOVC-oEBSWjwmx40Sfy9EEhq6d9SuIcsXMtObQPQkuLXGk4ul4pGUkXU2vrJg27KFzAtLkkn2aCwRewhtqZQs4YAk6U3UMcU6gxvZNi9Q8CiHIKwyFDmjTMFNCOJjuOuxokyKMo4_rm5Qi8DvE7WQHKGLPfMfhyFGWl2cRAYWi32u7FG1iKZumQrT1C-sgdHTxA2BsiBGyHIWQs7HBrx-v8-IrIXRCDOWwyHHOYnmzZ4vyOyokyACDUa8mzeaLOs&scope=openid%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20profile&context_uri=http%3A%2F%2Flocalhost%3A3000'
  )
  // Go to https://accounts.google.com/o/oauth2/auth/identifier?response_type=code&client_id=439355076640-hfq9remm5c7jrtvpkcnifbbnhki5t1od.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fwww.proautoma.com%2F__%2Fauth%2Fhandler&state=AMbdmDmiiKn36sPt1K5xMDQa8Qbkq9Io6iK96kEqwyKD7nFDVzX7q86Fi6NkOVC-oEBSWjwmx40Sfy9EEhq6d9SuIcsXMtObQPQkuLXGk4ul4pGUkXU2vrJg27KFzAtLkkn2aCwRewhtqZQs4YAk6U3UMcU6gxvZNi9Q8CiHIKwyFDmjTMFNCOJjuOuxokyKMo4_rm5Qi8DvE7WQHKGLPfMfhyFGWl2cRAYWi32u7FG1iKZumQrT1C-sgdHTxA2BsiBGyHIWQs7HBrx-v8-IrIXRCDOWwyHHOYnmzZ4vyOyokyACDUa8mzeaLOs&scope=openid%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20profile&context_uri=http%3A%2F%2Flocalhost%3A3000&flowName=GeneralOAuthFlow
  await page.goto(
    'https://accounts.google.com/o/oauth2/auth/identifier?response_type=code&client_id=439355076640-hfq9remm5c7jrtvpkcnifbbnhki5t1od.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fwww.proautoma.com%2F__%2Fauth%2Fhandler&state=AMbdmDmiiKn36sPt1K5xMDQa8Qbkq9Io6iK96kEqwyKD7nFDVzX7q86Fi6NkOVC-oEBSWjwmx40Sfy9EEhq6d9SuIcsXMtObQPQkuLXGk4ul4pGUkXU2vrJg27KFzAtLkkn2aCwRewhtqZQs4YAk6U3UMcU6gxvZNi9Q8CiHIKwyFDmjTMFNCOJjuOuxokyKMo4_rm5Qi8DvE7WQHKGLPfMfhyFGWl2cRAYWi32u7FG1iKZumQrT1C-sgdHTxA2BsiBGyHIWQs7HBrx-v8-IrIXRCDOWwyHHOYnmzZ4vyOyokyACDUa8mzeaLOs&scope=openid%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20profile&context_uri=http%3A%2F%2Flocalhost%3A3000&flowName=GeneralOAuthFlow'
  )
})
