/**
 * Admin API service
 * Handles admin dashboard statistics and platform management
 */

import { api } from './api'

// Types
export interface UserStats {
  total: number
  active: number
  newThisWeek: number
}

export interface OrganizationStats {
  total: number
  active: number
}

export interface ContentStats {
  guides: number
  publishedGuides: number
  libraryResources: number
  featuredResources: number
  workshops: number
}

export interface ActivityStats {
  loginsToday: number
  activeSessions: number
  apiRequests24h: number
}

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown'

export interface HealthStats {
  api: HealthStatus
  database: HealthStatus
  externalServices: HealthStatus
}

export interface AdminStats {
  users: UserStats
  organizations: OrganizationStats
  content: ContentStats
  activity: ActivityStats
  health: HealthStats
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
  const response = await api.get<AdminStats>('/admin/stats')
  return response.data
}
