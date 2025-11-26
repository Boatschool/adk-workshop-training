/**
 * Progress React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPut } from '@services/api'
import { queryKeys } from '@services/queryClient'
import type { Progress, ProgressUpdateRequest } from '@/types'

/**
 * Fetch current user's progress across all exercises
 */
export function useMyProgress() {
  return useQuery({
    queryKey: queryKeys.progress.current(),
    queryFn: () => apiGet<Progress[]>('/progress/me'),
  })
}

/**
 * Fetch progress for a specific user
 */
export function useUserProgress(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.progress.byUser(userId ?? ''),
    queryFn: () => apiGet<Progress[]>(`/progress/user/${userId}`),
    enabled: !!userId,
  })
}

/**
 * Fetch progress for a specific exercise (all users)
 */
export function useExerciseProgress(exerciseId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.progress.byExercise(exerciseId ?? ''),
    queryFn: () => apiGet<Progress[]>(`/progress/exercise/${exerciseId}`),
    enabled: !!exerciseId,
  })
}

/**
 * Update progress for an exercise
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      exerciseId,
      data,
    }: {
      exerciseId: string
      data: ProgressUpdateRequest
    }) => apiPut<Progress>(`/progress/exercises/${exerciseId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.progress.all })
    },
  })
}

/**
 * Mark an exercise as complete (convenience hook)
 */
export function useCompleteExercise() {
  const updateProgress = useUpdateProgress()

  return {
    ...updateProgress,
    mutate: (exerciseId: string) =>
      updateProgress.mutate({
        exerciseId,
        data: { status: 'completed' },
      }),
    mutateAsync: (exerciseId: string) =>
      updateProgress.mutateAsync({
        exerciseId,
        data: { status: 'completed' },
      }),
  }
}
