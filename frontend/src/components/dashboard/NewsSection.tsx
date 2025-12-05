/**
 * News Section Component
 * Displays healthcare AI news and announcements on the dashboard
 */

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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// News icon
const NewsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
  </svg>
)

// External link icon
const ExternalLinkIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

interface NewsSectionProps {
  className?: string
}

export function NewsSection({ className }: NewsSectionProps) {
  const { data, isLoading, error } = useNews(1, 4, false)

  // Loading state
  if (isLoading) {
    return (
      <section className={cn('mb-8', className)} aria-labelledby="news-heading">
        <div className="flex items-center justify-between mb-4">
          <h2
            id="news-heading"
            className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2"
          >
            <span className="text-primary-500">
              <NewsIcon />
            </span>
            AI in Healthcare News
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </section>
    )
  }

  // Error state or no news
  if (error || !data || data.items.length === 0) {
    return null
  }

  return (
    <section className={cn('mb-8', className)} aria-labelledby="news-heading">
      <div className="flex items-center justify-between mb-4">
        <h2
          id="news-heading"
          className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <span className="text-primary-500">
            <NewsIcon />
          </span>
          AI in Healthcare News
        </h2>
        <Link
          to="/news"
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center gap-1"
        >
          View All
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.items.map((news) => {
          const cardContent = (
            <div className="p-4 h-full flex gap-4">
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {news.source}
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatRelativeTime(news.publishedAt)}
                  </span>
                  {news.isExternal && (
                    <span className="text-gray-400 dark:text-gray-500">
                      <ExternalLinkIcon />
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {news.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                  {news.excerpt}
                </p>
              </div>
            </div>
          )

          const cardClassName = cn(
            'group bg-white dark:bg-gray-800 rounded-xl',
            'border border-gray-100 dark:border-gray-700',
            'shadow-sm hover:shadow-md transition-all duration-200'
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
    </section>
  )
}
