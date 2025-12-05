/**
 * Dashboard Search Bar Component
 * Search input with popular tags for quick filtering
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@utils/cn'

const POPULAR_TAGS = [
  { label: 'prompt engineering', query: 'prompt-engineering' },
  { label: 'multi-agent', query: 'multi-agent-systems' },
  { label: 'tools', query: 'tools-integrations' },
  { label: 'deployment', query: 'deployment' },
]

interface SearchBarProps {
  className?: string
}

export function SearchBar({ className }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (searchQuery.trim()) {
        navigate(`/library?search=${encodeURIComponent(searchQuery.trim())}`)
      }
    },
    [searchQuery, navigate]
  )

  const handleTagClick = useCallback(
    (topic: string) => {
      navigate(`/library?topic=${topic}`)
    },
    [navigate]
  )

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
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
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search guides, workshops, and resources..."
          className={cn(
            'w-full pl-12 pr-4 py-3 text-base',
            'bg-gray-50 dark:bg-gray-800/50',
            'border border-gray-200 dark:border-gray-700',
            'rounded-xl',
            'text-gray-900 dark:text-white',
            'placeholder-gray-400 dark:placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-all duration-200'
          )}
          aria-label="Search content"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-12 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        <button
          type="submit"
          className={cn(
            'absolute inset-y-0 right-0 pr-4 flex items-center',
            'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300',
            'transition-colors'
          )}
          aria-label="Submit search"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </form>

      {/* Popular Tags */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-500 dark:text-gray-400">Popular:</span>
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag.query}
            onClick={() => handleTagClick(tag.query)}
            className={cn(
              'px-2.5 py-1 rounded-full',
              'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
              'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
              'transition-colors duration-200'
            )}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  )
}
