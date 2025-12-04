/**
 * Content Pillar Card Component
 * Displays a content category (Workshops, Guides, Library) with preview items
 */

import { Link } from 'react-router-dom'
import { cn } from '@utils/cn'

interface PreviewItem {
  title: string
  href: string
}

interface ContentPillarCardProps {
  icon: React.ReactNode
  title: string
  description: string
  count: number
  countLabel?: string
  previewItems: PreviewItem[]
  href: string
  ctaLabel: string
  className?: string
}

export function ContentPillarCard({
  icon,
  title,
  description,
  count,
  countLabel = 'items',
  previewItems,
  href,
  ctaLabel,
  className,
}: ContentPillarCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full',
        'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200',
        className
      )}
    >
      {/* Header */}
      <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {title}
            </h3>
          </div>
          <span className="flex-shrink-0 px-2.5 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
            {count}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      {/* Preview Items */}
      <div className="flex-1 px-5 py-4">
        <ul className="space-y-2">
          {previewItems.slice(0, 3).map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-primary-500 transition-colors" />
                <span className="truncate">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {count} {countLabel}
          </span>
          <Link
            to={href}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            {ctaLabel}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
