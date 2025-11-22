/**
 * Domain models matching the FastAPI backend schemas
 */

// User roles
export type UserRole = 'participant' | 'instructor' | 'tenant_admin' | 'super_admin'

// Tenant status
export type TenantStatus = 'active' | 'inactive' | 'suspended' | 'trial'

// Workshop status
export type WorkshopStatus = 'draft' | 'published' | 'archived'

// Exercise content types
export type ContentType = 'markdown' | 'jupyter' | 'interactive'

// Progress status
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'

// Agent status
export type AgentStatus = 'stopped' | 'running' | 'error'

// Agent types
export type AgentType = 'faq' | 'scheduler' | 'router' | 'custom'

/**
 * Tenant model
 */
export interface Tenant {
  id: string
  slug: string
  name: string
  database_schema: string
  status: TenantStatus
  subscription_tier: string
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

/**
 * User model
 */
export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserWithToken extends User {
  access_token: string
  token_type: string
}

/**
 * Workshop model
 */
export interface Workshop {
  id: string
  title: string
  description: string | null
  status: WorkshopStatus
  start_date: string | null
  end_date: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

/**
 * Exercise model
 */
export interface Exercise {
  id: string
  workshop_id: string
  title: string
  content_type: ContentType
  content_path: string | null
  order_index: number
  created_at: string
  updated_at: string
}

/**
 * Progress model
 */
export interface Progress {
  id: string
  user_id: string
  exercise_id: string
  status: ProgressStatus
  completed_at: string | null
  time_spent_seconds: number
  submission_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

/**
 * Agent model
 */
export interface Agent {
  id: string
  user_id: string
  name: string
  agent_type: AgentType
  config: AgentConfig
  status: AgentStatus
  last_run_at: string | null
  created_at: string
  updated_at: string
}

export interface AgentConfig {
  model?: string
  instruction?: string
  knowledge_base?: string[]
  tools?: string[]
  [key: string]: unknown
}

/**
 * Agent execution
 */
export interface AgentExecutionRequest {
  message: string
  session_id?: string
}

export interface AgentExecutionResponse {
  success: boolean
  message: string
  data?: Record<string, unknown>
  error?: string
  session_id?: string
}

/**
 * Agent template
 */
export interface AgentTemplate {
  type: AgentType
  name: string
  description: string
  category: string
  default_config: AgentConfig
}
