/**
 * React Query hooks for Admin Library management
 * CRUD operations for library resources (requires super_admin role)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@services/queryClient'
import * as libraryService from '@services/library'
import type { CreateLibraryResourceData, UpdateLibraryResourceData } from '@services/library'

/**
 * Hook to create a new library resource
 */
export function useCreateLibraryResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLibraryResourceData) => libraryService.createLibraryResource(data),
    onSuccess: () => {
      // Invalidate all library queries to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.library.all })
    },
  })
}

/**
 * Hook to update an existing library resource
 */
export function useUpdateLibraryResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLibraryResourceData }) =>
      libraryService.updateLibraryResource(id, data),
    onSuccess: (_data, variables) => {
      // Invalidate the specific resource and the list
      queryClient.invalidateQueries({ queryKey: queryKeys.library.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.library.all })
    },
  })
}

/**
 * Hook to delete a library resource
 */
export function useDeleteLibraryResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => libraryService.deleteLibraryResource(id),
    onSuccess: () => {
      // Invalidate all library queries
      queryClient.invalidateQueries({ queryKey: queryKeys.library.all })
    },
  })
}

// Re-export types for convenience
export type { CreateLibraryResourceData, UpdateLibraryResourceData }
