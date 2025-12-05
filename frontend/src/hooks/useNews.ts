/**
 * React Query hooks for News
 * Public queries and admin CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@services/queryClient'
import * as newsService from '@services/news'
import type { CreateNewsData, UpdateNewsData } from '@services/news'

// ============================================================================
// Public Query Hooks
// ============================================================================

/**
 * Hook to fetch paginated news list
 */
export function useNews(
  page = 1,
  pageSize = 10,
  featuredOnly = false
) {
  return useQuery({
    queryKey: queryKeys.news.list({ page, pageSize, featuredOnly }),
    queryFn: () => newsService.getNewsList(page, pageSize, featuredOnly),
  })
}

/**
 * Hook to fetch featured news only
 */
export function useFeaturedNews(limit = 5) {
  return useQuery({
    queryKey: queryKeys.news.list({ page: 1, pageSize: limit, featuredOnly: true }),
    queryFn: () => newsService.getNewsList(1, limit, true),
  })
}

/**
 * Hook to fetch a single news item by ID
 */
export function useNewsDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.news.detail(id || ''),
    queryFn: () => newsService.getNewsById(id!),
    enabled: !!id,
  })
}

// ============================================================================
// Admin Mutation Hooks (requires tenant_admin or super_admin role)
// ============================================================================

/**
 * Hook to create a new news item
 */
export function useCreateNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateNewsData) => newsService.createNews(data),
    onSuccess: () => {
      // Invalidate all news queries to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.news.all })
    },
  })
}

/**
 * Hook to update an existing news item
 */
export function useUpdateNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNewsData }) =>
      newsService.updateNews(id, data),
    onSuccess: (_data, variables) => {
      // Invalidate the specific news item and the list
      queryClient.invalidateQueries({ queryKey: queryKeys.news.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.news.all })
    },
  })
}

/**
 * Hook to delete a news item
 */
export function useDeleteNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => newsService.deleteNews(id),
    onSuccess: () => {
      // Invalidate all news queries
      queryClient.invalidateQueries({ queryKey: queryKeys.news.all })
    },
  })
}

// Re-export types for convenience
export type { CreateNewsData, UpdateNewsData }
export type { NewsItem, NewsDetail, NewsListResponse } from '@services/news'
