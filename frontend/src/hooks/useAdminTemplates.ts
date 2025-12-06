/**
 * React Query hooks for Admin Template management
 * CRUD operations for agent templates (requires super_admin role)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@services/queryClient'
import * as templateService from '@services/templates'
import type {
  TemplateQueryParams,
  TemplateCreateData,
  TemplateUpdateData,
} from '@/types/models'

/**
 * Hook to fetch all templates (including non-approved) for admin
 */
export function useAdminTemplates(params?: TemplateQueryParams) {
  return useQuery({
    queryKey: queryKeys.templates.list(params as Record<string, unknown>),
    queryFn: () => templateService.getAllTemplates(params),
  })
}

/**
 * Hook to fetch pending templates for review
 */
export function usePendingTemplates() {
  return useQuery({
    queryKey: queryKeys.templates.pending(),
    queryFn: () => templateService.getPendingTemplates(),
  })
}

/**
 * Hook to create a new template (admin)
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TemplateCreateData) => templateService.submitTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all })
    },
  })
}

/**
 * Hook to update an existing template (admin)
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TemplateUpdateData }) =>
      templateService.adminUpdateTemplate(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all })
    },
  })
}

/**
 * Hook to delete a template (admin)
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => templateService.adminDeleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all })
    },
  })
}

/**
 * Hook to approve a template
 */
export function useApproveTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => templateService.approveTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.pending() })
    },
  })
}

/**
 * Hook to reject a template
 */
export function useRejectTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      templateService.rejectTemplate(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.pending() })
    },
  })
}

/**
 * Hook to set featured status
 */
export function useSetTemplateFeatured() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      templateService.setTemplateFeatured(id, featured),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all })
    },
  })
}

// Re-export types for convenience
export type { TemplateCreateData, TemplateUpdateData, TemplateQueryParams }
