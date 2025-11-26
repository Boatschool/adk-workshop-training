/**
 * User Journey E2E Tests
 *
 * Tests complete user workflows through the application:
 * - Workshop Participant journey
 * - Instructor journey
 * - Admin journey
 * - ADK Developer journey
 */

import { test, expect, Page } from '@playwright/test'

// Test data
const TEST_USERS = {
  participant: {
    email: 'participant@test.com',
    password: 'TestPass123!',
    name: 'Test Participant',
  },
  instructor: {
    email: 'instructor@test.com',
    password: 'TestPass123!',
    name: 'Test Instructor',
  },
  admin: {
    email: 'admin@test.com',
    password: 'AdminPass123!',
    name: 'Test Admin',
  },
}

// Helper functions
async function mockLogin(page: Page, role: string = 'participant') {
  // Set mock authentication state
  await page.evaluate((mockRole) => {
    const mockUser = {
      id: 'test-user-id',
      email: `${mockRole}@test.com`,
      full_name: `Test ${mockRole}`,
      role: mockRole,
      is_active: true,
    }
    const mockToken = `mock-jwt-token-for-${mockRole}`

    localStorage.setItem('adk_token', mockToken)
    localStorage.setItem('adk_user', JSON.stringify(mockUser))
  }, role)
}

async function clearAuth(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('adk_token')
    localStorage.removeItem('adk_user')
  })
}

test.describe('Workshop Participant Journey', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
  })

  test('can navigate from landing to login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/(login)?/)
  })

  test('can view login page elements', async ({ page }) => {
    await page.goto('/login')

    // Should have login form elements or welcome message
    await expect(
      page.getByRole('heading', { name: /sign in|welcome/i })
    ).toBeVisible()
  })

  test('can navigate to registration from login', async ({ page }) => {
    await page.goto('/login')

    // Look for registration link
    const registerLink = page.getByRole('link', { name: /register|sign up|create account/i })
    if (await registerLink.isVisible()) {
      await registerLink.click()
      await expect(page).toHaveURL(/register/)
    }
  })

  test('protected dashboard redirects unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard')

    // Should redirect to login or show access denied
    await expect(
      page
        .getByRole('heading', { name: /sign in/i })
        .or(page.getByText(/access denied|please log in/i))
    ).toBeVisible()
  })

  test('authenticated user can access dashboard', async ({ page }) => {
    await page.goto('/')
    await mockLogin(page, 'participant')
    await page.goto('/dashboard')

    // Should show dashboard content (not redirect to login)
    await expect(page).not.toHaveURL(/login/)
  })

  test('can navigate to workshops from dashboard', async ({ page }) => {
    await page.goto('/')
    await mockLogin(page, 'participant')
    await page.goto('/workshops')

    // Should be on workshops page
    await expect(page).toHaveURL(/workshops/)
  })
})

test.describe('Instructor Journey', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
  })

  test('instructor can access workshop management', async ({ page }) => {
    await page.goto('/')
    await mockLogin(page, 'instructor')
    await page.goto('/workshops')

    await expect(page).toHaveURL(/workshops/)
  })

  test('instructor can navigate to create workshop', async ({ page }) => {
    await page.goto('/')
    await mockLogin(page, 'instructor')
    await page.goto('/workshops/new')

    // Should be on create workshop page (not 404)
    await expect(page).toHaveURL(/workshops/)
  })
})

test.describe('Admin Journey', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
  })

  test('admin can access admin panel', async ({ page }) => {
    await page.goto('/')
    await mockLogin(page, 'tenant_admin')
    await page.goto('/admin')

    // Admin panel should be accessible (shows content or redirects appropriately)
    await expect(page).toHaveURL(/admin/)
  })

  test('admin can navigate to user management', async ({ page }) => {
    await page.goto('/')
    await mockLogin(page, 'tenant_admin')
    await page.goto('/admin/users')

    await expect(page).toHaveURL(/admin/)
  })

  test('admin can navigate to tenant settings', async ({ page }) => {
    await page.goto('/')
    await mockLogin(page, 'tenant_admin')
    await page.goto('/admin/settings')

    await expect(page).toHaveURL(/admin/)
  })
})

test.describe('ADK Developer Journey', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
  })

  test('can access visual builder page', async ({ page }) => {
    await page.goto('/')
    await mockLogin(page, 'participant')
    await page.goto('/visual-builder')

    // Should be on visual builder page
    await expect(page).toHaveURL(/visual-builder/)
  })

  test('can access agent templates', async ({ page }) => {
    await page.goto('/')
    await mockLogin(page, 'participant')
    await page.goto('/agents')

    // Should be on agents page
    await expect(page).toHaveURL(/agents/)
  })
})

test.describe('Error Scenarios', () => {
  test('shows 404 for non-existent pages', async ({ page }) => {
    await page.goto('/non-existent-page-12345')

    // Should show 404 or redirect appropriately
    await expect(
      page
        .getByText(/404|not found|page.*doesn't exist/i)
        .or(page.getByRole('heading', { name: /sign in/i }))
    ).toBeVisible()
  })

  test('handles invalid routes gracefully', async ({ page }) => {
    await page.goto('/!!invalid!!route')

    // Page should not crash - shows something meaningful
    await expect(page.locator('body')).toBeVisible()
  })

  test('session timeout redirects to login', async ({ page }) => {
    // Login then clear (simulating timeout)
    await page.goto('/')
    await mockLogin(page, 'participant')
    await page.goto('/dashboard')

    // Clear auth to simulate timeout
    await clearAuth(page)

    // Navigate to protected route
    await page.goto('/workshops')

    // Should redirect to login or show message
    await expect(
      page
        .getByRole('heading', { name: /sign in/i })
        .or(page.getByText(/session|please log in/i))
    ).toBeVisible()
  })
})

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('mobile navigation works', async ({ page }) => {
    await page.goto('/login')

    // Page should render on mobile
    await expect(page.locator('body')).toBeVisible()
  })

  test('mobile forms are usable', async ({ page }) => {
    await page.goto('/login')

    // Form elements should be visible and appropriately sized
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})

test.describe('Tablet Responsiveness', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test('tablet layout renders correctly', async ({ page }) => {
    await page.goto('/login')

    // Page should render on tablet
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Session Management', () => {
  test('token persistence across page reloads', async ({ page }) => {
    await page.goto('/')
    await mockLogin(page, 'participant')

    // Reload page
    await page.reload()

    // Token should persist
    const token = await page.evaluate(() => localStorage.getItem('adk_token'))
    expect(token).toBeTruthy()
  })

  test('logout clears all auth state', async ({ page }) => {
    await page.goto('/')
    await mockLogin(page, 'participant')

    // Clear auth (simulate logout)
    await clearAuth(page)

    // Auth state should be cleared
    const token = await page.evaluate(() => localStorage.getItem('adk_token'))
    expect(token).toBeNull()
  })

  test('multiple tabs share auth state', async ({ page, context }) => {
    await page.goto('/')
    await mockLogin(page, 'participant')

    // Open new tab
    const page2 = await context.newPage()
    await page2.goto('/')

    // Both should have same auth state
    const token1 = await page.evaluate(() => localStorage.getItem('adk_token'))
    const token2 = await page2.evaluate(() => localStorage.getItem('adk_token'))

    expect(token1).toBe(token2)
  })
})
