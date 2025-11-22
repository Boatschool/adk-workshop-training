/**
 * Workshop React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch, apiDelete } from '@services/api'
import { queryKeys } from '@services/queryClient'
import type {
  Workshop,
  PaginatedResponse,
  WorkshopCreateRequest,
  WorkshopUpdateRequest,
  WorkshopQueryParams,
} from '@/types'

/**
 * Fetch all workshops with optional filters
 */
export function useWorkshops(params?: WorkshopQueryParams) {
  return useQuery({
    queryKey: queryKeys.workshop.list(params as Record<string, unknown>),
    queryFn: () =>
      apiGet<PaginatedResponse<Workshop>>('/workshops', params as Record<string, unknown>),
  })
}

/**
 * Fetch a single workshop by ID
 */
export function useWorkshop(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workshop.detail(id ?? ''),
    queryFn: () => apiGet<Workshop>(`/workshops/${id}`),
    enabled: !!id,
  })
}

/**
 * Create a new workshop
 */
export function useCreateWorkshop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: WorkshopCreateRequest) =>
      apiPost<Workshop>('/workshops', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workshop.all })
    },
  })
}

/**
 * Update a workshop
 */
export function useUpdateWorkshop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WorkshopUpdateRequest }) =>
      apiPatch<Workshop>(`/workshops/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workshop.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.workshop.all })
    },
  })
}

/**
 * Delete a workshop
 */
export function useDeleteWorkshop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/workshops/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workshop.all })
    },
  })
}
