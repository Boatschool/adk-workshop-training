/**
 * BulkActionsBar Component
 * Action toolbar that appears when items are selected in a table
 */

import { type ReactNode } from 'react'
import { cn } from '@utils/cn'

export interface BulkAction {
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

export interface BulkActionsBarProps {
  selectedCount: number
  actions: BulkAction[]
  onClearSelection: () => void
}

export function BulkActionsBar({
  selectedCount,
  actions,
  onClearSelection,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg p-3 mb-4 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
          >
            Clear selection
          </button>
        </div>
        <div className="flex items-center gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                action.variant === 'danger'
                  ? 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900'
                  : 'text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/50 hover:bg-primary-200 dark:hover:bg-primary-900'
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
