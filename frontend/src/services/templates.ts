/**
 * Templates API Service
 * Handles all template-related API calls including browsing, downloading, and bookmarks
 */

import { apiGet, apiPost, apiPatch, apiDelete } from './api'
import type {
  AgentTemplateItem,
  AgentTemplateDetail,
  AgentTemplateWithUserData,
  TemplateQueryParams,
  TemplateCreateData,
  TemplateUpdateData,
  TemplateBookmarkStatus,
  TemplateDownloadResponse,
  TemplateStats,
  ApiAgentTemplateItem,
  ApiAgentTemplateDetail,
  TemplateCategory,
  TemplateDifficulty,
  TemplateStatus,
} from '@/types/models'

// ============================================================================
// Response Transformers (snake_case from API -> camelCase for frontend)
// ============================================================================

function transformTemplateItem(item: ApiAgentTemplateItem): AgentTemplateItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category as TemplateCategory,
    difficulty: item.difficulty as TemplateDifficulty,
    tags: item.tags,
    authorName: item.author_name,
    status: item.status as TemplateStatus,
    featured: item.featured,
    downloadCount: item.download_count,
    model: item.model,
    hasTools: item.has_tools,
    hasSubAgents: item.has_sub_agents,
    thumbnailUrl: item.thumbnail_url,
    createdAt: item.created_at,
  }
}

function transformTemplateDetail(item: ApiAgentTemplateDetail): AgentTemplateDetail {
  return {
    ...transformTemplateItem(item),
    yamlContent: item.yaml_content,
    useCase: item.use_case,
    authorId: item.author_id,
    rejectionReason: item.rejection_reason,
    approvedBy: item.approved_by,
    approvedAt: item.approved_at,
    updatedAt: item.updated_at,
  }
}

function transformTemplateWithUserData(
  item: ApiAgentTemplateDetail & { is_bookmarked: boolean }
): AgentTemplateWithUserData {
  return {
    ...transformTemplateDetail(item),
    isBookmarked: item.is_bookmarked,
  }
}

// ============================================================================
// Request Transformers (camelCase from frontend -> snake_case for API)
// ============================================================================

function transformCreateData(data: TemplateCreateData): Record<string, unknown> {
  return {
    name: data.name,
    description: data.description,
    yaml_content: data.yamlContent,
    category: data.category,
    difficulty: data.difficulty,
    use_case: data.useCase,
    tags: data.tags,
    thumbnail_url: data.thumbnailUrl,
  }
}

function transformUpdateData(data: TemplateUpdateData): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  if (data.name !== undefined) result.name = data.name
  if (data.description !== undefined) result.description = data.description
  if (data.yamlContent !== undefined) result.yaml_content = data.yamlContent
  if (data.category !== undefined) result.category = data.category
  if (data.difficulty !== undefined) result.difficulty = data.difficulty
  if (data.useCase !== undefined) result.use_case = data.useCase
  if (data.tags !== undefined) result.tags = data.tags
  if (data.thumbnailUrl !== undefined) result.thumbnail_url = data.thumbnailUrl
  return result
}

// ============================================================================
// Public Endpoints (Authenticated Users)
// ============================================================================

/**
 * Get approved templates with optional filters
 */
export async function getTemplates(
  params?: TemplateQueryParams
): Promise<AgentTemplateItem[]> {
  const apiParams: Record<string, unknown> = {}
  if (params) {
    if (params.skip !== undefined) apiParams.skip = params.skip
    if (params.limit !== undefined) apiParams.limit = params.limit
    if (params.search) apiParams.search = params.search
    if (params.category) apiParams.category = params.category
    if (params.difficulty) apiParams.difficulty = params.difficulty
    if (params.featured !== undefined) apiParams.featured = params.featured
    if (params.hasTools !== undefined) apiParams.has_tools = params.hasTools
    if (params.hasSubAgents !== undefined) apiParams.has_sub_agents = params.hasSubAgents
  }

  const templates = await apiGet<ApiAgentTemplateItem[]>('/templates', apiParams)
  return templates.map(transformTemplateItem)
}

/**
 * Get featured templates
 */
export async function getFeaturedTemplates(limit = 6): Promise<AgentTemplateItem[]> {
  const templates = await apiGet<ApiAgentTemplateItem[]>('/templates/featured', { limit })
  return templates.map(transformTemplateItem)
}

/**
 * Get a single template by ID with user bookmark status
 */
export async function getTemplate(id: string): Promise<AgentTemplateWithUserData> {
  const template = await apiGet<ApiAgentTemplateDetail & { is_bookmarked: boolean }>(
    `/templates/${id}`
  )
  return transformTemplateWithUserData(template)
}

/**
 * Download template YAML (increments download count)
 */
export async function downloadTemplate(id: string): Promise<TemplateDownloadResponse> {
  const response = await apiGet<{
    filename: string
    content: string
    content_type: string
  }>(`/templates/${id}/download`)
  return {
    filename: response.filename,
    content: response.content,
    contentType: response.content_type,
  }
}

/**
 * Get raw YAML content (for clipboard, doesn't increment download count)
 */
export async function getTemplateYaml(id: string): Promise<string> {
  const response = await fetch(`/api/v1/templates/${id}/yaml`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      'X-Tenant-ID': localStorage.getItem('tenant_id') || '',
    },
  })
  if (!response.ok) throw new Error('Failed to get template YAML')
  return response.text()
}

/**
 * Toggle bookmark for a template
 */
export async function toggleTemplateBookmark(id: string): Promise<TemplateBookmarkStatus> {
  const response = await apiPost<{
    is_bookmarked: boolean
    bookmarked_at: string | null
  }>(`/templates/${id}/bookmark`, {})
  return {
    isBookmarked: response.is_bookmarked,
    bookmarkedAt: response.bookmarked_at,
  }
}

/**
 * Get user's bookmarked templates
 */
export async function getBookmarkedTemplates(): Promise<AgentTemplateItem[]> {
  const templates = await apiGet<ApiAgentTemplateItem[]>('/templates/bookmarks')
  return templates.map(transformTemplateItem)
}

/**
 * Get user's submitted templates (all statuses)
 */
export async function getMySubmissions(): Promise<AgentTemplateDetail[]> {
  const templates = await apiGet<ApiAgentTemplateDetail[]>('/templates/my-submissions')
  return templates.map(transformTemplateDetail)
}

// ============================================================================
// Instructor Endpoints
// ============================================================================

/**
 * Submit a new template for review
 */
export async function submitTemplate(data: TemplateCreateData): Promise<AgentTemplateDetail> {
  const template = await apiPost<ApiAgentTemplateDetail>(
    '/templates',
    transformCreateData(data)
  )
  return transformTemplateDetail(template)
}

/**
 * Update own template (only draft or rejected)
 */
export async function updateMyTemplate(
  id: string,
  data: TemplateUpdateData
): Promise<AgentTemplateDetail> {
  const template = await apiPatch<ApiAgentTemplateDetail>(
    `/templates/${id}`,
    transformUpdateData(data)
  )
  return transformTemplateDetail(template)
}

/**
 * Delete own draft template
 */
export async function deleteMyTemplate(id: string): Promise<void> {
  await apiDelete(`/templates/${id}`)
}

// ============================================================================
// Admin Endpoints
// ============================================================================

/**
 * Get templates pending review
 */
export async function getPendingTemplates(): Promise<AgentTemplateDetail[]> {
  const templates = await apiGet<ApiAgentTemplateDetail[]>('/templates/admin/pending')
  return templates.map(transformTemplateDetail)
}

/**
 * Get all templates (including non-approved) - admin only
 */
export async function getAllTemplates(
  params?: TemplateQueryParams
): Promise<AgentTemplateDetail[]> {
  const apiParams: Record<string, unknown> = {}
  if (params) {
    if (params.skip !== undefined) apiParams.skip = params.skip
    if (params.limit !== undefined) apiParams.limit = params.limit
    if (params.search) apiParams.search = params.search
    if (params.category) apiParams.category = params.category
    if (params.status) apiParams.status = params.status
  }

  const templates = await apiGet<ApiAgentTemplateDetail[]>('/templates/admin/all', apiParams)
  return templates.map(transformTemplateDetail)
}

/**
 * Get template statistics
 */
export async function getTemplateStats(): Promise<TemplateStats> {
  const stats = await apiGet<{
    total_templates: number
    approved_templates: number
    pending_templates: number
    total_downloads: number
    templates_by_category: Record<string, number>
    templates_by_difficulty: Record<string, number>
  }>('/templates/stats')
  return {
    totalTemplates: stats.total_templates,
    approvedTemplates: stats.approved_templates,
    pendingTemplates: stats.pending_templates,
    totalDownloads: stats.total_downloads,
    templatesByCategory: stats.templates_by_category,
    templatesByDifficulty: stats.templates_by_difficulty,
  }
}

/**
 * Approve a template
 */
export async function approveTemplate(id: string): Promise<AgentTemplateDetail> {
  const template = await apiPost<ApiAgentTemplateDetail>(`/templates/${id}/approve`, {})
  return transformTemplateDetail(template)
}

/**
 * Reject a template with reason
 */
export async function rejectTemplate(id: string, reason: string): Promise<AgentTemplateDetail> {
  const template = await apiPost<ApiAgentTemplateDetail>(`/templates/${id}/reject`, { reason })
  return transformTemplateDetail(template)
}

/**
 * Set featured status for a template
 */
export async function setTemplateFeatured(
  id: string,
  featured: boolean
): Promise<AgentTemplateDetail> {
  const template = await apiPost<ApiAgentTemplateDetail>(`/templates/${id}/feature`, {
    featured,
  })
  return transformTemplateDetail(template)
}

/**
 * Update any template (admin)
 */
export async function adminUpdateTemplate(
  id: string,
  data: TemplateUpdateData
): Promise<AgentTemplateDetail> {
  const template = await apiPatch<ApiAgentTemplateDetail>(
    `/templates/admin/${id}`,
    transformUpdateData(data)
  )
  return transformTemplateDetail(template)
}

/**
 * Delete any template (admin)
 */
export async function adminDeleteTemplate(id: string): Promise<void> {
  await apiDelete(`/templates/admin/${id}`)
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Download YAML file to user's computer
 */
export function downloadYamlFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

/**
 * Get display label for category
 */
export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  hr: 'Human Resources',
  scheduling: 'Scheduling',
  faq: 'FAQ & Knowledge',
  'customer-service': 'Customer Service',
  'data-entry': 'Data Entry',
  workflow: 'Workflow Automation',
  healthcare: 'Healthcare',
  other: 'Other',
}

/**
 * Get display label for difficulty
 */
export const DIFFICULTY_LABELS: Record<TemplateDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

/**
 * Get color for difficulty badge
 */
export const DIFFICULTY_COLORS: Record<TemplateDifficulty, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
}

/**
 * Get color for status badge
 */
export const STATUS_COLORS: Record<TemplateStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}
