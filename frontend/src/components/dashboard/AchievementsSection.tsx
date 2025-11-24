/**
 * Achievements Section Component
 * Shows user's badges and achievements
 */

import { Link } from 'react-router-dom'
import { BadgeCard } from '@components/common'
import { useUserSettings } from '@hooks/useUserSettings'

export function AchievementsSection() {
  const { settings, getEarnedBadges } = useUserSettings()
  const earnedBadges = getEarnedBadges()
  const totalBadges = settings.badges.length

  // Don't show if no badges earned yet
  if (earnedBadges.length === 0) {
    return null
  }

  return (
    <section className="mb-8" aria-labelledby="achievements-heading">
      <div className="flex items-center justify-between mb-4">
        <h2
          id="achievements-heading"
          className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <svg
            className="w-5 h-5 text-primary-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          Achievements
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            {earnedBadges.length} of {totalBadges}
          </span>
        </h2>

        <Link
          to="/profile/settings"
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {earnedBadges.map(badge => (
          <BadgeCard key={badge.id} badge={badge} size="md" />
        ))}
      </div>

      {/* Motivational message for partial completion */}
      {earnedBadges.length < totalBadges && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>{totalBadges - earnedBadges.length} more badge{totalBadges - earnedBadges.length !== 1 ? 's' : ''} to unlock!</strong>{' '}
            Complete workshops and exercises to earn more achievements.
          </p>
        </div>
      )}
    </section>
  )
}
