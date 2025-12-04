/**
 * Library List Page
 * Main library page with filtering, search, and resource grid
 *
 * Filter state is derived from URL search params (single source of truth).
 * This ensures browser history navigation and external URL changes work correctly.
 */

import { useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LibraryResourceCard, LibraryFilters } from '@components/library'
import { useLibraryResources } from '@hooks/useLibrary'
import type { LibraryResourceType, LibraryTopic, LibraryDifficulty, LibraryResourceWithUserData } from '@/types/models'

// Valid filter values for type checking URL params
const VALID_TYPES: LibraryResourceType[] = ['article', 'video', 'pdf', 'tool', 'course', 'documentation']
const VALID_TOPICS: LibraryTopic[] = [
  'agent-fundamentals',
  'prompt-engineering',
  'multi-agent-systems',
  'tools-integrations',
  'deployment',
  'best-practices',
]
const VALID_DIFFICULTIES: LibraryDifficulty[] = ['beginner', 'intermediate', 'advanced']

export function LibraryListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive filter state from URL params (URL is the source of truth)
  const selectedType = useMemo((): LibraryResourceType | 'all' => {
    const type = searchParams.get('type')
    return type && VALID_TYPES.includes(type as LibraryResourceType)
      ? (type as LibraryResourceType)
      : 'all'
  }, [searchParams])

  const selectedTopic = useMemo((): LibraryTopic | 'all' => {
    const topic = searchParams.get('topic')
    return topic && VALID_TOPICS.includes(topic as LibraryTopic)
      ? (topic as LibraryTopic)
      : 'all'
  }, [searchParams])

  const selectedDifficulty = useMemo((): LibraryDifficulty | 'all' => {
    const difficulty = searchParams.get('difficulty')
    return difficulty && VALID_DIFFICULTIES.includes(difficulty as LibraryDifficulty)
      ? (difficulty as LibraryDifficulty)
      : 'all'
  }, [searchParams])

  const searchQuery = searchParams.get('search') || ''
  const showBookmarkedOnly = searchParams.get('bookmarked') === 'true'

  // Helper to update URL params (pushes to history so back/forward works)
  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })

    // Push to history (not replace) so users can navigate back through filter states
    setSearchParams(newParams)
  }, [searchParams, setSearchParams])

  // Filter setters that update URL params
  const setSelectedType = useCallback((type: LibraryResourceType | 'all') => {
    updateParams({ type: type === 'all' ? null : type })
  }, [updateParams])

  const setSelectedTopic = useCallback((topic: LibraryTopic | 'all') => {
    updateParams({ topic: topic === 'all' ? null : topic })
  }, [updateParams])

  const setSelectedDifficulty = useCallback((difficulty: LibraryDifficulty | 'all') => {
    updateParams({ difficulty: difficulty === 'all' ? null : difficulty })
  }, [updateParams])

  const setSearchQuery = useCallback((search: string) => {
    updateParams({ search: search || null })
  }, [updateParams])

  const setShowBookmarkedOnly = useCallback((bookmarked: boolean) => {
    updateParams({ bookmarked: bookmarked ? 'true' : null })
  }, [updateParams])

  // Fetch resources from API
  const { data: resources = [], isLoading, error } = useLibraryResources({
    type: selectedType !== 'all' ? selectedType : undefined,
    topic: selectedTopic !== 'all' ? selectedTopic : undefined,
    difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
    search: searchQuery || undefined,
  })

  // Client-side filter for bookmarks (since API doesn't filter by bookmarks)
  const filteredResources = useMemo(() => {
    if (!showBookmarkedOnly) {
      return resources
    }
    return resources.filter((resource: LibraryResourceWithUserData) => resource.isBookmarked)
  }, [resources, showBookmarkedOnly])

  // Check if any filters are active
  const hasActiveFilters =
    selectedType !== 'all' ||
    selectedTopic !== 'all' ||
    selectedDifficulty !== 'all' ||
    searchQuery !== '' ||
    showBookmarkedOnly

  // Featured resources (only when no filters active)
  const featuredResources = useMemo(() => {
    if (hasActiveFilters) {
      return []
    }
    return resources.filter((resource: LibraryResourceWithUserData) => resource.isFeatured)
  }, [resources, hasActiveFilters])

  // Clear all filters by resetting URL params
  const handleClearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <svg
            className="w-16 h-16 mx-auto text-red-400 dark:text-red-500 mb-4"
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
          <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
            Failed to load resources
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Library</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Curated resources for learning AI agent development
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <LibraryFilters
          selectedType={selectedType}
          selectedTopic={selectedTopic}
          selectedDifficulty={selectedDifficulty}
          searchQuery={searchQuery}
          showBookmarkedOnly={showBookmarkedOnly}
          onTypeChange={setSelectedType}
          onTopicChange={setSelectedTopic}
          onDifficultyChange={setSelectedDifficulty}
          onSearchChange={setSearchQuery}
          onBookmarkedChange={setShowBookmarkedOnly}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Featured Section - only show when no filters active */}
      {!hasActiveFilters && featuredResources.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-amber-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Featured Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.map((resource: LibraryResourceWithUserData) => (
              <LibraryResourceCard key={resource.id} resource={resource} showUserData />
            ))}
          </div>
        </div>
      )}

      {/* All Resources */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {hasActiveFilters ? 'Filtered Results' : 'All Resources'}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource: LibraryResourceWithUserData) => (
              <LibraryResourceCard key={resource.id} resource={resource} showUserData />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No resources found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {showBookmarkedOnly
                ? "You haven't bookmarked any resources yet."
                : "Try adjusting your filters to find what you're looking for."}
            </p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
