import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/')

    // Check if the main heading is visible
    await expect(page.getByRole('heading', { name: /Build Your Own SaaS/i })).toBeVisible()

    // Check if the sign in button is visible
    await expect(page.getByRole('link', { name: /Sign in/i }).first()).toBeVisible()

    // Check if the get started button is visible
    await expect(page.getByRole('link', { name: /Get started/i }).first()).toBeVisible()
  })

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/')

    // Click the get started button
    await page.getByRole('link', { name: /Get started/i }).first().click()

    // Check if we're on the signup page
    await expect(page.getByRole('heading', { name: /Create an account/i })).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')

    // Click the sign in button
    await page.getByRole('link', { name: /Sign in/i }).first().click()

    // Check if we're on the login page
    await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible()
  })
})

test.describe('Authentication Pages', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login')

    // Check for email and password inputs
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible()
  })

  test('should display signup form', async ({ page }) => {
    await page.goto('/signup')

    // Check for all required inputs
    await expect(page.getByLabel(/Display Name/i)).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
    await expect(page.getByLabel(/Confirm Password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Create account/i })).toBeVisible()
  })
})
