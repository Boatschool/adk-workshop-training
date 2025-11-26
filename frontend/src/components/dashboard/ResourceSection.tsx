/**
 * Resource Section Component
 * Displays categorized resources (guides, exercises, examples)
 */

import { Link } from 'react-router-dom'
import { cn } from '@utils/cn'

interface Resource {
  title: string
  href: string
  icon: React.ReactNode
  completed?: boolean
}

interface ResourceSectionProps {
  icon: React.ReactNode
  title: string
  count: number
  resources: Resource[]
  className?: string
}

export function ResourceSection({
  icon,
  title,
  count,
  resources,
  className,
}: ResourceSectionProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden',
        className
      )}
    >
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <span className="text-gray-500 dark:text-gray-400">{icon}</span>
        <h3 className="font-semibold text-gray-900 dark:text-white flex-1">
          {title}
        </h3>
        <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
          {count}
        </span>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {resources.map((resource) => (
          <li key={resource.href}>
            <Link
              to={resource.href}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span className="text-gray-400 dark:text-gray-500">
                {resource.icon}
              </span>
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                {resource.title}
              </span>
              {resource.completed && (
                <span className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
