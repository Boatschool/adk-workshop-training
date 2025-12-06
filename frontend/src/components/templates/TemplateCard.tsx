/**
 * TemplateCard Component
 * Displays an agent template in a card format for the template library grid
 */

import { Link } from 'react-router-dom'
import type { AgentTemplateItem } from '@/types/models'
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from '@/services/templates'

interface TemplateCardProps {
  template: AgentTemplateItem
  isBookmarked?: boolean
  onBookmarkToggle?: (id: string) => void
}

// Inline SVG icons
const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const BookmarkIcon = ({ className, filled }: { className?: string; filled?: boolean }) => (
  <svg className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
)

const WrenchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

export function TemplateCard({
  template,
  isBookmarked = false,
  onBookmarkToggle,
}: TemplateCardProps) {
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onBookmarkToggle?.(template.id)
  }

  return (
    <Link
      to={`/templates/${template.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 relative"
    >
      {/* Featured badge */}
      {template.featured && (
        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-bl rounded-tr-lg">
          Featured
        </div>
      )}

      <div className="p-5">
        {/* Header with category and bookmark */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            {CATEGORY_LABELS[template.category]}
          </span>
          <button
            onClick={handleBookmarkClick}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <BookmarkIcon
              className={`w-5 h-5 ${isBookmarked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              filled={isBookmarked}
            />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {template.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{template.description}</p>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {template.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                +{template.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Metadata row */}
        <div className="flex items-center gap-3 mb-4">
          {/* Difficulty badge */}
          <span
            className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${DIFFICULTY_COLORS[template.difficulty]}`}
          >
            {DIFFICULTY_LABELS[template.difficulty]}
          </span>

          {/* Model */}
          {template.model && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{template.model}</span>
          )}

          {/* Features icons */}
          <div className="flex items-center gap-1 ml-auto">
            {template.hasTools && (
              <span title="Uses tools" className="text-gray-400 dark:text-gray-500">
                <WrenchIcon className="w-4 h-4" />
              </span>
            )}
            {template.hasSubAgents && (
              <span title="Multi-agent" className="text-gray-400 dark:text-gray-500">
                <UsersIcon className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">by {template.authorName}</span>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <DownloadIcon className="w-3.5 h-3.5" />
            <span>{template.downloadCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
