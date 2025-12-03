/**
 * Library Resource Page
 * Detail page for viewing embedded library content with progress tracking
 */

import { useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ResourceViewer, BookmarkButton, ProgressIndicator } from '@components/library'
import { LibraryResourceCard } from '@components/library'
import { useLibraryResource, useUpdateProgress, useLibraryResources } from '@hooks/useLibrary'
import { cn } from '@utils/cn'
import type { LibraryDifficulty, LibraryResourceWithUserData } from '@/types/models'

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

// Format topic for display
function formatTopic(topic: string): string {
  return topic
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function LibraryResourcePage() {
  const { id } = useParams<{ id: string }>()

  // Fetch the resource from API
  const { data: resource, isLoading, error } = useLibraryResource(id || '')

  // Progress mutation
  const { mutate: updateProgress } = useUpdateProgress()

  // Fetch all resources for related resources
  const { data: allResources = [] } = useLibraryResources({})

  // Auto-mark as in_progress when viewing
  useEffect(() => {
    if (resource && resource.progressStatus === 'not_started') {
      updateProgress({ resourceId: resource.id, status: 'in_progress' })
    }
  }, [resource, updateProgress])

  // Get related resources (same topic, different resource)
  const relatedResources = allResources
    .filter(
      (r: LibraryResourceWithUserData) =>
        r.id !== resource?.id &&
        r.topics.some((t) => resource?.topics.includes(t))
    )
    .slice(0, 3)

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <svg
            className="w-20 h-20 mx-auto text-red-400 dark:text-red-500 mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Failed to Load Resource
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Link
            to="/library"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Library
          </Link>
        </div>
      </div>
    )
  }

  // Redirect external resources back to library
  if (resource?.source === 'external') {
    return <Navigate to="/library" replace />
  }

  // Resource not found
  if (!resource) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <svg
            className="w-20 h-20 mx-auto text-gray-400 dark:text-gray-600 mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Resource Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The resource you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/library"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Library
          </Link>
        </div>
      </div>
    )
  }

  // Handle mark as complete
  const handleMarkComplete = () => {
    updateProgress({ resourceId: resource.id, status: 'completed' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link
              to="/library"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Library
            </Link>
          </li>
          <li className="text-gray-400 dark:text-gray-600">/</li>
          <li className="text-gray-900 dark:text-white font-medium truncate max-w-xs">
            {resource.title}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Resource Header */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* Progress status */}
              <ProgressIndicator status={resource.progressStatus} size="sm" />
              <span
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full capitalize',
                  getDifficultyStyles(resource.difficulty)
                )}
              >
                {resource.difficulty}
              </span>
              {resource.topics.map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                >
                  {formatTopic(topic)}
                </span>
              ))}
            </div>

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {resource.title}
              </h1>
              <BookmarkButton
                resourceId={resource.id}
                isBookmarked={resource.isBookmarked}
                size="lg"
                showLabel
              />
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {resource.description}
            </p>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {resource.author && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {resource.author}
                </span>
              )}
              {resource.estimatedMinutes && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {resource.estimatedMinutes} min read
                </span>
              )}
            </div>
          </div>

          {/* Content Viewer */}
          <ResourceViewer resource={resource} />

          {/* Mark as Complete button */}
          {resource.progressStatus !== 'completed' && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleMarkComplete}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Mark as Complete
              </button>
            </div>
          )}

          {/* Completed message */}
          {resource.progressStatus === 'completed' && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                You've completed this resource
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Back to Library */}
          <div className="mb-6">
            <Link
              to="/library"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Library
            </Link>
          </div>

          {/* Related Resources */}
          {relatedResources.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Related Resources
              </h2>
              <div className="space-y-4">
                {relatedResources.map((related: LibraryResourceWithUserData) => (
                  <LibraryResourceCard key={related.id} resource={related} showUserData />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
