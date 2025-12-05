/**
 * Visual Builder Status Component
 * Shows a welcome message with the user's name
 * Simplified to match Agent Architect dashboard styling
 */

import { useAuth } from '@contexts/AuthContext'

export function VisualBuilderStatus() {
  const { user } = useAuth()
  const firstName = user?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome back, {firstName}!
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1">
        Design, architect, and plan AI Agents with expert guidance
      </p>
    </div>
  )
}
