/**
 * API request/response types
 */

import type {
  User,
  UserWithToken,
  Tenant,
  Workshop,
  Exercise,
  Progress,
  Agent,
  UserRole,
  TenantStatus,
  WorkshopStatus,
  ContentType,
  ProgressStatus,
  AgentType,
  AgentConfig,
} from './models'

// Re-export models
export type {
  User,
  UserWithToken,
  Tenant,
  Workshop,
  Exercise,
  Progress,
  Agent,
  UserRole,
  TenantStatus,
  WorkshopStatus,
  ContentType,
  ProgressStatus,
  AgentType,
  AgentConfig,
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}

/**
 * Generic API error response (RFC 7807)
 */
export interface ApiError {
  type: string
  title: string
  status: number
  detail: string
  instance?: string
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  service: string
  version: string
}

export interface ReadinessResponse extends HealthResponse {
  database: 'connected' | 'disconnected'
}

// =====================
// Auth/User requests
// =====================

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name?: string
}

export interface UserCreateRequest {
  email: string
  password: string
  full_name?: string
  role?: UserRole
}

export interface UserUpdateRequest {
  full_name?: string
  role?: UserRole
  is_active?: boolean
}

// =====================
// Tenant requests
// =====================

export interface TenantCreateRequest {
  slug: string
  name: string
  subscription_tier?: string
  settings?: Record<string, unknown>
}

export interface TenantUpdateRequest {
  name?: string
  status?: TenantStatus
  subscription_tier?: string
  settings?: Record<string, unknown>
}

// =====================
// Workshop requests
// =====================

export interface WorkshopCreateRequest {
  title: string
  description?: string
  status?: WorkshopStatus
  start_date?: string
  end_date?: string
}

export interface WorkshopUpdateRequest {
  title?: string
  description?: string
  status?: WorkshopStatus
  start_date?: string
  end_date?: string
}

// =====================
// Exercise requests
// =====================

export interface ExerciseCreateRequest {
  workshop_id: string
  title: string
  content_type: ContentType
  content_path?: string
  order_index: number
}

export interface ExerciseUpdateRequest {
  title?: string
  content_type?: ContentType
  content_path?: string
  order_index?: number
}

// =====================
// Progress requests
// =====================

export interface ProgressUpdateRequest {
  status: ProgressStatus
  time_spent_seconds?: number
  submission_data?: Record<string, unknown>
}

// =====================
// Agent requests
// =====================

export interface AgentCreateRequest {
  name: string
  agent_type: AgentType
  config: AgentConfig
}

export interface AgentUpdateRequest {
  name?: string
  config?: AgentConfig
}

export interface AgentExecuteRequest {
  message: string
  session_id?: string
}

export interface AgentExecuteResponse {
  success: boolean
  message: string
  data?: Record<string, unknown>
  error?: string
  session_id?: string
}

// =====================
// Query params
// =====================

export interface PaginationParams {
  skip?: number
  limit?: number
}

export interface WorkshopQueryParams extends PaginationParams {
  status?: WorkshopStatus
}

export interface ExerciseQueryParams extends PaginationParams {
  workshop_id?: string
}

export interface UserQueryParams extends PaginationParams {
  role?: UserRole
  is_active?: boolean
}
