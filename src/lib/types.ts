/**
 * Vibe Checker - Type Definitions
 * Based on schema_framework_v1.md and system_prompt_wizard_mode.md
 */

// ================================
// Evaluation Schema Types (核心 Schema)
// ================================

// ================================
// Evaluation Schema Types (Core Schema)
// ================================

/**
 * Pain level enum
 */
export type PainLevel = 'low' | 'medium' | 'high' | 'unknown'

/**
 * MVP type enum
 */
export type MVPType = 'content_tool' | 'functional_tool' | 'ai_tool' | 'transaction_tool' | 'other' | 'unknown'

/**
 * User experience level (V2.0 State Question)
 */
export type ExperienceLevel = 
  | 'never'           // 从没用 AI 做过东西
  | 'tutorial'        // 跟着教程做过
  | 'small_project'   // 做过一些小东西
  | 'veteran'         // 做过好几个了
  | 'unknown'

/**
 * Platform form enum
 */
export type PlatformForm = 'web' | 'ios' | 'android' | 'plugin' | 'cli' | 'miniprogram' | 'unknown'

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
    experience_level: ExperienceLevel // V2.0 added
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
  | 'user.experience_level' // V2.0 added
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
  'platform.form',
]

// ================================
// Question Bank Types (V2.0)
// ================================

/**
 * Feedback provided immediately after selection
 */
export interface OptionFeedback {
  type: 'positive' | 'warning' | 'neutral'
  message: string
}

/**
 * Report impact configuration
 */
export interface ReportImpact {
  tech_stack?: string
  timeline?: string
  cost?: string
  risk?: string
}

/**
 * Question option with metadata
 */
export interface QuestionOption {
  id: string
  label: string
  value: string
  feedback?: OptionFeedback    // V2.0 added: Immediate feedback
  tags?: string[]             // V2.0 added: Logic tags
  report_impact?: ReportImpact // V2.0 added: For report generation logic
}

/**
 * Question structure
 */
export interface Question {
  id: string
  field: SchemaFieldPath
  question: string // The main question text
  insight?: string // V2.0 added: "Why we ask this" (点拨)
  type: 'choice' | 'open'
  options?: QuestionOption[]
  priority: number
  isMVP: boolean
}

// ================================
// Conversation Types
// ================================

export type ConversationStatus = 'active' | 'completed' | 'abandoned'
export type MessageRole = 'user' | 'assistant' | 'system'

export interface Choice {
  id: string
  text: string
}

export interface MessageMetadata {
  type?: 'text' | 'choices' | 'summary' | 'evaluation'
  choices?: Choice[]
  selectedChoice?: string
  updatedFields?: SchemaFieldPath[]
  generatedQuestions?: Question[] // V2.0 added: Store generated questions
}

export interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  metadata?: MessageMetadata
  created_at: string
}

export interface Conversation {
  id: string
  user_id?: string
  status: ConversationStatus
  schema_data: EvaluationSchema
  project_name?: string
  project_description?: string
  metadata?: Record<string, unknown> // Stores generatedQuestions, report data, etc.
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[]
}

// ================================
// Report 2.0 Output Types
// ================================

export interface ReportScore {
  feasibility: number // 0-100
  breakdown: {
    tech: number
    market: number
    onboarding: number
    user_match: number
  }
}

export interface TechStackOption {
  id: string
  name: string // "方案A：极简版"
  tools: string[] // ["v0", "Vercel"]
  capability: string // "展示、简单交互"
  difficulty: number // 1-5 stars
  dev_time: string // "2-4 hours"
  cost: string // "0 元"
  fit_for: string // "先验证想法"
}

export interface ExecutionStep {
  title: string
  description: string
  action_url?: string
  action_label?: string
  copy_text?: string // Prompt to copy
}

export interface VibeReport {
  score: ReportScore
  one_liner_conclusion: string
  
  why_worth_it: string[]
  risks: string[]
  
  market_analysis: {
    competitors: { name: string; pros: string; cons: string; url?: string }[]
    opportunity: string
    search_trends?: string
  }
  
  tech_options: {
    option_a: TechStackOption
    option_b: TechStackOption
    advice: string
  }
  
  fastest_path: ExecutionStep[]
  
  cost_estimate: {
    time_breakdown: string
    money_breakdown: string
  }
  
  pitfalls: string[]
  
  next_steps: {
    today: string[]
    this_week: string[]
    later: string[]
  }
  
  learning_takeaways: string[]
}

// ================================
// Legacy Types Support (For backward compatibility)
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

export interface EvaluationResult {
  summary: string
  feasibility: FeasibilityAssessment
  risks: string[]
  recommendation: RecommendedApproach
  // V2.0 Extension
  v2_report?: VibeReport
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
