/**
 * cn utility function tests
 */

import { describe, it, expect } from 'vitest'
import { cn } from '@utils/cn'

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles undefined values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar')
  })

  it('handles null values', () => {
    expect(cn('foo', null, 'bar')).toBe('foo bar')
  })

  it('handles boolean expressions', () => {
    const showBar = false
    const showBaz = true
    expect(cn('foo', showBar && 'bar', showBaz && 'baz')).toBe('foo baz')
  })

  it('merges Tailwind classes intelligently', () => {
    // tailwind-merge should resolve conflicts
    expect(cn('px-4', 'px-6')).toBe('px-6')
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  })

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('handles object syntax', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('handles mixed inputs', () => {
    expect(
      cn(
        'base',
        ['array', 'classes'],
        { conditional: true, excluded: false },
        undefined,
        'final'
      )
    ).toBe('base array classes conditional final')
  })

  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('')
  })

  it('returns empty string for all falsy arguments', () => {
    expect(cn(undefined, null, false, '')).toBe('')
  })
})
