/**
 * Library Resource Card Component
 * Displays a library resource with type indicator, topics, difficulty, bookmark, and progress
 */

import { Link } from 'react-router-dom'
import { cn } from '@utils/cn'
import type { LibraryResource, LibraryResourceType, LibraryDifficulty, LibraryResourceWithUserData } from '@/types/models'
import { BookmarkButton } from './BookmarkButton'
import { ProgressIcon } from './ProgressIndicator'

interface LibraryResourceCardProps {
  resource: LibraryResource | LibraryResourceWithUserData
  /** If true, shows bookmark button and progress indicator (requires resource to have user data) */
  showUserData?: boolean
}

// Icons for different resource types
function getTypeIcon(type: LibraryResourceType) {
  switch (type) {
    case 'article':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    case 'video':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'pdf':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    case 'tool':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case 'course':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'documentation':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
  }
}

// External link icon
function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

// Difficulty badge colors
function getDifficultyStyles(difficulty: LibraryDifficulty) {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    case 'intermediate':
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
    case 'advanced':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  }
}

// Topic label formatting
function formatTopic(topic: string): string {
  return topic
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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

// Type guard to check if resource has user data
function hasUserData(resource: LibraryResource | LibraryResourceWithUserData): resource is LibraryResourceWithUserData {
  return 'isBookmarked' in resource
}

export function LibraryResourceCard({ resource, showUserData = false }: LibraryResourceCardProps) {
  const isExternal = resource.source === 'external'
  const resourceWithUserData = hasUserData(resource) ? resource : null

  const cardContent = (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            getTypeIconStyles(resource.type)
          )}
        >
          {getTypeIcon(resource.type)}
        </div>
        <div className="flex items-center gap-2">
          {/* Progress indicator */}
          {showUserData && resourceWithUserData && (
            <ProgressIcon status={resourceWithUserData.progressStatus} />
          )}
          {isExternal && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
              External
              <ExternalLinkIcon className="w-3 h-3" />
            </span>
          )}
          <span
            className={cn(
              'px-2 py-1 text-xs font-medium rounded-full capitalize',
              getDifficultyStyles(resource.difficulty)
            )}
          >
            {resource.difficulty}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
        {resource.title}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {resource.description}
      </p>

      {/* Topics */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {resource.topics.slice(0, 2).map((topic) => (
          <span
            key={topic}
            className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
          >
            {formatTopic(topic)}
          </span>
        ))}
        {resource.topics.length > 2 && (
          <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
            +{resource.topics.length - 2}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          {resource.author && <span>{resource.author}</span>}
          {resource.estimatedMinutes && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {resource.estimatedMinutes} min
            </span>
          )}
        </div>
        {/* Bookmark button */}
        {showUserData && resourceWithUserData && (
          <BookmarkButton
            resourceId={resource.id}
            isBookmarked={resourceWithUserData.isBookmarked}
            size="sm"
          />
        )}
      </div>
    </div>
  )

  // External resources open in new tab
  if (isExternal && resource.externalUrl) {
    return (
      <a
        href={resource.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
      >
        {cardContent}
      </a>
    )
  }

  // Embedded resources link to detail page
  return (
    <Link
      to={`/library/${resource.id}`}
      className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
    >
      {cardContent}
    </Link>
  )
}
