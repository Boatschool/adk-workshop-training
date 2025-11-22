/**
 * Visual Builder Status Component
 * Shows status indicator and launch button for ADK Visual Builder
 */

import { useState, useEffect } from 'react'
import { cn } from '@utils/cn'

const ADK_VISUAL_BUILDER_URL = 'http://localhost:8000/dev-ui'
const ADK_HEALTH_URL = 'http://localhost:8000'

type BuilderStatus = 'checking' | 'online' | 'offline'

export function VisualBuilderStatus() {
  const [status, setStatus] = useState<BuilderStatus>('checking')

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Try to reach the ADK server
        const response = await fetch(ADK_HEALTH_URL, {
          method: 'HEAD',
          mode: 'no-cors',
        })
        // no-cors mode doesn't give us status, but if it doesn't throw, server is likely up
        setStatus('online')
      } catch {
        setStatus('offline')
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const statusStyles = {
    checking: 'bg-yellow-400 animate-pulse',
    online: 'bg-green-500',
    offline: 'bg-red-500',
  }

  const statusText = {
    checking: 'Checking status...',
    online: 'Visual Builder Ready',
    offline: 'Visual Builder Offline',
  }

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-800 dark:to-primary-900 rounded-2xl p-8 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">
          Welcome to the Workshop!
        </h2>
        <p className="text-primary-100 mb-6">
          Learn to build AI agents using Google's Agent Development Kit
        </p>

        <a
          href={ADK_VISUAL_BUILDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-lg transition-all',
            status === 'online'
              ? 'bg-white text-primary-700 hover:bg-primary-50 shadow-lg hover:shadow-xl'
              : 'bg-white/20 text-white cursor-not-allowed'
          )}
          onClick={(e) => {
            if (status !== 'online') {
              e.preventDefault()
            }
          }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Launch Visual Agent Builder
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <span
            className={cn('w-2 h-2 rounded-full', statusStyles[status])}
            aria-hidden="true"
          />
          <span className="text-primary-100">{statusText[status]}</span>
        </div>

        {status === 'offline' && (
          <p className="mt-3 text-xs text-primary-200">
            Run <code className="bg-primary-800/50 px-1.5 py-0.5 rounded">./start_visual_builder.sh</code> to start the builder
          </p>
        )}
      </div>
    </div>
  )
}
