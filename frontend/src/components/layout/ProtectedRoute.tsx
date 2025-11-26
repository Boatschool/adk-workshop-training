/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'participant' | 'instructor' | 'tenant_admin' | 'super_admin'
}

const roleHierarchy = {
  participant: 0,
  instructor: 1,
  tenant_admin: 2,
  super_admin: 3,
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  // Show nothing while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role if required
  if (requiredRole && user) {
    const userRoleLevel = roleHierarchy[user.role] ?? 0
    const requiredRoleLevel = roleHierarchy[requiredRole]

    if (userRoleLevel < requiredRoleLevel) {
      // User doesn't have sufficient permissions
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
