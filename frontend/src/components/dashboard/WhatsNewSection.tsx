/**
 * What's New Section Component
 * Displays announcements on the dashboard - replaces Platform Features
 * Content is managed via Admin Console
 */

import { Link } from 'react-router-dom'
import { useActiveAnnouncements } from '@hooks/useAnnouncements'
import { cn } from '@utils/cn'

// Badge color styles
const badgeColors = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

// Type icons
const typeIcons: Record<string, JSX.Element> = {
  workshop: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  guide: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  library: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  news: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  feature: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  general: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

// Arrow icon
const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

// Sparkles icon for header
const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

interface WhatsNewSectionProps {
  className?: string
}

export function WhatsNewSection({ className }: WhatsNewSectionProps) {
  const { data: announcements, isLoading } = useActiveAnnouncements(4)

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm', className)}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-primary-500">
            <SparklesIcon />
          </span>
          What's New
        </h2>
        <ul className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <li key={i} className="animate-pulse">
              <div className="h-14 bg-gray-100 dark:bg-gray-700 rounded-lg" />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // Empty state - show placeholder content
  if (!announcements || announcements.length === 0) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm', className)}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-primary-500">
            <SparklesIcon />
          </span>
          What's New
        </h2>
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Check back soon for updates!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm', className)}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="text-primary-500">
          <SparklesIcon />
        </span>
        What's New
      </h2>
      <ul className="space-y-3">
        {announcements.map((announcement) => {
          const content = (
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
              {/* Type icon */}
              <div className="flex-shrink-0 mt-0.5 text-gray-400 dark:text-gray-500 group-hover:text-primary-500 transition-colors">
                {typeIcons[announcement.announcementType] || typeIcons.general}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {announcement.title}
                  </p>
                  {announcement.badgeText && (
                    <span className={cn(
                      'text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0',
                      badgeColors[announcement.badgeColor] || badgeColors.blue
                    )}>
                      {announcement.badgeText}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {announcement.description}
                </p>
              </div>

              {/* Arrow */}
              {announcement.linkUrl && (
                <div className="flex-shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors">
                  <ArrowIcon />
                </div>
              )}
            </div>
          )

          // If there's a link, wrap in Link or anchor
          if (announcement.linkUrl) {
            // Check if it's an external link
            if (announcement.linkUrl.startsWith('http')) {
              return (
                <li key={announcement.id}>
                  <a
                    href={announcement.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content}
                  </a>
                </li>
              )
            }
            // Internal link
            return (
              <li key={announcement.id}>
                <Link to={announcement.linkUrl}>
                  {content}
                </Link>
              </li>
            )
          }

          // No link - just display
          return (
            <li key={announcement.id}>
              {content}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
