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
  refresh_token: string
  token_type: string
  expires_in: number
}

/**
 * Workshop model
 */
export interface Workshop {
  id: string
  title: string
  description: string | null
  status: WorkshopStatus
  order_index?: number
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
  description?: string | null
  content_type: ContentType
  content_path: string | null
  order_index: number
  estimated_minutes?: number | null
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

/**
 * Setup Steps for progress tracking
 */
export type SetupStep =
  | 'welcome'
  | 'prerequisites'
  | 'venv'
  | 'install-adk'
  | 'api-key'
  | 'verify'
  | 'complete'

/**
 * Achievement/Badge types
 */
export type BadgeType =
  | 'environment-setup'
  | 'first-workshop'
  | 'first-exercise'
  | 'visual-builder-master'

export interface Badge {
  id: BadgeType
  name: string
  description: string
  icon: string
  earnedAt: string | null
}

/**
 * User Settings model
 * Stored in localStorage and optionally synced to backend
 */
export interface UserSettings {
  // Development Environment
  localBuilderUrl: string
  autoDetectBuilder: boolean

  // Setup Progress
  setupCompleted: boolean
  setupCompletedAt: string | null
  setupStepsCompleted: SetupStep[]
  currentSetupStep: SetupStep

  // Achievements
  badges: Badge[]

  // Preferences
  theme: 'light' | 'dark' | 'system'
  emailNotifications: boolean
}

export const AVAILABLE_BADGES: Omit<Badge, 'earnedAt'>[] = [
  {
    id: 'environment-setup',
    name: 'Environment Setup',
    description: 'Successfully configured your local ADK development environment',
    icon: '🚀',
  },
  {
    id: 'first-workshop',
    name: 'Workshop Graduate',
    description: 'Completed your first workshop',
    icon: '🎓',
  },
  {
    id: 'first-exercise',
    name: 'First Steps',
    description: 'Completed your first exercise',
    icon: '✅',
  },
  {
    id: 'visual-builder-master',
    name: 'Visual Builder Master',
    description: 'Built your first agent with the Visual Builder',
    icon: '🛠️',
  },
]

export const DEFAULT_USER_SETTINGS: UserSettings = {
  localBuilderUrl: 'http://localhost:8000',
  autoDetectBuilder: true,
  setupCompleted: false,
  setupCompletedAt: null,
  setupStepsCompleted: [],
  currentSetupStep: 'welcome',
  badges: AVAILABLE_BADGES.map(badge => ({ ...badge, earnedAt: null })),
  theme: 'system',
  emailNotifications: true,
}

/**
 * Library Resource Types
 */
export type LibraryResourceType = 'article' | 'video' | 'pdf' | 'tool' | 'course' | 'documentation'

export type LibraryResourceSource = 'external' | 'embedded' | 'uploaded'

export type LibraryTopic =
  | 'agent-fundamentals'
  | 'prompt-engineering'
  | 'multi-agent-systems'
  | 'tools-integrations'
  | 'deployment'
  | 'best-practices'

export type LibraryDifficulty = 'beginner' | 'intermediate' | 'advanced'

// Resource progress status (for library)
export type ResourceProgressStatus = 'not_started' | 'in_progress' | 'completed'

/**
 * Library Resource model
 */
export interface LibraryResource {
  id: string
  title: string
  description: string
  type: LibraryResourceType
  source: LibraryResourceSource
  externalUrl?: string
  contentPath?: string
  contentHtml?: string
  topics: LibraryTopic[]
  difficulty: LibraryDifficulty
  author?: string
  estimatedMinutes?: number
  thumbnailUrl?: string
  featured?: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Library Resource with user-specific data (from API, transformed to camelCase)
 */
export interface LibraryResourceWithUserData extends LibraryResource {
  isBookmarked: boolean
  progressStatus: ResourceProgressStatus | null
  isFeatured: boolean
}

/**
 * User Bookmark model
 */
export interface UserBookmark {
  id: string
  user_id: string
  resource_id: string
  created_at: string
}

/**
 * Resource Progress model
 */
export interface ResourceProgress {
  id: string
  user_id: string
  resource_id: string
  status: ResourceProgressStatus
  last_viewed_at: string | null
  completed_at: string | null
  time_spent_seconds: number
  created_at: string
  updated_at: string
}

/**
 * Bookmark status response
 */
export interface BookmarkStatusResponse {
  is_bookmarked: boolean
  bookmarked_at: string | null
}

/**
 * Library query parameters (frontend uses camelCase, transformed to snake_case for API)
 */
export interface LibraryQueryParams {
  skip?: number
  limit?: number
  search?: string
  type?: LibraryResourceType
  topic?: LibraryTopic
  difficulty?: LibraryDifficulty
  featured?: boolean
  bookmarked?: boolean
  progressStatus?: ResourceProgressStatus
}

/**
 * Guide Types
 */
export type GuideIcon = 'book' | 'rocket' | 'terminal' | 'wrench' | 'play'

/**
 * Guide model (list item without full content)
 */
export interface GuideListItem {
  id: string
  slug: string
  title: string
  description: string
  icon: GuideIcon
  displayOrder: number
  published: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Guide model (full with content)
 */
export interface Guide extends GuideListItem {
  contentHtml: string
}

/**
 * API Response types for guides (snake_case from backend)
 */
export interface ApiGuideListItem {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  display_order: number
  published: boolean
  created_at: string
  updated_at: string
}

export interface ApiGuide extends ApiGuideListItem {
  content_html: string
}

/**
 * Agent Template Types (for Template Library)
 */
export type TemplateStatus = 'draft' | 'pending_review' | 'approved' | 'rejected'

export type TemplateCategory =
  | 'hr'
  | 'scheduling'
  | 'faq'
  | 'customer-service'
  | 'data-entry'
  | 'workflow'
  | 'healthcare'
  | 'other'

export type TemplateDifficulty = 'beginner' | 'intermediate' | 'advanced'

/**
 * Agent Template model (for sharing YAML templates)
 */
export interface AgentTemplateItem {
  id: string
  name: string
  description: string
  category: TemplateCategory
  difficulty: TemplateDifficulty
  tags: string[]
  authorName: string
  status: TemplateStatus
  featured: boolean
  downloadCount: number
  model: string | null
  hasTools: boolean
  hasSubAgents: boolean
  thumbnailUrl: string | null
  createdAt: string
}

export interface AgentTemplateDetail extends AgentTemplateItem {
  yamlContent: string
  useCase: string | null
  authorId: string | null
  rejectionReason: string | null
  approvedBy: string | null
  approvedAt: string | null
  updatedAt: string
}

export interface AgentTemplateWithUserData extends AgentTemplateDetail {
  isBookmarked: boolean
}

/**
 * Template query parameters
 */
export interface TemplateQueryParams {
  skip?: number
  limit?: number
  search?: string
  category?: TemplateCategory
  difficulty?: TemplateDifficulty
  featured?: boolean
  hasTools?: boolean
  hasSubAgents?: boolean
  status?: TemplateStatus
}

/**
 * Template create/update data
 */
export interface TemplateCreateData {
  name: string
  description: string
  yamlContent: string
  category: TemplateCategory
  difficulty: TemplateDifficulty
  useCase?: string
  tags?: string[]
  thumbnailUrl?: string
}

export interface TemplateUpdateData {
  name?: string
  description?: string
  yamlContent?: string
  category?: TemplateCategory
  difficulty?: TemplateDifficulty
  useCase?: string
  tags?: string[]
  thumbnailUrl?: string
}

/**
 * Template bookmark status
 */
export interface TemplateBookmarkStatus {
  isBookmarked: boolean
  bookmarkedAt: string | null
}

/**
 * Template download response
 */
export interface TemplateDownloadResponse {
  filename: string
  content: string
  contentType: string
}

/**
 * Template statistics (admin)
 */
export interface TemplateStats {
  totalTemplates: number
  approvedTemplates: number
  pendingTemplates: number
  totalDownloads: number
  templatesByCategory: Record<string, number>
  templatesByDifficulty: Record<string, number>
}

/**
 * API Response types for templates (snake_case from backend)
 */
export interface ApiAgentTemplateItem {
  id: string
  name: string
  description: string
  category: string
  difficulty: string
  tags: string[]
  author_name: string
  status: string
  featured: boolean
  download_count: number
  model: string | null
  has_tools: boolean
  has_sub_agents: boolean
  thumbnail_url: string | null
  created_at: string
}

export interface ApiAgentTemplateDetail extends ApiAgentTemplateItem {
  yaml_content: string
  use_case: string | null
  author_id: string | null
  rejection_reason: string | null
  approved_by: string | null
  approved_at: string | null
  updated_at: string
}
