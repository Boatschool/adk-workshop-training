/**
 * BookmarkButton Component
 * Toggle button for bookmarking library resources
 */

import { cn } from '@utils/cn'
import { useToggleBookmark } from '@hooks/useLibrary'
import { useUIStore } from '@stores/uiStore'

interface BookmarkButtonProps {
  resourceId: string
  isBookmarked: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showLabel?: boolean
}

export function BookmarkButton({
  resourceId,
  isBookmarked,
  size = 'md',
  className,
  showLabel = false,
}: BookmarkButtonProps) {
  const { mutate: toggleBookmark, isPending } = useToggleBookmark()
  const { addToast } = useUIStore()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    toggleBookmark(resourceId, {
      onSuccess: (result) => {
        addToast({
          type: 'success',
          title: result.is_bookmarked ? 'Added to bookmarks' : 'Removed from bookmarks',
          duration: 2000,
        })
      },
      onError: () => {
        addToast({
          type: 'error',
          title: 'Failed to update bookmark',
          duration: 3000,
        })
      },
    })
  }

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg transition-all duration-200',
        'hover:bg-gray-100 dark:hover:bg-gray-700',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        className
      )}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {isBookmarked ? (
        <svg
          className={cn(iconSizes[size], 'text-primary-500 fill-current')}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.536A.5.5 0 014 22.143V3a1 1 0 011-1z" />
        </svg>
      ) : (
        <svg
          className={cn(iconSizes[size], 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300')}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 2h14a1 1 0 011 1v19.143a.5.5 0 01-.766.424L12 18.03l-7.234 4.536A.5.5 0 014 22.143V3a1 1 0 011-1z" />
        </svg>
      )}
      {showLabel && (
        <span
          className={cn(
            'text-sm font-medium',
            isBookmarked
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </button>
  )
}
