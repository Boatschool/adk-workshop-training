/**
 * React Query hooks for Guides
 * Public queries and admin CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@services/queryClient'
import * as guidesService from '@services/guides'
import type { CreateGuideData, UpdateGuideData } from '@services/guides'

// ============================================================================
// Public Query Hooks
// ============================================================================

/**
 * Hook to fetch all guides (published only by default)
 */
export function useGuides(publishedOnly = true) {
  return useQuery({
    queryKey: queryKeys.guides.list(publishedOnly),
    queryFn: () => guidesService.getGuides(publishedOnly),
  })
}

/**
 * Hook to fetch a single guide by slug
 */
export function useGuide(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.guides.detail(slug || ''),
    queryFn: () => guidesService.getGuideBySlug(slug!),
    enabled: !!slug,
  })
}

// ============================================================================
// Admin Mutation Hooks (requires super_admin role)
// ============================================================================

/**
 * Hook to create a new guide
 */
export function useCreateGuide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGuideData) => guidesService.createGuide(data),
    onSuccess: () => {
      // Invalidate all guides queries to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.all })
    },
  })
}

/**
 * Hook to update an existing guide
 */
export function useUpdateGuide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateGuideData }) =>
      guidesService.updateGuide(slug, data),
    onSuccess: (_data, variables) => {
      // Invalidate the specific guide and the list
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.detail(variables.slug) })
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.all })
    },
  })
}

/**
 * Hook to delete a guide
 */
export function useDeleteGuide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => guidesService.deleteGuide(slug),
    onSuccess: () => {
      // Invalidate all guides queries
      queryClient.invalidateQueries({ queryKey: queryKeys.guides.all })
    },
  })
}

// Re-export types for convenience
export type { CreateGuideData, UpdateGuideData }
