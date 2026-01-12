/**
 * Qwen AI Integration
 * Implements state machine flow based on system_prompt_wizard_mode.md
 */

import OpenAI from 'openai'
import type {
  AIResponse,
  Message,
  MessageMetadata,
  Choice,
  EvaluationSchema,
  ParsedInput,
} from '@/lib/types'
import {
  SYSTEM_PROMPT,
  getStatePrompt,
  SCHEMA_EXTRACTION_PROMPT,
  CONVERSATION_STARTER,
  FEW_SHOT_EXAMPLES,
  BRIEF_GENERATION_PROMPT,
} from './prompts'
import {
  createEmptySchema,
  updateSchema,
  calculateCompletionScore,
  determineNextState,
  formatSchemaSummary,
} from '@/lib/schema'
import { getNextQuestion, formatQuestionForDisplay, parseAnswerValue } from '@/lib/questionBank'

// Initialize Qwen client (OpenAI-compatible) lazily
let client: OpenAI | null = null

export function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.QWEN_API_KEY

    if (!apiKey) {
      console.warn('QWEN_API_KEY is not defined - using dummy client for build/dev')
      // Return a dummy client to prevent build failures
      // This will still fail at runtime if API calls are made, which is expected
      return new OpenAI({ 
        apiKey: 'dummy', 
        baseURL: 'https://api.example.com',
        dangerouslyAllowBrowser: true 
      })
    }

    client = new OpenAI({
      apiKey,
      baseURL: process.env.QWEN_API_BASE || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    })
  }
  return client
}

const MODEL = process.env.QWEN_MODEL || 'qwen-plus'
const FAST_MODEL = 'qwen-turbo' // Faster model for quick interactions

/**
 * Parse AI response to extract choices if present
 */
function parseAIResponse(content: string): { text: string; metadata: MessageMetadata } {
  const choicesMarker = '---CHOICES---'
  const markerIndex = content.indexOf(choicesMarker)

  if (markerIndex === -1) {
    return {
      text: content.trim(),
      metadata: { type: 'text' },
    }
  }

  const text = content.slice(0, markerIndex).trim()
  const choicesJson = content.slice(markerIndex + choicesMarker.length).trim()

  try {
    const parsed = JSON.parse(choicesJson)
    if (parsed.choices && Array.isArray(parsed.choices)) {
      return {
        text,
        metadata: {
          type: 'choices',
          choices: parsed.choices as Choice[],
        },
      }
    }
  } catch (e) {
    console.error('Failed to parse choices JSON:', e)
  }

  return {
    text: content.trim(),
    metadata: { type: 'text' },
  }
}

/**
 * Extract schema fields from user input using AI
 */
export async function extractSchemaFromInput(
  userMessage: string,
  currentSchema: EvaluationSchema
): Promise<ParsedInput> {
  try {
    const response = await getClient().chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: SCHEMA_EXTRACTION_PROMPT,
        },
        {
          role: 'user',
          content: `当前 Schema 状态：
${formatSchemaSummary(currentSchema)}

用户输入：
${userMessage}

请提取信息并返回 JSON：`,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    })

    const content = response.choices[0]?.message?.content || ''

    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        understood: parsed.understood || userMessage,
        extractedFields: parsed.extracted || {},
        confidence: parsed.confidence || 0.5,
      }
    }
  } catch (e) {
    console.error('Schema extraction error:', e)
  }

  // Fallback: return minimal extraction
  return {
    understood: userMessage,
    extractedFields: {},
    confidence: 0.3,
  }
}

/**
 * Process user input through the state machine
 */
export async function processUserInput(params: {
  userMessage: string
  schema: EvaluationSchema
  previousMessages?: Array<{ role: string; content: string }>
}): Promise<{
  response: AIResponse
  updatedSchema: EvaluationSchema
}> {
  const { userMessage, schema, previousMessages = [] } = params

  // Step 1: Extract schema fields from user input
  const parsed = await extractSchemaFromInput(userMessage, schema)

  // Step 2: Update schema with extracted fields
  let updatedSchema = updateSchema(schema, parsed.extractedFields)
  const score = calculateCompletionScore(updatedSchema)
  updatedSchema._meta.completion_score = score

  // Step 3: Determine next state
  const nextState = determineNextState(score)
  updatedSchema._meta.current_state = nextState

  // Step 4: Get next question if needed
  const nextQuestion = nextState === 'ASK_QUESTION' ? getNextQuestion(updatedSchema) : null
  const questionDisplay = nextQuestion ? formatQuestionForDisplay(nextQuestion) : null

  // Step 5: Generate AI response based on state
  const statePrompt = getStatePrompt(nextState, {
    schema: updatedSchema,
    score,
    nextQuestion: questionDisplay?.text,
  })

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: SYSTEM_PROMPT + '\n\n' + statePrompt,
    },
  ]

  // Add few-shot examples for initial messages
  if (previousMessages.length < 4) {
    messages.push(...FEW_SHOT_EXAMPLES)
  }

  // Add conversation history
  for (const msg of previousMessages.slice(-6)) {
    messages.push({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage,
  })

  try {
    const response = await getClient().chat.completions.create({
      model: FAST_MODEL, // Use faster model for initial interactions
      messages,
      temperature: 0.6,
      max_tokens: 500, // Reduced for faster response
    })

    const content = response.choices[0]?.message?.content || ''
    const { text, metadata } = parseAIResponse(content)

    // If we have a question with choices, use those instead of AI-generated ones
    if (questionDisplay?.choices && nextState === 'ASK_QUESTION') {
      metadata.type = 'choices'
      metadata.choices = questionDisplay.choices
    }

    return {
      response: {
        content: text,
        metadata,
        schemaUpdates: parsed.extractedFields,
        nextState,
        completionScore: score,
      },
      updatedSchema,
    }
  } catch (error) {
    console.error('Qwen API error:', error)
    throw new Error('AI 服务暂时不可用，请稍后再试')
  }
}

/**
 * Generate conversation starter message
 */
export async function generateStarterMessage(): Promise<AIResponse> {
  return {
    content: CONVERSATION_STARTER,
    metadata: { type: 'text' },
    nextState: 'PARSE_INPUT',
    completionScore: 0,
  }
}

/**
 * Generate Pre-build Brief from schema
 */
export async function generateBrief(params: {
  schema: EvaluationSchema
  messages: Message[]
}): Promise<string> {
  const { schema, messages } = params

  const conversationSummary = messages
    .filter((m) => m.role !== 'system')
    .slice(-10)
    .map((m) => `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}`)
    .join('\n\n')

  const prompt = `${BRIEF_GENERATION_PROMPT}

## 评估 Schema 数据
${formatSchemaSummary(schema)}

## 对话摘要
${conversationSummary}

请生成 Pre-build Brief：`

  try {
    const response = await getClient().chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的技术顾问，擅长为独立开发者生成清晰、实用的项目简报。使用温和鼓励的语气。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Brief generation error:', error)
    throw new Error('生成 Brief 失败，请稍后再试')
  }
}

/**
 * Handle specific question answer and update schema
 */
export function handleQuestionAnswer(
  schema: EvaluationSchema,
  questionId: string,
  answer: string
): EvaluationSchema {
  const { getQuestionById } = require('@/lib/questionBank')
  const question = getQuestionById(questionId)

  if (!question) {
    return schema
  }

  const value = parseAnswerValue(question, answer)
  const fieldParts = question.field.split('.')

  const updates: Record<string, Record<string, string>> = {
    [fieldParts[0]]: {
      [fieldParts[1]]: value,
    },
  }

  return updateSchema(schema, updates as Parameters<typeof updateSchema>[1])
}

/**
 * Test Qwen API connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const response = await getClient().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: '你是一个助手' },
        { role: 'user', content: '你好' },
      ],
      max_tokens: 50,
    })

    return !!response.choices[0]?.message?.content
  } catch (error) {
    console.error('Connection test failed:', error)
    return false
  }
}

// Export legacy function for backward compatibility
export async function generateAIResponse(params: {
  conversationId: string
  userMessage: string
  currentLayer?: number
  previousMessages?: Array<{ role: string; content: string }>
  isFirstMessage?: boolean
}): Promise<AIResponse> {
  const schema = createEmptySchema()
  const result = await processUserInput({
    userMessage: params.userMessage,
    schema,
    previousMessages: params.previousMessages,
  })
  return result.response
}

/**
 * Process user input with streaming response
 * Returns an async generator that yields content chunks
 */
export async function* processUserInputStreaming(params: {
  userMessage: string
  schema: EvaluationSchema
  previousMessages?: Array<{ role: string; content: string }>
}): AsyncGenerator<{
  type: 'content' | 'metadata' | 'schema' | 'done'
  content?: string
  metadata?: MessageMetadata
  schema?: EvaluationSchema
  completionScore?: number
  nextState?: string
}> {
  const { userMessage, schema, previousMessages = [] } = params

  // Step 1: Extract schema fields from user input
  const parsed = await extractSchemaFromInput(userMessage, schema)

  // Step 2: Update schema with extracted fields
  let updatedSchema = updateSchema(schema, parsed.extractedFields)
  const score = calculateCompletionScore(updatedSchema)
  updatedSchema._meta.completion_score = score

  // Step 3: Determine next state
  const nextState = determineNextState(score)
  updatedSchema._meta.current_state = nextState

  // Step 4: Get next question if needed
  const nextQuestion = nextState === 'ASK_QUESTION' ? getNextQuestion(updatedSchema) : null
  const questionDisplay = nextQuestion ? formatQuestionForDisplay(nextQuestion) : null

  // Step 5: Generate AI response based on state with streaming
  const statePrompt = getStatePrompt(nextState, {
    schema: updatedSchema,
    score,
    nextQuestion: questionDisplay?.text,
  })

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: SYSTEM_PROMPT + '\n\n' + statePrompt,
    },
  ]

  // Add few-shot examples for initial messages
  if (previousMessages.length < 4) {
    messages.push(...FEW_SHOT_EXAMPLES)
  }

  // Add conversation history
  for (const msg of previousMessages.slice(-6)) {
    messages.push({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage,
  })

  try {
    const stream = await getClient().chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1500,
      stream: true,
    })

    let fullContent = ''

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || ''
      if (delta) {
        fullContent += delta
        yield { type: 'content', content: delta }
      }
    }

    // Parse the complete response for choices
    const { metadata } = parseAIResponse(fullContent)

    // If we have a question with choices, use those
    if (questionDisplay?.choices && nextState === 'ASK_QUESTION') {
      metadata.type = 'choices'
      metadata.choices = questionDisplay.choices
    }

    // Yield metadata and final schema
    yield {
      type: 'metadata',
      metadata,
    }

    yield {
      type: 'schema',
      schema: updatedSchema,
      completionScore: score,
      nextState,
    }

    yield { type: 'done' }
  } catch (error) {
    console.error('Qwen streaming error:', error)
    throw new Error('AI 服务暂时不可用，请稍后再试')
  }
}

/**
 * Generate dynamic questions based on project context (Vibe Checker 2.0)
 */
export async function generateProjectQuestions(schema: EvaluationSchema): Promise<any[]> {
  const prompt = `You are a Vibe Coding Consultant.
User's Idea: ${schema.idea.one_liner}
Core Function: ${schema.mvp.first_job}
Target User: ${schema.user.primary_user}

You are an expert product manager (Vibe Coder style).
Your goal is to generate 3-4 "Killer Questions" to help the user clarify their idea and identify risks.

PROJECT ANALYSIS:
1. **Identify Category**:
   - **Tool**: Efficiency, solving personal pain. (Focus: "How do you solve it now?")
   - **Content**: Information, media. (Focus: "Where does content come from?", "Can you keep updating?")
   - **Transaction/Platform**: Connecting two parties. (Focus: "Can you find first users?", "Offline ops?")
   - **AI Wrapper**: API based. (Focus: "What if AI makes mistakes?", "Differentiation?")

2. **Check Discouragement Triggers** (If found, ASK these immediately to warn user):
   - **Offline Operations**: Delivery, meetups, hardware.
   - **Regulation**: Finance, Health, payment flows.
   - **Complexity**: Training models, high concurrency.
   - **Cold Start**: Needs 2-sided network.

GENERATION RULES:
1. **First Question** MUST be the "Extension of Experience" question if not answered (e.g. "Have you built similar things?").
2. **Subsequent Questions**: Pick the most critical risks based on Category.
3. **Options**: Provide 3-4 distinct paths.
4. **Feedback**: For EACH option, provide immediate "Vibe Check" feedback.
   - If user picks a "Hard Mode" option (e.g. Offline, Native App), feedback MUST be a 'warning'.
   - If user picks a "Vibe Mode" option (e.g. Web, Tools), feedback should be 'positive'.

OUTPUT FORMAT:
Return a JSON object with a "questions" array.
Each question object:
- \`id\`: string
- \`field\`: string (Map to one of: 'user.experience_level', 'mvp.type', 'platform.form', 'constraints.api_or_data_dependency', 'preference.priority', 'problem.scenario')
- \`question\`: string (The question text)
- \`insight\`: string (Why we ask this)
- \`options\`: array of objects:
  - \`id\`: string
  - \`label\`: string
  - \`value\`: string (Maps to schema enums. For experience_level: 'never'|'tutorial'|'small_project'|'veteran'. For others use standard schema values found in types definitions)
  - \`feedback\`: { \`type\`: 'positive'|'warning'|'neutral', \`message\`: string }
  - \`tags\`: string[] (e.g. ['easy', 'hard'])

### Example Option Values for Mapping
- experience_level: 'never', 'tutorial', 'small_project', 'veteran'
- mvp.type: 'content_tool', 'functional_tool', 'ai_tool', 'transaction_tool'
- platform.form: 'web', 'ios', 'miniprogram', 'plugin' (use 'web' for easiest)
- priority: 'ship_fast', 'cost_first'
`

  try {
    const response = await getClient().chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'Output JSON only. Ensure valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content || '{}'
    const result = JSON.parse(content)
    return result.questions || []
  } catch (error) {
    console.error('Generate questions error:', error)
    // Fallback if AI fails
    return [
      {
        id: 'experience',
        field: 'user.experience_level',
        question: '你之前做过类似的产品吗？',
        insight: '了解你的经验能帮我调整建议的难度。',
        type: 'choice',
        options: [
          { 
            id: 'never', 
            label: '第一次尝试', 
            value: 'never',
            feedback: { type: 'neutral', message: '没关系，我会给你最详细的指引。' }
          },
          { 
            id: 'veteran', 
            label: '老手了', 
            value: 'veteran',
            feedback: { type: 'positive', message: '太好了，我们可以直接聊核心难点。' }
          }
        ]
      }
    ]
  }
}
