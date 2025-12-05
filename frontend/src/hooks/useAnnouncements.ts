/**
 * React Query hooks for Announcements (What's New section)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getActiveAnnouncements,
  getAnnouncementsList,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  type Announcement,
  type AnnouncementListResponse,
  type CreateAnnouncementData,
  type UpdateAnnouncementData,
} from '@services/announcements'
import { queryKeys } from '@services/queryClient'

/**
 * Hook to fetch active announcements for dashboard display
 * Uses public endpoint - no auth required
 */
export function useActiveAnnouncements(limit: number = 5) {
  return useQuery<Announcement[], Error>({
    queryKey: [...queryKeys.announcements.all, 'active', limit],
    queryFn: () => getActiveAnnouncements(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch all announcements for admin management
 */
export function useAnnouncements(includeInactive: boolean = true) {
  return useQuery<AnnouncementListResponse, Error>({
    queryKey: [...queryKeys.announcements.all, 'list', includeInactive],
    queryFn: () => getAnnouncementsList(includeInactive),
  })
}

/**
 * Hook to fetch a single announcement by ID
 */
export function useAnnouncementDetail(id: string) {
  return useQuery<Announcement, Error>({
    queryKey: [...queryKeys.announcements.all, 'detail', id],
    queryFn: () => getAnnouncementById(id),
    enabled: !!id,
  })
}

/**
 * Hook to create a new announcement
 */
export function useCreateAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation<Announcement, Error, CreateAnnouncementData>({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      // Invalidate announcements queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all })
    },
  })
}

/**
 * Hook to update an existing announcement
 */
export function useUpdateAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation<Announcement, Error, { id: string; data: UpdateAnnouncementData }>({
    mutationFn: ({ id, data }) => updateAnnouncement(id, data),
    onSuccess: () => {
      // Invalidate announcements queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all })
    },
  })
}

/**
 * Hook to delete an announcement
 */
export function useDeleteAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      // Invalidate announcements queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all })
    },
  })
}
