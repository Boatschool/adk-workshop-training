/**
 * Featured Section Component
 * Displays admin-curated featured resources in a horizontal scrollable layout
 * Updated to match Agent Architect dashboard styling with NEW badges
 */

import { Link } from 'react-router-dom'
import { useFeaturedResources } from '@hooks/useLibrary'
import { cn } from '@utils/cn'
import type { LibraryResourceType } from '@/types/models'

// Check if resource was created within the last 7 days
function isNewResource(createdAt: string | undefined): boolean {
  if (!createdAt) return false
  const created = new Date(createdAt)
  const now = new Date()
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 7
}

// Icons for different resource types
function getTypeIcon(type: LibraryResourceType) {
  switch (type) {
    case 'article':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    case 'video':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'pdf':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    case 'tool':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case 'course':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'documentation':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
  }
}

// Type icon background colors
function getTypeIconStyles(type: LibraryResourceType) {
  switch (type) {
    case 'article':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    case 'video':
      return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    case 'pdf':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    case 'tool':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    case 'course':
      return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
    case 'documentation':
      return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
  }
}

// Type label formatting
function formatType(type: LibraryResourceType): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

interface FeaturedSectionProps {
  className?: string
}

export function FeaturedSection({ className }: FeaturedSectionProps) {
  const { data: featuredResources, isLoading, error } = useFeaturedResources(8)

  // Don't render if loading, error, or no featured resources
  if (isLoading) {
    return (
      <section className={cn('mb-8', className)} aria-labelledby="featured-heading">
        <div className="flex items-center justify-between mb-4">
          <h2
            id="featured-heading"
            className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Featured
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </section>
    )
  }

  if (error || !featuredResources || featuredResources.length === 0) {
    return null
  }

  return (
    <section className={cn('mb-8', className)} aria-labelledby="featured-heading">
      <div className="flex items-center justify-between mb-4">
        <h2
          id="featured-heading"
          className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Featured
        </h2>
        <Link
          to="/library?featured=true"
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center gap-1"
        >
          View All
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 -mx-4 px-4 sm:mx-0 sm:px-0">
        {featuredResources.map((resource) => {
          const isExternal = resource.source === 'external'
          const isNew = isNewResource(resource.createdAt)
          const cardContent = (
            <div className="p-5 h-full flex flex-col relative">
              {/* NEW badge */}
              {isNew && (
                <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                  NEW
                </span>
              )}

              {/* Type badge */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    getTypeIconStyles(resource.type)
                  )}
                >
                  {getTypeIcon(resource.type)}
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {formatType(resource.type)}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {resource.title}
              </h3>

              {/* Description - flex-1 to push footer down */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
                {resource.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-auto">
                {resource.estimatedMinutes && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {resource.estimatedMinutes} min
                  </span>
                )}
                {isExternal && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </div>
            </div>
          )

          const cardClassName = cn(
            'group flex-shrink-0 w-72 bg-white dark:bg-gray-800 rounded-xl',
            'border border-gray-100 dark:border-gray-700 overflow-hidden',
            'shadow-sm hover:shadow-md transition-all duration-200 snap-start'
          )

          // External resources open in new tab
          if (isExternal && resource.externalUrl) {
            return (
              <a
                key={resource.id}
                href={resource.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClassName}
              >
                {cardContent}
              </a>
            )
          }

          // Embedded resources link to detail page
          return (
            <Link
              key={resource.id}
              to={`/library/${resource.id}`}
              className={cardClassName}
            >
              {cardContent}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
