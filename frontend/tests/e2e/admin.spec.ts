/**
 * Admin Pages E2E Tests
 * Tests admin user and tenant management pages
 */

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Admin Users Page', () => {
  test('should display access denied for non-admin users', async ({ page }) => {
    await page.goto('/admin/users')

    // Without authentication, should show access denied
    const accessDenied = page.getByText(/access denied/i)
    const noPermission = page.getByText(/permission/i)

    await expect(accessDenied.or(noPermission)).toBeVisible()
  })

  test('admin users page accessibility', async ({ page }) => {
    await page.goto('/admin/users')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
})

test.describe('Admin Tenants Page', () => {
  test('should display access denied for non-admin users', async ({ page }) => {
    await page.goto('/admin/tenants')

    // Without authentication, should show access denied
    const accessDenied = page.getByText(/access denied/i)
    const noPermission = page.getByText(/permission/i)
    const superAdmin = page.getByText(/super admin/i)

    await expect(accessDenied.or(noPermission).or(superAdmin)).toBeVisible()
  })

  test('admin tenants page accessibility', async ({ page }) => {
    await page.goto('/admin/tenants')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
})

// Note: Full admin functionality tests would require:
// 1. A test user with admin role
// 2. Test tenant data in the database
// 3. API mocking or a running backend
//
// These tests would be added when the full auth flow is implemented:
//
// test.describe('Admin with Authentication', () => {
//   test.beforeEach(async ({ page }) => {
//     // Login as admin user
//     await page.goto('/login')
//     await page.fill('[name="email"]', 'admin@test.com')
//     await page.fill('[name="password"]', 'testpassword')
//     await page.click('button[type="submit"]')
//     await page.waitForURL('/')
//   })
//
//   test('should display user table', async ({ page }) => {
//     await page.goto('/admin/users')
//     await expect(page.getByRole('table')).toBeVisible()
//   })
//
//   test('should open create user modal', async ({ page }) => {
//     await page.goto('/admin/users')
//     await page.click('button:has-text("Add User")')
//     await expect(page.getByRole('dialog')).toBeVisible()
//   })
// })
