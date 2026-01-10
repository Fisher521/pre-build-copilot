/**
 * Pre-build Copilot - Type Definitions
 * Based on schema_framework_v1.md and system_prompt_wizard_mode.md
 */

// ================================
// Evaluation Schema Types (核心 Schema)
// ================================

/**
 * Pain level enum
 */
export type PainLevel = 'low' | 'medium' | 'high' | 'unknown'

/**
 * MVP type enum
 */
export type MVPType = 'content_tool' | 'functional_tool' | 'ai_tool' | 'other' | 'unknown'

/**
 * Platform form enum
 */
export type PlatformForm = 'web' | 'ios' | 'android' | 'plugin' | 'cli' | 'unknown'

/**
 * API/Data dependency enum
 */
export type APIDependency = 'none' | 'possible' | 'confirmed' | 'unknown'

/**
 * Privacy level enum
 */
export type PrivacyLevel = 'low' | 'medium' | 'high' | 'unknown'

/**
 * Priority preference enum
 */
export type PriorityPreference = 'ship_fast' | 'stable_first' | 'cost_first' | 'unknown'

/**
 * Timeline preference enum
 */
export type TimelinePreference = '7d' | '14d' | '30d' | 'flexible' | 'unknown'

/**
 * State machine states
 */
export type WizardState =
  | 'PARSE_INPUT'
  | 'CHECK_THRESHOLD'
  | 'ASK_QUESTION'
  | 'PRELIMINARY_EVAL'
  | 'FULL_EVAL'

/**
 * Core Evaluation Schema
 * 后台统一结构模板
 */
export interface EvaluationSchema {
  idea: {
    one_liner: string
    background: string
  }
  problem: {
    scenario: string
    pain_level: PainLevel
  }
  user: {
    primary_user: string
    usage_context: string
  }
  mvp: {
    first_job: string
    type: MVPType
  }
  platform: {
    form: PlatformForm
  }
  constraints: {
    api_or_data_dependency: APIDependency
    privacy_level: PrivacyLevel
  }
  preference: {
    priority: PriorityPreference
    timeline: TimelinePreference
  }
  _meta: {
    current_state: WizardState
    completion_score: number
    last_updated_field: string
    created_at: string
    updated_at: string
  }
}

/**
 * Schema field path (用于追问问题映射)
 */
export type SchemaFieldPath =
  | 'idea.one_liner'
  | 'idea.background'
  | 'problem.scenario'
  | 'problem.pain_level'
  | 'user.primary_user'
  | 'user.usage_context'
  | 'mvp.first_job'
  | 'mvp.type'
  | 'platform.form'
  | 'constraints.api_or_data_dependency'
  | 'constraints.privacy_level'
  | 'preference.priority'
  | 'preference.timeline'

/**
 * MVP required fields
 */
export const MVP_REQUIRED_FIELDS: SchemaFieldPath[] = [
  'idea.one_liner',
  'user.primary_user',
  'mvp.type',
  'platform.form',
  'preference.timeline'
]

// ================================
// Question Bank Types
// ================================

/**
 * Question type
 */
export type QuestionType = 'choice' | 'open'

/**
 * Question option
 */
export interface QuestionOption {
  id: string
  label: string
  value: string
}

/**
 * Question from question bank
 */
export interface Question {
  id: string
  field: SchemaFieldPath
  question: string
  type: QuestionType
  options?: QuestionOption[]
  priority: number
  isMVP: boolean
}

// ================================
// Conversation Types
// ================================

/**
 * Conversation status
 */
export type ConversationStatus = 'active' | 'completed' | 'abandoned'

/**
 * Message role
 */
export type MessageRole = 'user' | 'assistant' | 'system'

/**
 * Choice option in selection questions
 */
export interface Choice {
  id: string
  text: string
}

/**
 * Message metadata for special content types
 */
export interface MessageMetadata {
  type?: 'text' | 'choices' | 'summary' | 'evaluation'
  choices?: Choice[]
  selectedChoice?: string
  updatedFields?: SchemaFieldPath[]
}

/**
 * Chat message
 */
export interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  metadata?: MessageMetadata
  created_at: string
}

/**
 * Conversation session
 */
export interface Conversation {
  id: string
  user_id?: string
  status: ConversationStatus
  schema_data: EvaluationSchema
  project_name?: string
  project_description?: string
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
  completed_at?: string
}

/**
 * Conversation with messages
 */
export interface ConversationWithMessages extends Conversation {
  messages: Message[]
}

// ================================
// Evaluation Output Types
// ================================

/**
 * Feasibility assessment
 */
export interface FeasibilityAssessment {
  technical: 'positive' | 'warning' | 'negative'
  technical_note: string
  timeline: 'positive' | 'warning' | 'negative'
  timeline_note: string
  resource: 'positive' | 'warning' | 'negative'
  resource_note: string
}

/**
 * Recommended approach
 */
export interface RecommendedApproach {
  title: string
  description: string
  reasons: string[]
  next_steps: string[]
}

/**
 * Evaluation result
 */
export interface EvaluationResult {
  summary: string
  feasibility: FeasibilityAssessment
  risks: string[]
  recommendation: RecommendedApproach
}

// ================================
// AI Response Types
// ================================

/**
 * AI response from chat API
 */
export interface AIResponse {
  content: string
  metadata: MessageMetadata
  schemaUpdates?: Partial<EvaluationSchema>
  nextState?: WizardState
  completionScore?: number
}

/**
 * Parsed user input result
 */
export interface ParsedInput {
  understood: string
  extractedFields: Partial<EvaluationSchema>
  confidence: number
}

// ================================
// API Request/Response Types
// ================================

/**
 * Chat API request
 */
export interface ChatRequest {
  conversationId: string
  message: string
}

/**
 * Chat API response
 */
export interface ChatResponse extends AIResponse {
  messageId?: string
}

/**
 * Create conversation request
 */
export interface CreateConversationRequest {
  initialInput?: string
}

/**
 * Create conversation response
 */
export interface CreateConversationResponse {
  conversationId: string
  schema: EvaluationSchema
}

// ================================
// Component Props Types
// ================================

/**
 * Button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'text'

/**
 * Button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Progress indicator props
 */
export interface ProgressIndicatorProps {
  score: number
  mvpFieldsCompleted: number
  totalMvpFields: number
}

/**
 * Message bubble props
 */
export interface MessageBubbleProps {
  message: Message
  isLast?: boolean
}

/**
 * Choice buttons props
 */
export interface ChoiceButtonsProps {
  choices: Choice[]
  onSelect: (choiceId: string) => void
  disabled?: boolean
}

/**
 * Chat input props
 */
export interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

// ================================
// Store Types
// ================================

/**
 * Chat store state
 */
export interface ChatState {
  conversationId: string | null
  messages: Message[]
  schema: EvaluationSchema | null
  currentState: WizardState
  isLoading: boolean
  error: string | null
}

/**
 * Chat store actions
 */
export interface ChatActions {
  setConversationId: (id: string) => void
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  updateSchema: (updates: Partial<EvaluationSchema>) => void
  setCurrentState: (state: WizardState) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

/**
 * Chat store
 */
export type ChatStore = ChatState & ChatActions

// ================================
// Legacy types (保持向后兼容)
// ================================

/**
 * @deprecated Use WizardState instead
 */
export type ConversationLayer = 1 | 2 | 3

/**
 * Competitor analysis result
 */
export interface Competitor {
  name: string
  url?: string
  description: string
  features: string[]
}

/**
 * Market analysis data
 */
export interface MarketAnalysis {
  competitors: Competitor[]
  differentiators: string[]
  market_size?: string
}

/**
 * Tech stack recommendation
 */
export interface TechStack {
  recommended: string
  alternatives: string[]
  reasoning: string
}

/**
 * Cost estimate breakdown
 */
export interface CostEstimate {
  development: {
    optimistic: number
    normal: number
    pessimistic: number
    unit: 'hours' | 'days' | 'weeks'
  }
  monthly_operating?: {
    hosting: number
    database: number
    ai_api: number
    other: number
    currency: string
  }
}

/**
 * Timeline estimate
 */
export interface TimelineEstimate {
  optimistic: number
  normal: number
  pessimistic: number
  unit: 'days' | 'weeks' | 'months'
}

/**
 * Learning resource
 */
export interface LearningResource {
  title: string
  url: string
  type: 'documentation' | 'tutorial' | 'video' | 'course' | 'article'
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

/**
 * Risk item
 */
export interface Risk {
  type: 'technical' | 'market' | 'resource' | 'timeline'
  description: string
  mitigation?: string
  severity: 'low' | 'medium' | 'high'
}

/**
 * Brief types (保留用于生成最终报告)
 */
export interface Brief {
  id: string
  conversation_id: string
  project_name: string
  project_description?: string
  market_analysis?: MarketAnalysis
  tech_stack?: TechStack
  cost_estimate?: CostEstimate
  timeline_estimate?: TimelineEstimate
  learning_resources?: LearningResource[]
  risks?: Risk[]
  markdown_content: string
  created_at: string
  updated_at?: string
}
