/**
 * User Settings Hook
 * Manages user settings with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react'
import type { UserSettings, BadgeType, SetupStep } from '@/types'
import { DEFAULT_USER_SETTINGS } from '@/types/models'

const STORAGE_KEY = 'adk-user-settings'

/**
 * Load settings from localStorage with defaults
 */
function loadSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge with defaults to handle new fields
      return { ...DEFAULT_USER_SETTINGS, ...parsed }
    }
  } catch (error) {
    console.warn('Failed to load user settings:', error)
  }
  return DEFAULT_USER_SETTINGS
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save user settings:', error)
  }
}

/**
 * Hook to manage user settings
 */
export function useUserSettings() {
  const [settings, setSettingsState] = useState<UserSettings>(loadSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings on mount
  useEffect(() => {
    setSettingsState(loadSettings())
    setIsLoaded(true)
  }, [])

  // Update a single setting
  const updateSetting = useCallback(<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettingsState(prev => {
      const updated = { ...prev, [key]: value }
      saveSettings(updated)
      return updated
    })
  }, [])

  // Update multiple settings at once
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettingsState(prev => {
      const updated = { ...prev, ...updates }
      saveSettings(updated)
      return updated
    })
  }, [])

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_USER_SETTINGS)
    saveSettings(DEFAULT_USER_SETTINGS)
  }, [])

  // Get the Visual Builder URL (with /dev-ui appended)
  const getBuilderUrl = useCallback(() => {
    const base = settings.localBuilderUrl.replace(/\/$/, '') // Remove trailing slash
    return `${base}/dev-ui`
  }, [settings.localBuilderUrl])

  // Get the health check URL (base URL without /dev-ui)
  const getHealthUrl = useCallback(() => {
    return settings.localBuilderUrl.replace(/\/$/, '')
  }, [settings.localBuilderUrl])

  // Mark a setup step as completed
  const completeSetupStep = useCallback((step: SetupStep) => {
    setSettingsState(prev => {
      if (prev.setupStepsCompleted.includes(step)) {
        return prev // Already completed
      }
      const updated = {
        ...prev,
        setupStepsCompleted: [...prev.setupStepsCompleted, step],
        currentSetupStep: step,
      }
      saveSettings(updated)
      return updated
    })
  }, [])

  // Earn a badge
  const earnBadge = useCallback((badgeId: BadgeType) => {
    setSettingsState(prev => {
      const badgeIndex = prev.badges.findIndex(b => b.id === badgeId)
      if (badgeIndex === -1 || prev.badges[badgeIndex].earnedAt) {
        return prev // Badge doesn't exist or already earned
      }

      const updatedBadges = [...prev.badges]
      updatedBadges[badgeIndex] = {
        ...updatedBadges[badgeIndex],
        earnedAt: new Date().toISOString(),
      }

      const updated = {
        ...prev,
        badges: updatedBadges,
      }
      saveSettings(updated)
      return updated
    })
  }, [])

  // Get setup progress percentage
  const getSetupProgress = useCallback(() => {
    const totalSteps = 7 // welcome, prerequisites, venv, install-adk, api-key, verify, complete
    const completedSteps = settings.setupStepsCompleted.length
    return Math.round((completedSteps / totalSteps) * 100)
  }, [settings.setupStepsCompleted])

  // Get earned badges
  const getEarnedBadges = useCallback(() => {
    return settings.badges.filter(badge => badge.earnedAt !== null)
  }, [settings.badges])

  return {
    settings,
    isLoaded,
    updateSetting,
    updateSettings,
    resetSettings,
    getBuilderUrl,
    getHealthUrl,
    completeSetupStep,
    earnBadge,
    getSetupProgress,
    getEarnedBadges,
  }
}
