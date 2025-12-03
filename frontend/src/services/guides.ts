/**
 * Guides API Service
 * Handles all guide-related API calls
 */

import { apiGet, apiPost, apiPatch, apiDelete } from './api'
import type {
  Guide,
  GuideListItem,
  GuideIcon,
  ApiGuide,
  ApiGuideListItem,
} from '@/types/models'

// ============================================================================
// Response Transformers (snake_case from API -> camelCase for frontend)
// ============================================================================

function transformGuideListItem(item: ApiGuideListItem): GuideListItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.description,
    icon: item.icon as GuideIcon,
    displayOrder: item.display_order,
    published: item.published,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

function transformGuide(guide: ApiGuide): Guide {
  return {
    ...transformGuideListItem(guide),
    contentHtml: guide.content_html,
  }
}

// ============================================================================
// Public Endpoints (No Authentication Required)
// ============================================================================

/**
 * Get all published guides
 */
export async function getGuides(publishedOnly = true): Promise<GuideListItem[]> {
  const guides = await apiGet<ApiGuideListItem[]>('/guides/', {
    published_only: publishedOnly,
  })
  return guides.map(transformGuideListItem)
}

/**
 * Get a single guide by slug
 */
export async function getGuideBySlug(slug: string): Promise<Guide> {
  const guide = await apiGet<ApiGuide>(`/guides/${slug}`)
  return transformGuide(guide)
}

// ============================================================================
// Admin CRUD Operations (requires super_admin role)
// ============================================================================

/**
 * Create a new guide (admin only)
 */
export interface CreateGuideData {
  slug: string
  title: string
  description: string
  content_html: string
  icon: GuideIcon
  display_order?: number
  published?: boolean
}

export async function createGuide(data: CreateGuideData): Promise<Guide> {
  const guide = await apiPost<ApiGuide>('/guides/', data)
  return transformGuide(guide)
}

/**
 * Update an existing guide (admin only)
 */
export interface UpdateGuideData {
  slug?: string
  title?: string
  description?: string
  content_html?: string
  icon?: GuideIcon
  display_order?: number
  published?: boolean
}

export async function updateGuide(
  slug: string,
  data: UpdateGuideData
): Promise<Guide> {
  const guide = await apiPatch<ApiGuide>(`/guides/${slug}`, data)
  return transformGuide(guide)
}

/**
 * Delete a guide (admin only)
 */
export async function deleteGuide(slug: string): Promise<void> {
  await apiDelete<void>(`/guides/${slug}`)
}
