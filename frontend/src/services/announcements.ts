/**
 * Announcements API service for What's New section
 */

import { apiGet, apiPost, apiPatch, apiDelete } from './api'

// Types
export interface Announcement {
  id: string
  title: string
  description: string
  announcementType: 'workshop' | 'guide' | 'library' | 'news' | 'feature' | 'general'
  linkUrl: string | null
  badgeText: string | null
  badgeColor: 'blue' | 'green' | 'amber' | 'red' | 'purple'
  displayOrder: number
  isActive: boolean
  startsAt: string | null
  expiresAt: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface AnnouncementListResponse {
  items: Announcement[]
  total: number
}

export interface CreateAnnouncementData {
  title: string
  description: string
  announcementType?: string
  linkUrl?: string | null
  badgeText?: string | null
  badgeColor?: string
  displayOrder?: number
  isActive?: boolean
  startsAt?: string | null
  expiresAt?: string | null
}

export interface UpdateAnnouncementData {
  title?: string
  description?: string
  announcementType?: string
  linkUrl?: string | null
  badgeText?: string | null
  badgeColor?: string
  displayOrder?: number
  isActive?: boolean
  startsAt?: string | null
  expiresAt?: string | null
}

// API response types (snake_case from backend)
interface AnnouncementApiResponse {
  id: string
  title: string
  description: string
  announcement_type: string
  link_url: string | null
  badge_text: string | null
  badge_color: string
  display_order: number
  is_active: boolean
  starts_at: string | null
  expires_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

interface AnnouncementListApiResponse {
  items: AnnouncementApiResponse[]
  total: number
}

// Transform snake_case to camelCase
function transformAnnouncement(data: AnnouncementApiResponse): Announcement {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    announcementType: data.announcement_type as Announcement['announcementType'],
    linkUrl: data.link_url,
    badgeText: data.badge_text,
    badgeColor: data.badge_color as Announcement['badgeColor'],
    displayOrder: data.display_order,
    isActive: data.is_active,
    startsAt: data.starts_at,
    expiresAt: data.expires_at,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// Transform camelCase to snake_case for API requests
function transformToApiFormat(data: CreateAnnouncementData | UpdateAnnouncementData): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  if ('title' in data && data.title !== undefined) result.title = data.title
  if ('description' in data && data.description !== undefined) result.description = data.description
  if ('announcementType' in data && data.announcementType !== undefined) result.announcement_type = data.announcementType
  if ('linkUrl' in data) result.link_url = data.linkUrl
  if ('badgeText' in data) result.badge_text = data.badgeText
  if ('badgeColor' in data && data.badgeColor !== undefined) result.badge_color = data.badgeColor
  if ('displayOrder' in data && data.displayOrder !== undefined) result.display_order = data.displayOrder
  if ('isActive' in data && data.isActive !== undefined) result.is_active = data.isActive
  if ('startsAt' in data) result.starts_at = data.startsAt
  if ('expiresAt' in data) result.expires_at = data.expiresAt

  return result
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get active announcements for dashboard display (public endpoint)
 */
export async function getActiveAnnouncements(limit: number = 5): Promise<Announcement[]> {
  const response = await apiGet<AnnouncementApiResponse[]>(
    `/announcements/active?limit=${limit}`
  )
  return response.map(transformAnnouncement)
}

/**
 * Get all announcements for admin management
 */
export async function getAnnouncementsList(includeInactive: boolean = true): Promise<AnnouncementListResponse> {
  const response = await apiGet<AnnouncementListApiResponse>(
    `/announcements?include_inactive=${includeInactive}`
  )
  return {
    items: response.items.map(transformAnnouncement),
    total: response.total,
  }
}

/**
 * Get a single announcement by ID
 */
export async function getAnnouncementById(id: string): Promise<Announcement> {
  const response = await apiGet<AnnouncementApiResponse>(`/announcements/${id}`)
  return transformAnnouncement(response)
}

/**
 * Create a new announcement
 */
export async function createAnnouncement(data: CreateAnnouncementData): Promise<Announcement> {
  const response = await apiPost<AnnouncementApiResponse>(
    '/announcements',
    transformToApiFormat(data)
  )
  return transformAnnouncement(response)
}

/**
 * Update an existing announcement
 */
export async function updateAnnouncement(id: string, data: UpdateAnnouncementData): Promise<Announcement> {
  const response = await apiPatch<AnnouncementApiResponse>(
    `/announcements/${id}`,
    transformToApiFormat(data)
  )
  return transformAnnouncement(response)
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(id: string): Promise<void> {
  await apiDelete(`/announcements/${id}`)
}
