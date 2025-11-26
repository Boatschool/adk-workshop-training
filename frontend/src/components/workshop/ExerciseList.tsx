/**
 * Exercise List Component
 * Displays exercises within a workshop with completion status
 */

import { Link } from 'react-router-dom'
import { cn } from '@utils/cn'
import type { Exercise } from '@/types/models'

interface ExerciseListProps {
  exercises: Exercise[]
  completedIds?: string[]
}

export function ExerciseList({ exercises, completedIds = [] }: ExerciseListProps) {
  return (
    <div className="space-y-3">
      {exercises.map((exercise, index) => {
        const isCompleted = completedIds.includes(exercise.id)

        return (
          <Link
            key={exercise.id}
            to={`/exercises/${exercise.id}`}
            className={cn(
              'flex items-center gap-4 p-4 rounded-lg border transition-all duration-200',
              isCompleted
                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
            )}
          >
            <div
              className={cn(
                'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                isCompleted
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}
            >
              {isCompleted ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {exercise.title}
              </h4>
              {exercise.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {exercise.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {exercise.estimated_minutes && (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {exercise.estimated_minutes} min
                </span>
              )}
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-primary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
