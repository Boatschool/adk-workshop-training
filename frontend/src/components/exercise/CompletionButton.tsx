/**
 * Completion Button Component
 * Button to mark an exercise as complete
 */

import { useState } from 'react'
import { cn } from '@utils/cn'
import { useUIStore } from '@stores/uiStore'

interface CompletionButtonProps {
  exerciseId: string
  isCompleted: boolean
  onComplete?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function CompletionButton({
  exerciseId: _exerciseId,
  isCompleted: initialCompleted,
  onComplete,
  size = 'md',
}: CompletionButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useUIStore()

  const handleClick = async () => {
    if (isCompleted || isLoading) return

    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      // await api.post(`/api/v1/progress/exercises/${_exerciseId}/complete`)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      setIsCompleted(true)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Exercise marked as complete!',
      })
      onComplete?.()
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to mark as complete',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      onClick={handleClick}
      disabled={isCompleted || isLoading}
      className={cn(
        'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200',
        sizeStyles[size],
        isCompleted
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default'
          : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow',
        isLoading && 'opacity-70 cursor-wait'
      )}
    >
      {isLoading ? (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {isCompleted ? 'Completed' : 'Mark as Complete'}
    </button>
  )
}
