/**
 * News Detail Page
 * Displays a single news article with full content
 */

import { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useNewsDetail } from '@hooks/useNews'

// Format date
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Back arrow icon
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

// External link icon
const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

export function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: news, isLoading, error } = useNewsDetail(id || '')

  // Redirect to news list if no ID
  useEffect(() => {
    if (!id) {
      navigate('/news', { replace: true })
    }
  }, [id, navigate])

  // For external news, redirect to the source
  useEffect(() => {
    if (news?.isExternal && news?.sourceUrl) {
      window.location.href = news.sourceUrl
    }
  }, [news])

  // Invalid ID - show nothing while redirecting
  if (!id) {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  // Error or not found
  if (error || !news) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-8"
        >
          <BackIcon />
          Back to News
        </Link>
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-gray-600 dark:text-gray-400">
            News article not found.
          </p>
        </div>
      </div>
    )
  }

  // For external news, show redirecting message while useEffect handles redirect
  if (news.isExternal && news.sourceUrl) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600 dark:text-gray-400">
          Redirecting to external source...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        to="/news"
        className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-8"
      >
        <BackIcon />
        Back to News
      </Link>

      {/* Article */}
      <article>
        {/* Header */}
        <header className="mb-8">
          {/* Source badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full">
              {news.source}
            </span>
            {news.sourceUrl && (
              <a
                href={news.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                View original
                <ExternalLinkIcon />
              </a>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {news.title}
          </h1>

          {/* Date */}
          <time className="text-gray-500 dark:text-gray-400">
            {formatDate(news.publishedAt)}
          </time>
        </header>

        {/* Excerpt */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-primary-500">
          <p className="text-lg text-gray-700 dark:text-gray-300 italic">
            {news.excerpt}
          </p>
        </div>

        {/* Content */}
        {news.content ? (
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-gray-600 dark:text-gray-400">
              Full article content is not available.
            </p>
            {news.sourceUrl && (
              <a
                href={news.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Read at {news.source}
                <ExternalLinkIcon />
              </a>
            )}
          </div>
        )}
      </article>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          <BackIcon />
          Back to all news
        </Link>
      </footer>
    </div>
  )
}
