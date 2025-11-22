/**
 * Quick Start Card Component
 * Action cards for getting started quickly
 */

import { Link } from 'react-router-dom'
import { cn } from '@utils/cn'

interface QuickStartCardProps {
  number: number
  icon: React.ReactNode
  title: string
  description: string
  href: string
  timeEstimate?: string
  recommended?: boolean
  variant?: 'primary' | 'secondary' | 'tertiary'
}

export function QuickStartCard({
  number,
  icon,
  title,
  description,
  href,
  timeEstimate,
  recommended = false,
  variant = 'primary',
}: QuickStartCardProps) {
  const variantStyles = {
    primary: 'border-primary-200 dark:border-primary-800 hover:border-primary-400',
    secondary: 'border-accent-200 dark:border-accent-800 hover:border-accent-400',
    tertiary: 'border-gray-200 dark:border-gray-700 hover:border-gray-400',
  }

  const isExternal = href.startsWith('http')

  const CardContent = (
    <>
      {recommended && (
        <span className="absolute -top-3 left-4 px-2 py-1 text-xs font-medium bg-primary-500 text-white rounded-full">
          Recommended First
        </span>
      )}
      <div className="absolute top-4 right-4 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400">
        {number}
      </div>
      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
        {description}
      </p>
      {timeEstimate && (
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {timeEstimate}
        </div>
      )}
      <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300">
        Get Started
        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </>
  )

  const cardClasses = cn(
    'group relative bg-white dark:bg-gray-800 rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg flex flex-col',
    variantStyles[variant]
  )

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClasses}
      >
        {CardContent}
      </a>
    )
  }

  return (
    <Link to={href} className={cardClasses}>
      {CardContent}
    </Link>
  )
}
