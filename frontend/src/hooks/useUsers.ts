/**
 * User management hooks
 * React Query hooks for user CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch } from '@services/api'
import type { User, UserRole } from '@/types'

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// Types
export interface UserFilters {
  skip?: number
  limit?: number
  is_active?: boolean
  search?: string
}

export interface UserCreateData {
  email: string
  full_name?: string
  password: string
  role?: UserRole
}

export interface UserUpdateData {
  full_name?: string
  role?: UserRole
  is_active?: boolean
}

/**
 * Fetch users with optional filtering
 */
export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () =>
      apiGet<User[]>('/users', {
        skip: filters.skip ?? 0,
        limit: filters.limit ?? 100,
        is_active: filters.is_active,
      }),
  })
}

/**
 * Fetch a single user by ID
 */
export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => apiGet<User>(`/users/${userId}`),
    enabled: !!userId,
  })
}

/**
 * Create a new user (admin operation)
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserCreateData) => apiPost<User>('/users/register', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Update an existing user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserUpdateData }) =>
      apiPatch<User>(`/users/${userId}`, data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser)
    },
  })
}

/**
 * Bulk update users (activate/deactivate)
 */
export function useBulkUpdateUsers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userIds,
      data,
    }: {
      userIds: string[]
      data: UserUpdateData
    }) => {
      const results = await Promise.all(
        userIds.map((userId) => apiPatch<User>(`/users/${userId}`, data))
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
