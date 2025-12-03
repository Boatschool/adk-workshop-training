/**
 * Tenant management hooks
 * React Query hooks for tenant CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch } from '@services/api'
import type { Tenant, TenantStatus } from '@/types'

// Query keys
export const tenantKeys = {
  all: ['tenants'] as const,
  lists: () => [...tenantKeys.all, 'list'] as const,
  list: (filters: TenantFilters) => [...tenantKeys.lists(), filters] as const,
  details: () => [...tenantKeys.all, 'detail'] as const,
  detail: (id: string) => [...tenantKeys.details(), id] as const,
}

// Types
export interface TenantFilters {
  skip?: number
  limit?: number
  status?: TenantStatus
  search?: string
}

export interface TenantCreateData {
  name: string
  slug: string
  google_api_key?: string
  subscription_tier?: string
}

export interface TenantUpdateData {
  name?: string
  status?: TenantStatus
  subscription_tier?: string
  google_api_key?: string
  settings?: Record<string, unknown>
}

/**
 * Fetch tenants with optional filtering
 */
export function useTenants(filters: TenantFilters = {}) {
  return useQuery({
    queryKey: tenantKeys.list(filters),
    queryFn: () =>
      apiGet<Tenant[]>('/tenants/', {
        skip: filters.skip ?? 0,
        limit: filters.limit ?? 100,
      }),
  })
}

/**
 * Fetch a single tenant by ID
 */
export function useTenant(tenantId: string) {
  return useQuery({
    queryKey: tenantKeys.detail(tenantId),
    queryFn: () => apiGet<Tenant>(`/tenants/${tenantId}`),
    enabled: !!tenantId,
  })
}

/**
 * Create a new tenant (provisions database schema)
 */
export function useCreateTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TenantCreateData) => apiPost<Tenant>('/tenants/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() })
    },
  })
}

/**
 * Update an existing tenant
 */
export function useUpdateTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: TenantUpdateData }) =>
      apiPatch<Tenant>(`/tenants/${tenantId}`, data),
    onSuccess: (updatedTenant) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() })
      queryClient.setQueryData(tenantKeys.detail(updatedTenant.id), updatedTenant)
    },
  })
}
