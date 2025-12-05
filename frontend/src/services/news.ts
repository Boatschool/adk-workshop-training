/**
 * News API Service
 * Handles all news-related API calls
 */

import { apiGet, apiPost, apiPatch, apiDelete } from './api'

// ============================================================================
// Types
// ============================================================================

export interface NewsItem {
  id: string
  title: string
  excerpt: string
  source: string
  sourceUrl: string | null
  imageUrl: string | null
  publishedAt: string
  isExternal: boolean
  isFeatured: boolean
  createdAt: string
}

export interface NewsDetail extends NewsItem {
  content: string | null
  published: boolean
  createdBy: string | null
  updatedAt: string
}

export interface NewsListResponse {
  items: NewsItem[]
  total: number
  page: number
  pageSize: number
  pages: number
}

// API response types (snake_case)
interface ApiNewsItem {
  id: string
  title: string
  excerpt: string
  source: string
  source_url: string | null
  image_url: string | null
  published_at: string
  is_external: boolean
  is_featured: boolean
  created_at: string
}

interface ApiNewsDetail extends ApiNewsItem {
  content: string | null
  published: boolean
  created_by: string | null
  updated_at: string
}

interface ApiNewsListResponse {
  items: ApiNewsItem[]
  total: number
  page: number
  page_size: number
  pages: number
}

// ============================================================================
// Response Transformers (snake_case from API -> camelCase for frontend)
// ============================================================================

function transformNewsItem(item: ApiNewsItem): NewsItem {
  return {
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    source: item.source,
    sourceUrl: item.source_url,
    imageUrl: item.image_url,
    publishedAt: item.published_at,
    isExternal: item.is_external,
    isFeatured: item.is_featured,
    createdAt: item.created_at,
  }
}

function transformNewsDetail(item: ApiNewsDetail): NewsDetail {
  return {
    ...transformNewsItem(item),
    content: item.content,
    published: item.published,
    createdBy: item.created_by,
    updatedAt: item.updated_at,
  }
}

// ============================================================================
// Public Endpoints (No Authentication Required)
// ============================================================================

/**
 * Get paginated news list
 */
export async function getNewsList(
  page = 1,
  pageSize = 10,
  featuredOnly = false
): Promise<NewsListResponse> {
  const response = await apiGet<ApiNewsListResponse>('/news/', {
    page,
    page_size: pageSize,
    featured_only: featuredOnly,
  })

  return {
    items: response.items.map(transformNewsItem),
    total: response.total,
    page: response.page,
    pageSize: response.page_size,
    pages: response.pages,
  }
}

/**
 * Get a single news item by ID
 */
export async function getNewsById(id: string): Promise<NewsDetail> {
  const news = await apiGet<ApiNewsDetail>(`/news/${id}`)
  return transformNewsDetail(news)
}

// ============================================================================
// Admin CRUD Operations (requires tenant_admin or super_admin role)
// ============================================================================

/**
 * Create a new news item (admin only)
 */
export interface CreateNewsData {
  title: string
  excerpt: string
  content?: string
  source?: string
  source_url?: string
  image_url?: string
  published_at: string
  is_external?: boolean
  is_featured?: boolean
  published?: boolean
}

export async function createNews(data: CreateNewsData): Promise<NewsDetail> {
  const news = await apiPost<ApiNewsDetail>('/news/', data)
  return transformNewsDetail(news)
}

/**
 * Update an existing news item (admin only)
 */
export interface UpdateNewsData {
  title?: string
  excerpt?: string
  content?: string
  source?: string
  source_url?: string
  image_url?: string
  published_at?: string
  is_external?: boolean
  is_featured?: boolean
  published?: boolean
}

export async function updateNews(
  id: string,
  data: UpdateNewsData
): Promise<NewsDetail> {
  const news = await apiPatch<ApiNewsDetail>(`/news/${id}`, data)
  return transformNewsDetail(news)
}

/**
 * Delete a news item (admin only)
 */
export async function deleteNews(id: string): Promise<void> {
  await apiDelete<void>(`/news/${id}`)
}
