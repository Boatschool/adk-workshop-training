/**
 * Visual Builder Status Component
 * Shows a welcome message with the user's name
 */

import { useAuth } from '@contexts/AuthContext'

export function VisualBuilderStatus() {
  const { user } = useAuth()
  const firstName = user?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome back, {firstName}!
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1">
        Build AI agents for healthcare automation using Google's Agent Development Kit
      </p>
    </div>
  )
}
