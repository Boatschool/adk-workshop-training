/**
 * Library Filters Component
 * Filter controls for library resources by type, topic, difficulty, search, and bookmarks
 */

import { cn } from '@utils/cn'
import type { LibraryResourceType, LibraryTopic, LibraryDifficulty } from '@/types/models'

interface LibraryFiltersProps {
  selectedType: LibraryResourceType | 'all'
  selectedTopic: LibraryTopic | 'all'
  selectedDifficulty: LibraryDifficulty | 'all'
  searchQuery: string
  showBookmarkedOnly: boolean
  onTypeChange: (type: LibraryResourceType | 'all') => void
  onTopicChange: (topic: LibraryTopic | 'all') => void
  onDifficultyChange: (difficulty: LibraryDifficulty | 'all') => void
  onSearchChange: (query: string) => void
  onBookmarkedChange: (showBookmarked: boolean) => void
  onClearFilters: () => void
}

// Resource type options
const typeOptions: { value: LibraryResourceType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'article', label: 'Articles' },
  { value: 'video', label: 'Videos' },
  { value: 'documentation', label: 'Docs' },
  { value: 'course', label: 'Courses' },
  { value: 'tool', label: 'Tools' },
  { value: 'pdf', label: 'PDFs' },
]

// Topic options
const topicOptions: { value: LibraryTopic | 'all'; label: string }[] = [
  { value: 'all', label: 'All Topics' },
  { value: 'agent-fundamentals', label: 'Agent Fundamentals' },
  { value: 'prompt-engineering', label: 'Prompt Engineering' },
  { value: 'multi-agent-systems', label: 'Multi-Agent Systems' },
  { value: 'tools-integrations', label: 'Tools & Integrations' },
  { value: 'deployment', label: 'Deployment' },
  { value: 'best-practices', label: 'Best Practices' },
]

// Difficulty options
const difficultyOptions: { value: LibraryDifficulty | 'all'; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export function LibraryFilters({
  selectedType,
  selectedTopic,
  selectedDifficulty,
  searchQuery,
  showBookmarkedOnly,
  onTypeChange,
  onTopicChange,
  onDifficultyChange,
  onSearchChange,
  onBookmarkedChange,
  onClearFilters,
}: LibraryFiltersProps) {
  const hasActiveFilters =
    selectedType !== 'all' ||
    selectedTopic !== 'all' ||
    selectedDifficulty !== 'all' ||
    searchQuery !== '' ||
    showBookmarkedOnly

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Type filter - horizontal buttons */}
      <div className="flex flex-wrap gap-2">
        {typeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onTypeChange(option.value)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              selectedType === option.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Topic and Difficulty dropdowns + Bookmarks toggle + Clear button */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Topic dropdown */}
        <div className="relative">
          <select
            value={selectedTopic}
            onChange={(e) => onTopicChange(e.target.value as LibraryTopic | 'all')}
            className={cn(
              'appearance-none pl-3 pr-8 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer',
              selectedTopic !== 'all'
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
            )}
          >
            {topicOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Difficulty dropdown */}
        <div className="relative">
          <select
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value as LibraryDifficulty | 'all')}
            className={cn(
              'appearance-none pl-3 pr-8 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer',
              selectedDifficulty !== 'all'
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
            )}
          >
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Bookmarks toggle */}
        <button
          onClick={() => onBookmarkedChange(!showBookmarkedOnly)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
            showBookmarkedOnly
              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
          )}
        >
          <svg
            className={cn('w-4 h-4', showBookmarkedOnly && 'fill-current')}
            viewBox="0 0 24 24"
            fill={showBookmarkedOnly ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.536A.5.5 0 014 22.143V3a1 1 0 011-1z" />
          </svg>
          Bookmarked
        </button>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
