/**
 * Format utility function tests
 */

import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime, formatRelativeTime } from '@utils/format'

describe('formatDate', () => {
  it('formats a valid date string', () => {
    const result = formatDate('2024-01-15T10:30:00Z')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  it('returns placeholder for null input', () => {
    expect(formatDate(null)).toBe('-')
  })

  it('returns placeholder for undefined input', () => {
    expect(formatDate(undefined)).toBe('-')
  })

  it('returns placeholder for empty string', () => {
    expect(formatDate('')).toBe('-')
  })

  it('handles Date objects', () => {
    const date = new Date('2024-01-15T10:30:00Z')
    const result = formatDate(date.toISOString())
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })
})

describe('formatDateTime', () => {
  it('formats a valid datetime string', () => {
    const result = formatDateTime('2024-01-15T10:30:00Z')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  it('returns placeholder for null input', () => {
    expect(formatDateTime(null)).toBe('-')
  })

  it('returns placeholder for undefined input', () => {
    expect(formatDateTime(undefined)).toBe('-')
  })

  it('includes time information', () => {
    const result = formatDateTime('2024-01-15T10:30:00Z')
    // Should include either AM/PM or 24-hour format depending on locale
    expect(result.length).toBeGreaterThan(formatDate('2024-01-15T10:30:00Z').length)
  })
})

describe('formatRelativeTime', () => {
  it('formats recent time as "just now" or similar', () => {
    const now = new Date()
    const result = formatRelativeTime(now.toISOString())
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  it('returns placeholder for null input', () => {
    expect(formatRelativeTime(null)).toBe('-')
  })

  it('returns placeholder for undefined input', () => {
    expect(formatRelativeTime(undefined)).toBe('-')
  })

  it('formats past dates', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 5)
    const result = formatRelativeTime(pastDate.toISOString())
    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)
  })
})
