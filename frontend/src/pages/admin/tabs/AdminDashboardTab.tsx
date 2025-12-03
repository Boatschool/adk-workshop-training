/**
 * Admin Dashboard Tab
 * Platform overview with statistics, health indicators, and recent activity
 */

import { useAdminStats } from '@hooks/useAdminStats'
import { cn } from '@utils/cn'

// Stat card component
interface StatCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ReactNode
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  loading?: boolean
}

function StatCard({ title, value, subtitle, icon, trend, loading }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.positive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <div className="w-6 h-6 text-primary-600 dark:text-primary-400">{icon}</div>
        </div>
      </div>
    </div>
  )
}

// Health status indicator
interface HealthIndicatorProps {
  label: string
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  description?: string
}

function HealthIndicator({ label, status, description }: HealthIndicatorProps) {
  const statusConfig = {
    healthy: {
      color: 'bg-green-500',
      text: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      label: 'Healthy',
    },
    degraded: {
      color: 'bg-yellow-500',
      text: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      label: 'Degraded',
    },
    unhealthy: {
      color: 'bg-red-500',
      text: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      label: 'Unhealthy',
    },
    unknown: {
      color: 'bg-gray-400',
      text: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      label: 'Unknown',
    },
  }

  const config = statusConfig[status]

  return (
    <div className={cn('p-4 rounded-lg', config.bgColor)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('w-3 h-3 rounded-full', config.color)} />
          <span className="font-medium text-gray-900 dark:text-white">{label}</span>
        </div>
        <span className={cn('text-sm font-medium', config.text)}>{config.label}</span>
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 ml-6">{description}</p>
      )}
    </div>
  )
}

// Icons
function UsersIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

export function AdminDashboardTab() {
  const { data: stats, isLoading, error } = useAdminStats()

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
          Failed to load dashboard
        </h3>
        <p className="mt-2 text-red-600 dark:text-red-300">
          Unable to fetch platform statistics. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Platform Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats?.users.total ?? 0}
            subtitle={`${stats?.users.active ?? 0} active`}
            icon={<UsersIcon />}
            trend={stats?.users.newThisWeek ? {
              value: stats.users.newThisWeek,
              label: 'new this week',
              positive: true,
            } : undefined}
            loading={isLoading}
          />
          <StatCard
            title="Organizations"
            value={stats?.organizations.total ?? 0}
            subtitle={`${stats?.organizations.active ?? 0} active`}
            icon={<BuildingIcon />}
            loading={isLoading}
          />
          <StatCard
            title="Library Resources"
            value={stats?.content.libraryResources ?? 0}
            subtitle={`${stats?.content.featuredResources ?? 0} featured`}
            icon={<BookIcon />}
            loading={isLoading}
          />
          <StatCard
            title="Guides"
            value={stats?.content.guides ?? 0}
            subtitle={`${stats?.content.publishedGuides ?? 0} published`}
            icon={<DocumentIcon />}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Activity Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Logins Today"
            value={stats?.activity.loginsToday ?? 0}
            icon={<ActivityIcon />}
            loading={isLoading}
          />
          <StatCard
            title="Active Sessions"
            value={stats?.activity.activeSessions ?? 0}
            icon={<UsersIcon />}
            loading={isLoading}
          />
          <StatCard
            title="API Requests (24h)"
            value={stats?.activity.apiRequests24h ?? 0}
            icon={<ActivityIcon />}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Platform Health */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Platform Health
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <HealthIndicator
                label="API Server"
                status={stats?.health.api ?? 'unknown'}
                description="FastAPI backend service"
              />
              <HealthIndicator
                label="Database"
                status={stats?.health.database ?? 'unknown'}
                description="PostgreSQL database connection"
              />
              <HealthIndicator
                label="External Services"
                status={stats?.health.externalServices ?? 'unknown'}
                description="Third-party integrations (Google ADK, etc.)"
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Create User"
            description="Add a new user to the platform"
            icon={<UsersIcon />}
            onClick={() => {
              // Navigate to users tab - will be handled by parent
              const params = new URLSearchParams(window.location.search)
              params.set('tab', 'users')
              window.history.pushState({}, '', `${window.location.pathname}?${params}`)
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
          />
          <QuickActionCard
            title="Add Guide"
            description="Create new documentation"
            icon={<DocumentIcon />}
            onClick={() => {
              const params = new URLSearchParams(window.location.search)
              params.set('tab', 'guides')
              window.history.pushState({}, '', `${window.location.pathname}?${params}`)
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
          />
          <QuickActionCard
            title="Add Resource"
            description="Add to the library"
            icon={<BookIcon />}
            onClick={() => {
              const params = new URLSearchParams(window.location.search)
              params.set('tab', 'library')
              window.history.pushState({}, '', `${window.location.pathname}?${params}`)
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
          />
          <QuickActionCard
            title="View Logs"
            description="Check system activity"
            icon={<ActivityIcon />}
            href="/logs"
            disabled
          />
        </div>
      </div>
    </div>
  )
}

// Quick action card component
interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick?: () => void
  href?: string
  disabled?: boolean
}

function QuickActionCard({ title, description, icon, onClick, disabled }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-left transition-all',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md cursor-pointer'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="w-5 h-5 text-gray-600 dark:text-gray-400">{icon}</div>
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          {disabled && (
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">Coming soon</span>
          )}
        </div>
      </div>
    </button>
  )
}
