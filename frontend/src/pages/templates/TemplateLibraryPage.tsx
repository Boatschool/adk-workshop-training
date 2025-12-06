/**
 * TemplateLibraryPage
 * Browse and search agent templates
 */

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { TemplateCard, TemplateFilters } from '@/components/templates'
import {
  getTemplates,
  getFeaturedTemplates,
  toggleTemplateBookmark,
} from '@/services/templates'
import type {
  AgentTemplateItem,
  TemplateCategory,
  TemplateDifficulty,
} from '@/types/models'

// Inline SVG icons
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const LoaderIcon = ({ className }: { className?: string }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
)

export function TemplateLibraryPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter state from URL params
  const search = searchParams.get('search') || ''
  const category = (searchParams.get('category') || '') as TemplateCategory | ''
  const difficulty = (searchParams.get('difficulty') || '') as TemplateDifficulty | ''
  const featuredOnly = searchParams.get('featured') === 'true'

  // Data state
  const [templates, setTemplates] = useState<AgentTemplateItem[]>([])
  const [featuredTemplates, setFeaturedTemplates] = useState<AgentTemplateItem[]>([])
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user can submit templates (instructor or higher)
  const canSubmit = user && ['instructor', 'tenant_admin', 'super_admin'].includes(user.role)

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = {
        search: search || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
        featured: featuredOnly || undefined,
      }

      const [templatesData, featuredData] = await Promise.all([
        getTemplates(params),
        !search && !category && !difficulty && !featuredOnly
          ? getFeaturedTemplates(6)
          : Promise.resolve([]),
      ])

      setTemplates(templatesData)
      setFeaturedTemplates(featuredData)
    } catch (err) {
      setError('Failed to load templates. Please try again.')
      console.error('Error fetching templates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [search, category, difficulty, featuredOnly])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Filter handlers
  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    setSearchParams(newParams)
  }

  const handleSearchChange = (value: string) => {
    updateSearchParams({ search: value || undefined })
  }

  const handleCategoryChange = (value: TemplateCategory | '') => {
    updateSearchParams({ category: value || undefined })
  }

  const handleDifficultyChange = (value: TemplateDifficulty | '') => {
    updateSearchParams({ difficulty: value || undefined })
  }

  const handleFeaturedOnlyChange = (value: boolean) => {
    updateSearchParams({ featured: value ? 'true' : undefined })
  }

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  // Bookmark handler
  const handleBookmarkToggle = async (id: string) => {
    try {
      const result = await toggleTemplateBookmark(id)
      setBookmarkedIds((prev) => {
        const newSet = new Set(prev)
        if (result.isBookmarked) {
          newSet.add(id)
        } else {
          newSet.delete(id)
        }
        return newSet
      })
    } catch (err) {
      console.error('Error toggling bookmark:', err)
    }
  }

  const hasFilters = search || category || difficulty || featuredOnly
  const showFeaturedSection = !hasFilters && featuredTemplates.length > 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Templates</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Browse and download pre-built agent configurations for your workshops
          </p>
        </div>
        {canSubmit && (
          <Link
            to="/templates/submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Submit Template
          </Link>
        )}
      </div>

      {/* Filters */}
      <TemplateFilters
        search={search}
        category={category}
        difficulty={difficulty}
        featuredOnly={featuredOnly}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onDifficultyChange={handleDifficultyChange}
        onFeaturedOnlyChange={handleFeaturedOnlyChange}
        onClearFilters={handleClearFilters}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoaderIcon className="w-8 h-8 text-blue-600" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Featured section */}
          {showFeaturedSection && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Featured Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isBookmarked={bookmarkedIds.has(template.id)}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All templates */}
          <div>
            {showFeaturedSection && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Templates</h2>
            )}

            {templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isBookmarked={bookmarkedIds.has(template.id)}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">
                  {hasFilters
                    ? 'No templates match your filters. Try adjusting your search.'
                    : 'No templates available yet.'}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
