/**
 * User Settings Page
 * Configure development environment and preferences
 */

import { useState, useEffect } from 'react'
import { BadgeCard } from '@components/common'
import { useUserSettings } from '@hooks/useUserSettings'
import { useAuth } from '@contexts/AuthContext'
import { cn } from '@utils/cn'

type BuilderStatus = 'checking' | 'online' | 'offline'

export function SettingsPage() {
  const { user } = useAuth()
  const { settings, updateSetting, resetSettings, getHealthUrl } = useUserSettings()
  const [builderStatus, setBuilderStatus] = useState<BuilderStatus>('checking')
  const [urlInput, setUrlInput] = useState(settings.localBuilderUrl)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  // Sync urlInput when settings change
  useEffect(() => {
    setUrlInput(settings.localBuilderUrl)
  }, [settings.localBuilderUrl])

  // Check builder status
  useEffect(() => {
    const checkStatus = async () => {
      setBuilderStatus('checking')
      try {
        await fetch(getHealthUrl(), {
          method: 'HEAD',
          mode: 'no-cors',
        })
        setBuilderStatus('online')
      } catch {
        setBuilderStatus('offline')
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 10000)
    return () => clearInterval(interval)
  }, [getHealthUrl])

  const handleSaveUrl = () => {
    setIsSaving(true)
    // Normalize URL (remove trailing slash)
    const normalizedUrl = urlInput.replace(/\/+$/, '')
    updateSetting('localBuilderUrl', normalizedUrl)
    setUrlInput(normalizedUrl)

    setTimeout(() => {
      setIsSaving(false)
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 2000)
    }, 300)
  }

  const handleTestConnection = async () => {
    setBuilderStatus('checking')
    try {
      const testUrl = urlInput.replace(/\/+$/, '')
      await fetch(testUrl, {
        method: 'HEAD',
        mode: 'no-cors',
      })
      setBuilderStatus('online')
    } catch {
      setBuilderStatus('offline')
    }
  }

  const statusStyles = {
    checking: 'bg-yellow-400 animate-pulse',
    online: 'bg-green-500',
    offline: 'bg-red-500',
  }

  const statusText = {
    checking: 'Checking...',
    online: 'Connected',
    offline: 'Offline',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Configure your development environment and preferences
        </p>
      </div>

      {/* User Info Card */}
      {user && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {user.full_name || 'User'}
              </p>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300 mt-1">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Development Environment */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Development Environment
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure your local ADK Visual Builder connection
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('w-2.5 h-2.5 rounded-full', statusStyles[builderStatus])} />
            <span className={cn(
              'text-sm font-medium',
              builderStatus === 'online' ? 'text-green-600 dark:text-green-400' :
              builderStatus === 'offline' ? 'text-red-600 dark:text-red-400' :
              'text-yellow-600 dark:text-yellow-400'
            )}>
              {statusText[builderStatus]}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Local Builder URL */}
          <div>
            <label htmlFor="builderUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Local Visual Builder URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="builderUrl"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://localhost:8000"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleTestConnection}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Test
              </button>
              <button
                onClick={handleSaveUrl}
                disabled={isSaving || urlInput === settings.localBuilderUrl}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  urlInput !== settings.localBuilderUrl
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                )}
              >
                {isSaving ? 'Saving...' : showSaved ? 'Saved!' : 'Save'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              The base URL where your ADK Visual Builder is running.
              The builder interface is accessed at <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">/dev-ui</code>
            </p>
          </div>

          {/* Auto-detect toggle */}
          <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto-detect local builder
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically check if the Visual Builder is running
              </p>
            </div>
            <button
              role="switch"
              aria-checked={settings.autoDetectBuilder}
              onClick={() => updateSetting('autoDetectBuilder', !settings.autoDetectBuilder)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                settings.autoDetectBuilder ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settings.autoDetectBuilder ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>

        {/* Quick Start Guide */}
        {builderStatus === 'offline' && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
              Visual Builder Not Running
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              Start the Visual Builder to practice building agents locally:
            </p>
            <div className="bg-amber-100 dark:bg-amber-900/40 rounded-md p-3">
              <code className="text-sm text-amber-800 dark:text-amber-200">
                ./start_visual_builder.sh
              </code>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              Make sure you have Google ADK installed and your GOOGLE_API_KEY configured.
            </p>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Preferences
        </h2>

        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email notifications
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive updates about new workshops and features
              </p>
            </div>
            <button
              role="switch"
              aria-checked={settings.emailNotifications}
              onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                settings.emailNotifications ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Achievements
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settings.badges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} size="sm" />
          ))}
        </div>
      </div>

      {/* Setup Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Setup Progress
        </h2>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center',
              settings.setupCompleted
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-gray-100 dark:bg-gray-700'
            )}>
              {settings.setupCompleted ? (
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="w-2 h-2 rounded-full bg-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Development environment configured
              </p>
              {settings.setupCompletedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Completed {new Date(settings.setupCompletedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            {!settings.setupCompleted && builderStatus === 'online' && (
              <button
                onClick={() => {
                  updateSetting('setupCompleted', true)
                  updateSetting('setupCompletedAt', new Date().toISOString())
                }}
                className="px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reset Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Danger Zone
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Reset all settings
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This will reset all settings to their default values
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all settings?')) {
                resetSettings()
              }
            }}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Reset Settings
          </button>
        </div>
      </div>
    </div>
  )
}
