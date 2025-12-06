/**
 * React Query Client Configuration
 */

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

// Query keys factory for type-safe and consistent key management
export const queryKeys = {
  // User queries
  user: {
    all: ['users'] as const,
    current: () => [...queryKeys.user.all, 'me'] as const,
    detail: (id: string) => [...queryKeys.user.all, id] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.user.all, 'list', params] as const,
  },

  // Tenant queries
  tenant: {
    all: ['tenants'] as const,
    detail: (id: string) => [...queryKeys.tenant.all, id] as const,
    list: () => [...queryKeys.tenant.all, 'list'] as const,
  },

  // Workshop queries
  workshop: {
    all: ['workshops'] as const,
    detail: (id: string) => [...queryKeys.workshop.all, id] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.workshop.all, 'list', params] as const,
  },

  // Exercise queries
  exercise: {
    all: ['exercises'] as const,
    detail: (id: string) => [...queryKeys.exercise.all, id] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.exercise.all, 'list', params] as const,
    byWorkshop: (workshopId: string) =>
      [...queryKeys.exercise.all, 'workshop', workshopId] as const,
  },

  // Progress queries
  progress: {
    all: ['progress'] as const,
    current: () => [...queryKeys.progress.all, 'me'] as const,
    byUser: (userId: string) =>
      [...queryKeys.progress.all, 'user', userId] as const,
    byExercise: (exerciseId: string) =>
      [...queryKeys.progress.all, 'exercise', exerciseId] as const,
  },

  // Agent queries
  agent: {
    all: ['agents'] as const,
    detail: (id: string) => [...queryKeys.agent.all, id] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.agent.all, 'list', params] as const,
    current: () => [...queryKeys.agent.all, 'me'] as const,
    templates: () => [...queryKeys.agent.all, 'templates'] as const,
    templateDetail: (type: string) =>
      [...queryKeys.agent.all, 'templates', type] as const,
  },

  // Library queries
  library: {
    all: ['library'] as const,
    resources: (params?: Record<string, unknown>) =>
      [...queryKeys.library.all, 'resources', params] as const,
    detail: (id: string) => [...queryKeys.library.all, 'detail', id] as const,
    featured: () => [...queryKeys.library.all, 'featured'] as const,
    bookmarks: () => [...queryKeys.library.all, 'bookmarks'] as const,
    bookmarkStatus: (resourceId: string) =>
      [...queryKeys.library.all, 'bookmark', resourceId] as const,
    progress: () => [...queryKeys.library.all, 'progress'] as const,
    resourceProgress: (resourceId: string) =>
      [...queryKeys.library.all, 'progress', resourceId] as const,
  },

  // Guide queries
  guides: {
    all: ['guides'] as const,
    list: (publishedOnly?: boolean) =>
      [...queryKeys.guides.all, 'list', { publishedOnly }] as const,
    detail: (slug: string) => [...queryKeys.guides.all, 'detail', slug] as const,
  },

  // News queries
  news: {
    all: ['news'] as const,
    list: (params?: { page?: number; pageSize?: number; featuredOnly?: boolean }) =>
      [...queryKeys.news.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.news.all, 'detail', id] as const,
  },

  // Announcements queries (What's New section)
  announcements: {
    all: ['announcements'] as const,
    active: (limit?: number) => [...queryKeys.announcements.all, 'active', limit] as const,
    list: (includeInactive?: boolean) =>
      [...queryKeys.announcements.all, 'list', { includeInactive }] as const,
    detail: (id: string) => [...queryKeys.announcements.all, 'detail', id] as const,
  },

  // Template queries (Agent Templates)
  templates: {
    all: ['templates'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.templates.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.templates.all, 'detail', id] as const,
    featured: (limit?: number) => [...queryKeys.templates.all, 'featured', limit] as const,
    pending: () => [...queryKeys.templates.all, 'pending'] as const,
    myTemplates: () => [...queryKeys.templates.all, 'my'] as const,
  },
} as const
