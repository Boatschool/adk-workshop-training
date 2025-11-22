/**
 * Agent React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch, apiDelete } from '@services/api'
import { queryKeys } from '@services/queryClient'
import type {
  Agent,
  AgentTemplate,
  PaginatedResponse,
  AgentCreateRequest,
  AgentUpdateRequest,
  AgentExecuteRequest,
  AgentExecuteResponse,
} from '@/types'

/**
 * Fetch all agents
 */
export function useAgents() {
  return useQuery({
    queryKey: queryKeys.agent.list(),
    queryFn: () => apiGet<PaginatedResponse<Agent>>('/agents'),
  })
}

/**
 * Fetch current user's agents
 */
export function useMyAgents() {
  return useQuery({
    queryKey: queryKeys.agent.current(),
    queryFn: () => apiGet<Agent[]>('/agents/me'),
  })
}

/**
 * Fetch a single agent by ID
 */
export function useAgent(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.agent.detail(id ?? ''),
    queryFn: () => apiGet<Agent>(`/agents/${id}`),
    enabled: !!id,
  })
}

/**
 * Create a new agent
 */
export function useCreateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AgentCreateRequest) =>
      apiPost<Agent>('/agents', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.all })
    },
  })
}

/**
 * Update an agent
 */
export function useUpdateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AgentUpdateRequest }) =>
      apiPatch<Agent>(`/agents/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.agent.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.all })
    },
  })
}

/**
 * Delete an agent
 */
export function useDeleteAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/agents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.all })
    },
  })
}

/**
 * Fetch available agent templates
 */
export function useAgentTemplates() {
  return useQuery({
    queryKey: queryKeys.agent.templates(),
    queryFn: () => apiGet<AgentTemplate[]>('/agents/templates'),
  })
}

/**
 * Fetch a specific agent template
 */
export function useAgentTemplate(type: string | undefined) {
  return useQuery({
    queryKey: queryKeys.agent.templateDetail(type ?? ''),
    queryFn: () => apiGet<AgentTemplate>(`/agents/templates/${type}`),
    enabled: !!type,
  })
}

/**
 * Execute an agent
 */
export function useExecuteAgent() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AgentExecuteRequest }) =>
      apiPost<AgentExecuteResponse>(`/agents/${id}/execute`, data),
  })
}

/**
 * Execute an agent template directly
 */
export function useExecuteAgentTemplate() {
  return useMutation({
    mutationFn: ({
      type,
      data,
    }: {
      type: string
      data: AgentExecuteRequest
    }) => apiPost<AgentExecuteResponse>(`/agents/templates/${type}/execute`, data),
  })
}
