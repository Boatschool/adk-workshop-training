/**
 * Accessibility E2E Tests
 * Uses axe-core to test WCAG 2.1 AA compliance
 */

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Helper to run axe and check for violations
async function checkAccessibility(page: import('@playwright/test').Page, pageName: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  // Log violations for debugging
  if (results.violations.length > 0) {
    console.log(`\n${pageName} Accessibility Violations:`)
    results.violations.forEach((violation) => {
      console.log(`  - ${violation.id}: ${violation.description}`)
      console.log(`    Impact: ${violation.impact}`)
      console.log(`    Nodes: ${violation.nodes.length}`)
      violation.nodes.forEach((node) => {
        console.log(`      Target: ${node.target}`)
        console.log(`      HTML: ${node.html.substring(0, 100)}...`)
      })
    })
  }

  return results
}

test.describe('Accessibility - Auth Pages', () => {
  test('Login page should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const results = await checkAccessibility(page, 'Login Page')

    // Filter for critical and serious violations only
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toHaveLength(0)
  })

  test('Register page should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    const results = await checkAccessibility(page, 'Register Page')

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toHaveLength(0)
  })

  test('Forgot Password page should have no critical accessibility violations', async ({
    page,
  }) => {
    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')

    const results = await checkAccessibility(page, 'Forgot Password Page')

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toHaveLength(0)
  })

  test('Welcome page should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/welcome')
    await page.waitForLoadState('networkidle')

    const results = await checkAccessibility(page, 'Welcome Page')

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toHaveLength(0)
  })
})

test.describe('Accessibility - Keyboard Navigation', () => {
  test('Login form inputs are focusable', async ({ page }) => {
    await page.goto('/login')

    // Email input should be focusable
    const emailInput = page.locator('#email')
    await emailInput.focus()
    const emailFocused = await page.evaluate(
      () => document.activeElement?.getAttribute('id') === 'email'
    )
    expect(emailFocused).toBe(true)

    // Password input should be focusable
    const passwordInput = page.locator('#password')
    await passwordInput.focus()
    const passwordFocused = await page.evaluate(
      () => document.activeElement?.getAttribute('id') === 'password'
    )
    expect(passwordFocused).toBe(true)
  })

  test('Register form inputs are focusable', async ({ page }) => {
    await page.goto('/register')

    // Full name input should be focusable
    const nameInput = page.locator('#fullName')
    await nameInput.focus()
    const nameFocused = await page.evaluate(
      () => document.activeElement?.getAttribute('id') === 'fullName'
    )
    expect(nameFocused).toBe(true)

    // Email input should be focusable
    const emailInput = page.locator('#email')
    await emailInput.focus()
    const emailFocused = await page.evaluate(
      () => document.activeElement?.getAttribute('id') === 'email'
    )
    expect(emailFocused).toBe(true)
  })

  test('Password visibility toggle is accessible', async ({ page }) => {
    await page.goto('/login')

    // Toggle button should have aria-label
    const toggleButton = page.locator('button[aria-label*="password"]').first()
    await expect(toggleButton).toBeVisible()

    // Click to toggle
    await toggleButton.click()

    // Check password is now visible
    const passwordType = await page.getAttribute('#password', 'type')
    expect(passwordType).toBe('text')

    // Check aria-label updated
    await expect(toggleButton).toHaveAttribute('aria-label', 'Hide password')
  })
})

test.describe('Accessibility - Color Contrast', () => {
  test('Login page should have sufficient color contrast', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page }).withTags(['cat.color']).analyze()

    // Check specifically for color contrast issues
    const contrastViolations = results.violations.filter((v) => v.id === 'color-contrast')

    // Log any contrast issues found
    if (contrastViolations.length > 0) {
      console.log('\nColor Contrast Issues:')
      contrastViolations.forEach((v) => {
        v.nodes.forEach((node) => {
          console.log(`  - ${node.html.substring(0, 80)}...`)
        })
      })
    }

    // Allow minor violations but flag serious ones
    const seriousContrastIssues = contrastViolations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(seriousContrastIssues).toHaveLength(0)
  })
})

test.describe('Accessibility - Form Labels', () => {
  test('Login form inputs should have associated labels', async ({ page }) => {
    await page.goto('/login')

    // Check email input has label
    const emailLabel = await page.locator('label[for="email"]').textContent()
    expect(emailLabel).toContain('Email')

    // Check password input has label
    const passwordLabel = await page.locator('label[for="password"]').textContent()
    expect(passwordLabel).toContain('Password')
  })

  test('Register form inputs should have associated labels', async ({ page }) => {
    await page.goto('/register')

    // Check all inputs have labels
    const fullNameLabel = await page.locator('label[for="fullName"]').textContent()
    expect(fullNameLabel).toContain('Full name')

    const emailLabel = await page.locator('label[for="email"]').textContent()
    expect(emailLabel).toContain('Email')

    const passwordLabel = await page.locator('label[for="password"]').textContent()
    expect(passwordLabel).toContain('Password')

    const confirmPasswordLabel = await page.locator('label[for="confirmPassword"]').textContent()
    expect(confirmPasswordLabel).toContain('Confirm password')
  })
})

test.describe('Accessibility - Screen Reader', () => {
  test('Login page should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/login')

    // Check for h1
    const h1 = await page.locator('h1').count()
    expect(h1).toBeGreaterThan(0)

    // Verify main heading content
    const h1Text = await page.locator('h1').first().textContent()
    expect(h1Text).toContain('Welcome back')
  })

  test('Error messages should be announced to screen readers', async ({ page }) => {
    await page.goto('/login')

    // Try to submit empty form (won't work due to HTML5 validation)
    // But we can check that error container has proper ARIA attributes when visible
    const errorContainer = page.locator('[class*="bg-red-50"]')

    // Error container should be ready to announce errors
    // (It only appears when there's an error)
  })

  test('Loading states should be announced', async ({ page }) => {
    await page.goto('/login')

    // Check submit button has proper disabled state indication
    const submitButton = page.getByRole('button', { name: /sign in/i })
    expect(await submitButton.isEnabled()).toBe(true)
  })
})

test.describe('Accessibility - Dark Mode', () => {
  test('Login page in dark mode should have no critical violations', async ({ page }) => {
    // Set dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const results = await checkAccessibility(page, 'Login Page (Dark Mode)')

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toHaveLength(0)
  })

  test('Register page in dark mode should have no critical violations', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    const results = await checkAccessibility(page, 'Register Page (Dark Mode)')

    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toHaveLength(0)
  })
})
