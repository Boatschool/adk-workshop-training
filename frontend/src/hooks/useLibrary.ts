/**
 * React Query hooks for Library resources, bookmarks, and progress
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@services/queryClient'
import * as libraryService from '@services/library'
import type {
  LibraryQueryParams,
  ResourceProgressStatus,
} from '@/types/models'

// ============================================================================
// Library Resources Hooks
// ============================================================================

/**
 * Hook to fetch library resources with optional filters
 */
export function useLibraryResources(params?: LibraryQueryParams) {
  return useQuery({
    queryKey: queryKeys.library.resources(params as Record<string, unknown>),
    queryFn: () => libraryService.getLibraryResources(params),
  })
}

/**
 * Hook to fetch a single library resource by ID
 */
export function useLibraryResource(id: string) {
  return useQuery({
    queryKey: queryKeys.library.detail(id),
    queryFn: () => libraryService.getLibraryResource(id),
    enabled: !!id,
  })
}

/**
 * Hook to fetch featured library resources
 */
export function useFeaturedResources(limit = 6) {
  return useQuery({
    queryKey: queryKeys.library.featured(),
    queryFn: () => libraryService.getFeaturedResources(limit),
  })
}

// ============================================================================
// Bookmark Hooks
// ============================================================================

/**
 * Hook to fetch all user bookmarks
 */
export function useUserBookmarks() {
  return useQuery({
    queryKey: queryKeys.library.bookmarks(),
    queryFn: libraryService.getUserBookmarks,
  })
}

/**
 * Hook to check bookmark status for a resource
 */
export function useBookmarkStatus(resourceId: string) {
  return useQuery({
    queryKey: queryKeys.library.bookmarkStatus(resourceId),
    queryFn: () => libraryService.getBookmarkStatus(resourceId),
    enabled: !!resourceId,
  })
}

/**
 * Hook to toggle bookmark for a resource
 * Optimistically updates the UI
 */
export function useToggleBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (resourceId: string) => libraryService.toggleBookmark(resourceId),
    onMutate: async (resourceId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.library.all })

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData(
        queryKeys.library.bookmarkStatus(resourceId)
      )

      // Optimistically update the bookmark status
      queryClient.setQueryData(
        queryKeys.library.bookmarkStatus(resourceId),
        (old: { is_bookmarked: boolean } | undefined) => ({
          is_bookmarked: !old?.is_bookmarked,
          bookmarked_at: null,
        })
      )

      return { previousStatus, resourceId }
    },
    onError: (_err, resourceId, context) => {
      // Rollback on error
      if (context?.previousStatus) {
        queryClient.setQueryData(
          queryKeys.library.bookmarkStatus(resourceId),
          context.previousStatus
        )
      }
    },
    onSettled: () => {
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.library.resources() })
      queryClient.invalidateQueries({ queryKey: queryKeys.library.bookmarks() })
    },
  })
}

// ============================================================================
// Progress Hooks
// ============================================================================

/**
 * Hook to fetch all user progress records
 */
export function useUserProgress() {
  return useQuery({
    queryKey: queryKeys.library.progress(),
    queryFn: libraryService.getUserProgress,
  })
}

/**
 * Hook to fetch progress for a specific resource
 */
export function useResourceProgress(resourceId: string) {
  return useQuery({
    queryKey: queryKeys.library.resourceProgress(resourceId),
    queryFn: () => libraryService.getResourceProgress(resourceId),
    enabled: !!resourceId,
  })
}

/**
 * Hook to update resource progress
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      resourceId,
      status,
      timeSpentSeconds,
    }: {
      resourceId: string
      status: ResourceProgressStatus
      timeSpentSeconds?: number
    }) => libraryService.updateResourceProgress(resourceId, status, timeSpentSeconds),
    onSuccess: (_data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.resourceProgress(variables.resourceId),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.library.progress() })
      queryClient.invalidateQueries({ queryKey: queryKeys.library.resources() })
    },
  })
}

/**
 * Hook to mark a resource as viewed
 * Convenience hook that sets status to 'in_progress'
 */
export function useMarkViewed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (resourceId: string) => libraryService.markResourceViewed(resourceId),
    onSuccess: (_data, resourceId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.resourceProgress(resourceId),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.library.progress() })
      queryClient.invalidateQueries({ queryKey: queryKeys.library.resources() })
      queryClient.invalidateQueries({ queryKey: queryKeys.library.detail(resourceId) })
    },
  })
}

/**
 * Hook to mark a resource as completed
 */
export function useMarkCompleted() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (resourceId: string) => libraryService.markResourceCompleted(resourceId),
    onSuccess: (_data, resourceId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.library.resourceProgress(resourceId),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.library.progress() })
      queryClient.invalidateQueries({ queryKey: queryKeys.library.resources() })
      queryClient.invalidateQueries({ queryKey: queryKeys.library.detail(resourceId) })
    },
  })
}
