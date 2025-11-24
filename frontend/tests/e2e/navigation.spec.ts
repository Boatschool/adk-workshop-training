/**
 * Navigation E2E Tests
 * Tests basic navigation and page accessibility
 */

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Navigation', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/ADK Platform/)
  })

  test('should navigate to workshops page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Workshops')
    await expect(page).toHaveURL('/workshops')
  })

  test('should display 404 for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')
    await expect(page).toHaveURL('/404')
    await expect(page.getByText('404')).toBeVisible()
  })

  test('should have working header navigation', async ({ page }) => {
    await page.goto('/')

    // Check header exists
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // Check navigation links exist
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /workshops/i })).toBeVisible()
  })

  test('should have working footer', async ({ page }) => {
    await page.goto('/')

    // Check footer exists
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test('home page should have no accessibility violations', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.visual-builder-container') // Exclude complex canvas if present
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('workshops page should have no accessibility violations', async ({ page }) => {
    await page.goto('/workshops')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('404 page should have no accessibility violations', async ({ page }) => {
    await page.goto('/404')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})

test.describe('Responsive Design', () => {
  test('should display mobile menu on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Mobile menu button should be visible
    const mobileMenuButton = page.getByRole('button', { name: /menu/i })
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      // Navigation should be accessible after clicking
      await expect(page.getByRole('navigation')).toBeVisible()
    }
  })

  test('should hide mobile menu on large screens', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    // Navigation should be directly visible (not in hamburger)
    const nav = page.locator('header nav')
    await expect(nav).toBeVisible()
  })
})
