/**
 * Setup Progress Banner
 * Shows setup progress for new users who haven't completed environment setup
 */

import { Link } from 'react-router-dom'
import { useUserSettings } from '@hooks/useUserSettings'

export function SetupProgressBanner() {
  const { settings, getSetupProgress } = useUserSettings()

  // Don't show if setup is already completed
  if (settings.setupCompleted) {
    return null
  }

  const progress = getSetupProgress()
  const progressPercentage = Math.round(progress.percentage)
  const isInProgress = progress.completedSteps > 0

  return (
    <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-1">
            {isInProgress ? 'Continue Your Environment Setup' : 'Complete Your Environment Setup'}
          </h3>
          <p className="text-amber-800 dark:text-amber-200 mb-4">
            {isInProgress
              ? `You're ${progressPercentage}% complete! Continue where you left off.`
              : 'Before you can start building AI agents, you need to set up your local development environment. This takes about 15-20 minutes.'
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/getting-started"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {isInProgress ? 'Continue Setup' : 'Start Setup Wizard'}
            </Link>

            <Link
              to="/guides/getting-started"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-100 font-medium rounded-lg border-2 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Quick Start Guide
            </Link>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="hidden lg:flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full border-4 border-amber-200 dark:border-amber-800 flex items-center justify-center">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{progressPercentage}%</span>
          </div>
          <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
            {isInProgress ? `${progress.completedSteps}/${progress.totalSteps}` : 'Not Started'}
          </span>
        </div>
      </div>

      {/* What you'll learn */}
      <div className="mt-6 pt-6 border-t border-amber-200 dark:border-amber-800">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-3">
          Setup includes:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Installing Google ADK
          </div>
          <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Configuring API keys
          </div>
          <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Testing Visual Builder
          </div>
        </div>
      </div>
    </div>
  )
}
