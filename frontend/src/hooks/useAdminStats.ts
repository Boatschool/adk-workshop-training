/**
 * Admin statistics hook
 * Fetches platform statistics for admin dashboard
 */

import { useQuery } from '@tanstack/react-query'
import { getAdminStats, type AdminStats } from '@services/admin'

export function useAdminStats() {
  return useQuery<AdminStats, Error>({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
    staleTime: 30 * 1000, // 30 seconds - stats can be slightly stale
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}
