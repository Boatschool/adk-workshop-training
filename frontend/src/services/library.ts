/**
 * Library API Service
 * Handles all library-related API calls including resources, bookmarks, and progress
 */

import { api, apiGet, apiPost, apiPatch, apiDelete } from './api'
import type {
  LibraryResourceWithUserData,
  LibraryQueryParams,
  BookmarkStatusResponse,
  ResourceProgress,
  ResourceProgressStatus,
  UserBookmark,
} from '@/types/models'

// ============================================================================
// Response Transformers (snake_case from API -> camelCase for frontend)
// ============================================================================

interface ApiLibraryResource {
  id: string
  title: string
  description: string
  type: string
  source: string
  external_url?: string
  content_path?: string
  content_html?: string
  topics: string[]
  difficulty: string
  author?: string
  estimated_minutes?: number
  thumbnail_url?: string
  featured?: boolean
  created_at: string
  updated_at: string
  is_bookmarked: boolean
  progress_status: ResourceProgressStatus | null
}

function transformResource(resource: ApiLibraryResource): LibraryResourceWithUserData {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    type: resource.type as LibraryResourceWithUserData['type'],
    source: resource.source as LibraryResourceWithUserData['source'],
    externalUrl: resource.external_url,
    contentPath: resource.content_path,
    contentHtml: resource.content_html,
    topics: resource.topics as LibraryResourceWithUserData['topics'],
    difficulty: resource.difficulty as LibraryResourceWithUserData['difficulty'],
    author: resource.author,
    estimatedMinutes: resource.estimated_minutes,
    thumbnailUrl: resource.thumbnail_url,
    featured: resource.featured,
    createdAt: resource.created_at,
    updatedAt: resource.updated_at,
    isBookmarked: resource.is_bookmarked,
    progressStatus: resource.progress_status,
    isFeatured: resource.featured ?? false,
  }
}

// ============================================================================
// Library Resources
// ============================================================================

/**
 * Get library resources with optional filters
 */
export async function getLibraryResources(
  params?: LibraryQueryParams
): Promise<LibraryResourceWithUserData[]> {
  // Transform camelCase params to snake_case for API
  const apiParams: Record<string, unknown> = {}
  if (params) {
    if (params.skip !== undefined) apiParams.skip = params.skip
    if (params.limit !== undefined) apiParams.limit = params.limit
    if (params.search) apiParams.search = params.search
    if (params.type) apiParams.resource_type = params.type
    if (params.topic) apiParams.topic = params.topic
    if (params.difficulty) apiParams.difficulty = params.difficulty
    if (params.featured !== undefined) apiParams.featured = params.featured
    if (params.bookmarked !== undefined) apiParams.bookmarked = params.bookmarked
    if (params.progressStatus) apiParams.progress_status = params.progressStatus
  }

  const resources = await apiGet<ApiLibraryResource[]>('/library/', apiParams)
  return resources.map(transformResource)
}

/**
 * Get a single library resource by ID
 */
export async function getLibraryResource(id: string): Promise<LibraryResourceWithUserData> {
  const resource = await apiGet<ApiLibraryResource>(`/library/${id}`)
  return transformResource(resource)
}

/**
 * Get featured library resources
 */
export async function getFeaturedResources(limit = 6): Promise<LibraryResourceWithUserData[]> {
  const resources = await apiGet<ApiLibraryResource[]>('/library/featured', { limit })
  return resources.map(transformResource)
}

// ============================================================================
// Bookmarks
// ============================================================================

/**
 * Toggle bookmark for a resource
 * Returns the new bookmark status
 */
export async function toggleBookmark(resourceId: string): Promise<BookmarkStatusResponse> {
  return apiPost<BookmarkStatusResponse>(`/library/${resourceId}/bookmark`)
}

/**
 * Check if a resource is bookmarked
 */
export async function getBookmarkStatus(resourceId: string): Promise<BookmarkStatusResponse> {
  return apiGet<BookmarkStatusResponse>(`/library/${resourceId}/bookmark`)
}

/**
 * Get all user bookmarks
 */
export async function getUserBookmarks(): Promise<UserBookmark[]> {
  return apiGet<UserBookmark[]>('/library/bookmarks/')
}

// ============================================================================
// Progress
// ============================================================================

/**
 * Update progress for a resource
 */
export async function updateResourceProgress(
  resourceId: string,
  status: ResourceProgressStatus,
  timeSpentSeconds?: number
): Promise<ResourceProgress> {
  return apiPost<ResourceProgress>(`/library/${resourceId}/progress`, {
    status,
    time_spent_seconds: timeSpentSeconds,
  })
}

/**
 * Get progress for a specific resource
 */
export async function getResourceProgress(resourceId: string): Promise<ResourceProgress | null> {
  return apiGet<ResourceProgress | null>(`/library/${resourceId}/progress`)
}

/**
 * Get all user progress records
 */
export async function getUserProgress(): Promise<ResourceProgress[]> {
  return apiGet<ResourceProgress[]>('/library/progress/')
}

/**
 * Mark a resource as viewed (convenience method)
 * Sets status to 'in_progress' if not already completed
 */
export async function markResourceViewed(resourceId: string): Promise<ResourceProgress> {
  return apiPost<ResourceProgress>(`/library/${resourceId}/view`)
}

/**
 * Mark a resource as completed
 */
export async function markResourceCompleted(resourceId: string): Promise<ResourceProgress> {
  return updateResourceProgress(resourceId, 'completed')
}

// ============================================================================
// Admin CRUD Operations (requires super_admin role)
// ============================================================================

/**
 * Create a new library resource (admin only)
 */
export interface CreateLibraryResourceData {
  title: string
  description: string
  resource_type: string
  source: string
  external_url?: string
  content_path?: string
  content_html?: string
  topics: string[]
  difficulty: string
  author?: string
  estimated_minutes?: number
  thumbnail_url?: string
  featured?: boolean
}

export async function createLibraryResource(
  data: CreateLibraryResourceData
): Promise<LibraryResourceWithUserData> {
  const resource = await apiPost<ApiLibraryResource>('/library/', data)
  return transformResource(resource)
}

/**
 * Update an existing library resource (admin only)
 */
export interface UpdateLibraryResourceData {
  title?: string
  description?: string
  resource_type?: string
  source?: string
  external_url?: string | null
  content_path?: string | null
  content_html?: string | null
  topics?: string[]
  difficulty?: string
  author?: string | null
  estimated_minutes?: number | null
  thumbnail_url?: string | null
  featured?: boolean
}

export async function updateLibraryResource(
  id: string,
  data: UpdateLibraryResourceData
): Promise<LibraryResourceWithUserData> {
  const resource = await apiPatch<ApiLibraryResource>(`/library/${id}`, data)
  return transformResource(resource)
}

/**
 * Delete a library resource (admin only)
 */
export async function deleteLibraryResource(id: string): Promise<void> {
  await apiDelete<void>(`/library/${id}`)
}

// ============================================================================
// File Upload/Download (requires super_admin role)
// ============================================================================

/**
 * Response from file upload
 */
export interface FileUploadResponse {
  filePath: string
  fileUrl: string
  fileName: string
  fileSize: number
  contentType: string
}

/**
 * Response from file download request
 */
export interface FileDownloadResponse {
  downloadUrl: string
  expiresInMinutes: number
  fileName: string
  contentType: string
}

/**
 * Upload a PDF document to the library (admin only)
 * @param file The PDF file to upload
 * @param onProgress Optional callback for upload progress (0-100)
 */
export async function uploadLibraryDocument(
  file: File,
  onProgress?: (progress: number) => void
): Promise<FileUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<{
    file_path: string
    file_url: string
    file_name: string
    file_size: number
    content_type: string
  }>('/library/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentCompleted)
      }
    },
  })

  // Transform snake_case to camelCase
  return {
    filePath: response.data.file_path,
    fileUrl: response.data.file_url,
    fileName: response.data.file_name,
    fileSize: response.data.file_size,
    contentType: response.data.content_type,
  }
}

/**
 * Get a signed download URL for an uploaded resource
 */
export async function getResourceDownloadUrl(resourceId: string): Promise<FileDownloadResponse> {
  const response = await apiGet<{
    download_url: string
    expires_in_minutes: number
    file_name: string
    content_type: string
  }>(`/library/${resourceId}/download`)

  return {
    downloadUrl: response.download_url,
    expiresInMinutes: response.expires_in_minutes,
    fileName: response.file_name,
    contentType: response.content_type,
  }
}
