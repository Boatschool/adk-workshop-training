/**
 * UI Store tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useUIStore, toast, showToast } from '@stores/uiStore'

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({
      toasts: [],
      modals: [],
      sidebarOpen: true,
      mobileMenuOpen: false,
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('toasts', () => {
    it('adds a toast', () => {
      const store = useUIStore.getState()
      store.addToast({ type: 'success', title: 'Success!' })

      expect(useUIStore.getState().toasts).toHaveLength(1)
      expect(useUIStore.getState().toasts[0].title).toBe('Success!')
      expect(useUIStore.getState().toasts[0].type).toBe('success')
    })

    it('adds toast with message', () => {
      const store = useUIStore.getState()
      store.addToast({ type: 'error', title: 'Error', message: 'Something went wrong' })

      const toasts = useUIStore.getState().toasts
      expect(toasts[0].message).toBe('Something went wrong')
    })

    it('removes a toast by id', () => {
      const store = useUIStore.getState()
      store.addToast({ type: 'info', title: 'Info' })

      const toastId = useUIStore.getState().toasts[0].id
      store.removeToast(toastId)

      expect(useUIStore.getState().toasts).toHaveLength(0)
    })

    it('clears all toasts', () => {
      const store = useUIStore.getState()
      store.addToast({ type: 'info', title: 'Toast 1' })
      store.addToast({ type: 'info', title: 'Toast 2' })
      store.addToast({ type: 'info', title: 'Toast 3' })

      expect(useUIStore.getState().toasts).toHaveLength(3)

      store.clearToasts()
      expect(useUIStore.getState().toasts).toHaveLength(0)
    })

    it('auto-removes toast after duration', () => {
      const store = useUIStore.getState()
      store.addToast({ type: 'success', title: 'Auto-remove', duration: 3000 })

      expect(useUIStore.getState().toasts).toHaveLength(1)

      vi.advanceTimersByTime(3000)

      expect(useUIStore.getState().toasts).toHaveLength(0)
    })

    it('uses default duration of 5000ms', () => {
      const store = useUIStore.getState()
      store.addToast({ type: 'success', title: 'Default duration' })

      expect(useUIStore.getState().toasts).toHaveLength(1)

      vi.advanceTimersByTime(4999)
      expect(useUIStore.getState().toasts).toHaveLength(1)

      vi.advanceTimersByTime(1)
      expect(useUIStore.getState().toasts).toHaveLength(0)
    })

    it('does not auto-remove when duration is 0', () => {
      const store = useUIStore.getState()
      store.addToast({ type: 'success', title: 'Persistent', duration: 0 })

      vi.advanceTimersByTime(10000)
      expect(useUIStore.getState().toasts).toHaveLength(1)
    })
  })

  describe('toast convenience functions', () => {
    it('toast.success adds success toast', () => {
      toast.success('Success title', 'Success message')

      const toasts = useUIStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0].type).toBe('success')
      expect(toasts[0].title).toBe('Success title')
      expect(toasts[0].message).toBe('Success message')
    })

    it('toast.error adds error toast', () => {
      toast.error('Error title')

      const toasts = useUIStore.getState().toasts
      expect(toasts[0].type).toBe('error')
    })

    it('toast.warning adds warning toast', () => {
      toast.warning('Warning title')

      const toasts = useUIStore.getState().toasts
      expect(toasts[0].type).toBe('warning')
    })

    it('toast.info adds info toast', () => {
      toast.info('Info title')

      const toasts = useUIStore.getState().toasts
      expect(toasts[0].type).toBe('info')
    })
  })

  describe('showToast helper', () => {
    it('adds toast with default info type', () => {
      showToast('Hello')

      const toasts = useUIStore.getState().toasts
      expect(toasts[0].type).toBe('info')
      expect(toasts[0].title).toBe('Hello')
    })

    it('adds toast with specified type', () => {
      showToast('Error message', 'error')

      const toasts = useUIStore.getState().toasts
      expect(toasts[0].type).toBe('error')
    })

    it('adds toast with message', () => {
      showToast('Title', 'success', 'Details here')

      const toasts = useUIStore.getState().toasts
      expect(toasts[0].message).toBe('Details here')
    })
  })

  describe('modals', () => {
    it('opens a modal', () => {
      const store = useUIStore.getState()
      store.openModal({ component: 'TestModal', props: { foo: 'bar' } })

      const modals = useUIStore.getState().modals
      expect(modals).toHaveLength(1)
      expect(modals[0].component).toBe('TestModal')
      expect(modals[0].props).toEqual({ foo: 'bar' })
    })

    it('closes a modal by id', () => {
      const store = useUIStore.getState()
      store.openModal({ component: 'Modal1' })
      store.openModal({ component: 'Modal2' })

      const modal1Id = useUIStore.getState().modals[0].id
      store.closeModal(modal1Id)

      const modals = useUIStore.getState().modals
      expect(modals).toHaveLength(1)
      expect(modals[0].component).toBe('Modal2')
    })

    it('closes all modals', () => {
      const store = useUIStore.getState()
      store.openModal({ component: 'Modal1' })
      store.openModal({ component: 'Modal2' })
      store.openModal({ component: 'Modal3' })

      store.closeAllModals()
      expect(useUIStore.getState().modals).toHaveLength(0)
    })
  })

  describe('sidebar', () => {
    it('sets sidebar open state', () => {
      const store = useUIStore.getState()

      store.setSidebarOpen(false)
      expect(useUIStore.getState().sidebarOpen).toBe(false)

      store.setSidebarOpen(true)
      expect(useUIStore.getState().sidebarOpen).toBe(true)
    })

    it('toggles sidebar', () => {
      const store = useUIStore.getState()
      const initialState = useUIStore.getState().sidebarOpen

      store.toggleSidebar()
      expect(useUIStore.getState().sidebarOpen).toBe(!initialState)

      store.toggleSidebar()
      expect(useUIStore.getState().sidebarOpen).toBe(initialState)
    })
  })

  describe('mobile menu', () => {
    it('sets mobile menu open state', () => {
      const store = useUIStore.getState()

      store.setMobileMenuOpen(true)
      expect(useUIStore.getState().mobileMenuOpen).toBe(true)

      store.setMobileMenuOpen(false)
      expect(useUIStore.getState().mobileMenuOpen).toBe(false)
    })

    it('toggles mobile menu', () => {
      const store = useUIStore.getState()

      store.toggleMobileMenu()
      expect(useUIStore.getState().mobileMenuOpen).toBe(true)

      store.toggleMobileMenu()
      expect(useUIStore.getState().mobileMenuOpen).toBe(false)
    })
  })
})
