/**
 * News List Page
 * Displays all healthcare AI news with pagination
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNews } from '@hooks/useNews'
import { cn } from '@utils/cn'

// Format relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// External link icon
const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

// News icon
const NewsIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
  </svg>
)

export function NewsListPage() {
  const [page, setPage] = useState(1)
  const pageSize = 12
  const { data, isLoading, error } = useNews(page, pageSize, false)

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-primary-500">
              <NewsIcon />
            </span>
            AI in Healthcare News
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Stay updated with the latest developments in AI for healthcare
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
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
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">
            Failed to load news. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  // Empty state
  if (!data || data.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-primary-500">
              <NewsIcon />
            </span>
            AI in Healthcare News
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Stay updated with the latest developments in AI for healthcare
          </p>
        </div>
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <NewsIcon />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            No news articles available yet. Check back soon!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-primary-500">
            <NewsIcon />
          </span>
          AI in Healthcare News
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Stay updated with the latest developments in AI for healthcare
        </p>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.items.map((news) => {
          const cardContent = (
            <div className="p-5 h-full flex flex-col">
              {/* Meta */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">
                  {news.source}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatRelativeTime(news.publishedAt)}
                </span>
                {news.isExternal && (
                  <span className="text-gray-400 dark:text-gray-500">
                    <ExternalLinkIcon />
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
                {news.title}
              </h2>

              {/* Excerpt */}
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 flex-grow">
                {news.excerpt}
              </p>

              {/* Read more */}
              <div className="mt-4 flex items-center text-sm font-medium text-primary-600 dark:text-primary-400">
                Read more
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )

          const cardClassName = cn(
            'group bg-white dark:bg-gray-800 rounded-xl',
            'border border-gray-100 dark:border-gray-700',
            'shadow-sm hover:shadow-lg transition-all duration-200',
            'flex flex-col'
          )

          // External news opens in new tab
          if (news.isExternal && news.sourceUrl) {
            return (
              <a
                key={news.id}
                href={news.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClassName}
              >
                {cardContent}
              </a>
            )
          }

          // Internal news links to detail page
          return (
            <Link key={news.id} to={`/news/${news.id}`} className={cardClassName}>
              {cardContent}
            </Link>
          )
        })}
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              page === 1
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            )}
          >
            Previous
          </button>

          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {data.pages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              page === data.pages
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            )}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
