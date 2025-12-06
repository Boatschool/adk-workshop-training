/**
 * TemplateFilters Component
 * Filter controls for the template library
 */

import type { TemplateCategory, TemplateDifficulty } from '@/types/models'
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/services/templates'

interface TemplateFiltersProps {
  search: string
  category: TemplateCategory | ''
  difficulty: TemplateDifficulty | ''
  featuredOnly: boolean
  onSearchChange: (value: string) => void
  onCategoryChange: (value: TemplateCategory | '') => void
  onDifficultyChange: (value: TemplateDifficulty | '') => void
  onFeaturedOnlyChange: (value: boolean) => void
  onClearFilters: () => void
}

// Inline SVG icons
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export function TemplateFilters({
  search,
  category,
  difficulty,
  featuredOnly,
  onSearchChange,
  onCategoryChange,
  onDifficultyChange,
  onFeaturedOnlyChange,
  onClearFilters,
}: TemplateFiltersProps) {
  const hasActiveFilters = search || category || difficulty || featuredOnly

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="w-full lg:w-48">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as TemplateCategory | '')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty filter */}
        <div className="w-full lg:w-40">
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value as TemplateDifficulty | '')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Levels</option>
            {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Featured only toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => onFeaturedOnlyChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Featured only</span>
          </label>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XIcon className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
