/**
 * StatusBadge Component
 * Visual indicator for various status types
 */

import { cn } from '@utils/cn'

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

export interface StatusBadgeProps {
  label: string
  variant?: StatusVariant
  size?: 'sm' | 'md'
  dot?: boolean
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

const dotStyles: Record<StatusVariant, string> = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-gray-500',
}

export function StatusBadge({
  label,
  variant = 'neutral',
  size = 'sm',
  dot = false,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantStyles[variant],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      )}
    >
      {dot && (
        <span
          className={cn(
            'mr-1.5 rounded-full',
            dotStyles[variant],
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
          )}
        />
      )}
      {label}
    </span>
  )
}

// Helper function to map common status values to variants
// eslint-disable-next-line react-refresh/only-export-components
export function getStatusVariant(status: string): StatusVariant {
  const statusMap: Record<string, StatusVariant> = {
    // User statuses
    active: 'success',
    inactive: 'neutral',
    suspended: 'error',
    pending: 'warning',

    // Tenant statuses
    trial: 'info',

    // Generic
    enabled: 'success',
    disabled: 'neutral',
    error: 'error',
    warning: 'warning',
  }

  return statusMap[status.toLowerCase()] ?? 'neutral'
}

// Helper function to map role values to variants
// eslint-disable-next-line react-refresh/only-export-components
export function getRoleVariant(role: string): StatusVariant {
  const roleMap: Record<string, StatusVariant> = {
    super_admin: 'error',
    tenant_admin: 'warning',
    instructor: 'info',
    participant: 'neutral',
  }

  return roleMap[role.toLowerCase()] ?? 'neutral'
}
