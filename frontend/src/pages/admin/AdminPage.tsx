/**
 * Admin Page
 * Unified admin interface with tabbed navigation
 * Tabs: Dashboard, Users, Organizations, Guides, Library
 */

import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import { cn } from '@utils/cn'

// Import tab content components
import { AdminDashboardTab } from './tabs/AdminDashboardTab'
import { AdminUsersTab } from './tabs/AdminUsersTab'
import { AdminOrganizationsTab } from './tabs/AdminOrganizationsTab'
import { AdminGuidesTab } from './tabs/AdminGuidesTab'
import { AdminLibraryTab } from './tabs/AdminLibraryTab'
import { AdminTemplatesTab } from './tabs/AdminTemplatesTab'
import { AdminAnnouncementsTab } from './tabs/AdminAnnouncementsTab'

// Tab definitions
const tabs = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    requiredRole: 'super_admin' as const, // Stats include cross-tenant data
  },
  {
    id: 'users',
    label: 'Users',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    requiredRole: 'tenant_admin' as const,
  },
  {
    id: 'organizations',
    label: 'Organizations',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    requiredRole: 'super_admin' as const,
  },
  {
    id: 'guides',
    label: 'Guides',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    requiredRole: 'super_admin' as const,
  },
  {
    id: 'library',
    label: 'Library',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    requiredRole: 'super_admin' as const,
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    requiredRole: 'super_admin' as const,
  },
  {
    id: 'announcements',
    label: "What's New",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    requiredRole: 'super_admin' as const,
  },
]

// Role hierarchy for permission checks
const roleHierarchy: Record<string, number> = {
  participant: 0,
  instructor: 1,
  tenant_admin: 2,
  super_admin: 3,
}

export function AdminPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter tabs based on user role
  const availableTabs = useMemo(() => {
    if (!user?.role) return []
    const userRoleLevel = roleHierarchy[user.role] || 0
    return tabs.filter(tab => userRoleLevel >= roleHierarchy[tab.requiredRole])
  }, [user?.role])

  // Get active tab from URL or default to first available tab
  // For super_admin: dashboard, for tenant_admin: users
  const defaultTab = availableTabs.length > 0 ? availableTabs[0].id : 'users'
  const activeTab = searchParams.get('tab') || defaultTab

  // Check if user has any admin access
  const hasAdminAccess = user?.role === 'tenant_admin' || user?.role === 'super_admin'

  if (!hasAdminAccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
            Access Denied
          </h2>
          <p className="mt-2 text-red-600 dark:text-red-300">
            You don't have permission to access the admin area.
          </p>
        </div>
      </div>
    )
  }

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId })
  }

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return user?.role === 'super_admin' ? <AdminDashboardTab /> : null
      case 'users':
        return <AdminUsersTab />
      case 'organizations':
        return user?.role === 'super_admin' ? <AdminOrganizationsTab /> : null
      case 'guides':
        return user?.role === 'super_admin' ? <AdminGuidesTab /> : null
      case 'library':
        return user?.role === 'super_admin' ? <AdminLibraryTab /> : null
      case 'templates':
        return user?.role === 'super_admin' ? <AdminTemplatesTab /> : null
      case 'announcements':
        return user?.role === 'super_admin' ? <AdminAnnouncementsTab /> : null
      default:
        return <AdminUsersTab />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Console
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your platform settings, users, and content
            </p>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-1 overflow-x-auto pb-px -mb-px" aria-label="Admin tabs">
            {availableTabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  )
}
