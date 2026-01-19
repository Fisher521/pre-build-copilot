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
  getSchemaExtractionPrompt,
  CONVERSATION_STARTER,
  FEW_SHOT_EXAMPLES,
  BRIEF_GENERATION_PROMPT,
} from './prompts'
import type { Language } from '@/contexts/LanguageContext'
import { withRetry, parseAIError } from './utils'
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
  currentSchema: EvaluationSchema,
  language: Language = 'zh'
): Promise<ParsedInput> {
  // Language-specific user message templates
  const userMessageTemplate = language === 'en'
    ? `Current Schema State:
${formatSchemaSummary(currentSchema)}

User Input:
${userMessage}

Extract information and return JSON (respond in English only):`
    : `当前 Schema 状态：
${formatSchemaSummary(currentSchema)}

用户输入：
${userMessage}

请提取信息并返回 JSON（请用中文回复）：`

  try {
    const response = await getClient().chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: getSchemaExtractionPrompt(language),
        },
        {
          role: 'user',
          content: userMessageTemplate,
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
  language?: Language
}): Promise<{
  response: AIResponse
  updatedSchema: EvaluationSchema
}> {
  const { userMessage, schema, previousMessages = [], language = 'zh' } = params

  // Step 1: Extract schema fields from user input
  const parsed = await extractSchemaFromInput(userMessage, schema, language)

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
    const response = await withRetry(
      async () => {
        return await getClient().chat.completions.create({
          model: FAST_MODEL, // Use faster model for initial interactions
          messages,
          temperature: 0.6,
          max_tokens: 500, // Reduced for faster response
        })
      },
      {
        maxRetries: 2,
        timeoutMs: 30000, // 30秒超时
        initialDelayMs: 1000,
      }
    )

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
    throw new Error(parseAIError(error))
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
export async function generateProjectQuestions(schema: EvaluationSchema, lang: 'zh' | 'en' = 'zh'): Promise<any[]> {
  const isEnglish = lang === 'en'

  const prompt = isEnglish ? `You are a Vibe Coding consultant.

【Project Info】
- Idea: ${schema.idea.one_liner}
- Core feature: ${schema.mvp.first_job}
- Target user: ${schema.user.primary_user}

You are a professional product consultant (Vibe Coder style).
Your goal is to generate 3-4 "key questions" to help the user clarify their thinking and identify risks.

【Project Analysis】
1. **Identify project type**:
   - **Tool**: Efficiency improvement, solving personal pain points. (Key question: How do you solve this problem now?)
   - **Content**: Information, media. (Key question: Where does the content come from? Can you keep updating?)
   - **Transaction/Platform**: Connecting two sides. (Key question: Can you find the first batch of users? Does it need offline operations?)
   - **AI wrapper**: Based on API. (Key question: What if AI makes mistakes? How to differentiate?)

2. **Warning signs** (if you find these, you must immediately warn the user):
   - **Offline operations**: Delivery, meetings, hardware
   - **Heavy regulation**: Finance, healthcare, payments
   - **Technical complexity**: Training models, high concurrency
   - **Cold start difficulty**: Needs two-sided network effects

【Generation Rules】
1. **First question** must be about "experience level" (e.g., Have you done similar projects before?)
2. **Following questions**: Choose the most critical risk points based on project type
3. **Options**: Provide 3-4 different choices
4. **Feedback**: Each option should have instant feedback
   - If user chooses "hard mode" (e.g., offline, native App), feedback type must be 'warning'
   - If user chooses "easy mode" (e.g., web, tool), feedback type should be 'positive'

【IMPORTANT】All content must be output in English!

【Output Format】
Return a JSON object containing a "questions" array.
Each question object:
- \`id\`: string
- \`field\`: string (maps to: 'user.experience_level', 'mvp.type', 'platform.form', 'constraints.api_or_data_dependency', 'preference.priority', 'problem.scenario')
- \`question\`: string (question text, in English)
- \`insight\`: string (why asking this, in English)
- \`options\`: array, each option contains:
  - \`id\`: string
  - \`label\`: string (option text, in English)
  - \`value\`: string (enum value)
  - \`feedback\`: { \`type\`: 'positive'|'warning'|'neutral', \`message\`: string (English feedback) }
  - \`tags\`: string[]

### Enum values reference (IMPORTANT: Use these exact values for international/global audience)
- experience_level: 'never', 'tutorial', 'small_project', 'veteran'
- mvp.type: 'content_tool', 'functional_tool', 'ai_tool', 'transaction_tool'
- platform.form: 'web', 'pwa', 'browser_extension', 'mobile_app' (NO 'miniprogram' - that's China-only!)
- priority: 'ship_fast', 'cost_first'

【Platform Form Labels for English】
- 'web': "Web app, open and use" (easiest, positive feedback)
- 'pwa': "PWA / Installable web app" (moderate, neutral/positive feedback)
- 'browser_extension': "Browser extension" (moderate, neutral feedback)
- 'mobile_app': "Mobile App (iOS/Android)" (hardest, warning feedback - requires app store, native development)
` : `你是一个 Vibe Coding 顾问。

【用户项目信息】
- 想法：${schema.idea.one_liner}
- 核心功能：${schema.mvp.first_job}
- 目标用户：${schema.user.primary_user}

你是一个专业的产品顾问（Vibe Coder 风格）。
你的目标是生成 3-4 个"关键问题"，帮助用户理清思路并识别风险。

【项目分析】
1. **识别项目类型**：
   - **工具类**：效率提升，解决个人痛点。（重点问：你现在怎么解决这个问题？）
   - **内容类**：信息、媒体。（重点问：内容从哪来？能持续更新吗？）
   - **交易/平台类**：连接双边。（重点问：能找到第一批用户吗？需要线下运营吗？）
   - **AI套壳类**：基于API。（重点问：AI出错怎么办？如何差异化？）

2. **劝退预警**（如果发现以下情况，必须立即提问警告用户）：
   - **线下运营**：配送、见面、硬件
   - **强监管**：金融、医疗、支付
   - **技术复杂**：训练模型、高并发
   - **冷启动难**：需要双边网络效应

【生成规则】
1. **第一个问题**必须是"经验水平"问题（如：你之前做过类似的项目吗？）
2. **后续问题**：根据项目类型选择最关键的风险点
3. **选项**：提供 3-4 个不同的选择
4. **反馈**：每个选项都要有即时反馈
   - 如果用户选了"困难模式"（如线下、原生App），反馈类型必须是 'warning'
   - 如果用户选了"轻松模式"（如网页、工具），反馈类型应该是 'positive'

【重要】所有内容必须用中文输出！

【输出格式】
返回一个 JSON 对象，包含 "questions" 数组。
每个问题对象：
- \`id\`: string
- \`field\`: string (映射到: 'user.experience_level', 'mvp.type', 'platform.form', 'constraints.api_or_data_dependency', 'preference.priority', 'problem.scenario')
- \`question\`: string (问题文本，中文)
- \`insight\`: string (为什么问这个，中文)
- \`options\`: 数组，每个选项包含:
  - \`id\`: string
  - \`label\`: string (选项文本，中文)
  - \`value\`: string (枚举值)
  - \`feedback\`: { \`type\`: 'positive'|'warning'|'neutral', \`message\`: string (中文反馈) }
  - \`tags\`: string[]

### 枚举值参考（中国版专用）
- experience_level: 'never', 'tutorial', 'small_project', 'veteran'
- mvp.type: 'content_tool', 'functional_tool', 'ai_tool', 'transaction_tool'
- platform.form: 'web', 'miniprogram', 'browser_extension', 'mobile_app'
- priority: 'ship_fast', 'cost_first'

【平台形态选项说明】
- 'web': "网页应用，打开即用" (最简单，正面反馈)
- 'miniprogram': "小程序 / PWA" (中等难度，中性反馈)
- 'browser_extension': "浏览器插件" (中等难度，中性反馈)
- 'mobile_app': "原生 App (iOS/Android)" (最难，警告反馈 - 需要上架审核、原生开发)
`

  // Fallback questions for both languages
  const fallbackQuestions = isEnglish ? [
    {
      id: 'experience',
      field: 'user.experience_level',
      question: 'Have you done similar projects before?',
      insight: 'Understanding your experience helps me adjust the advice.',
      type: 'choice',
      options: [
        {
          id: 'never',
          label: 'First time trying',
          value: 'never',
          feedback: { type: 'neutral', message: "No worries, I'll give you the most detailed guidance." }
        },
        {
          id: 'veteran',
          label: 'Experienced',
          value: 'veteran',
          feedback: { type: 'positive', message: "Great, let's focus on the key challenges." }
        }
      ]
    }
  ] : [
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

  // Fail fast if no API key
  if (!process.env.QWEN_API_KEY) {
    console.warn('Skipping AI generation: No QWEN_API_KEY found')
    return fallbackQuestions
  }

  try {
    // 使用重试机制包装 AI 调用
    const result = await withRetry(
      async () => {
        const response = await getClient().chat.completions.create({
          model: FAST_MODEL,
          messages: [
            {
              role: 'system',
              content: isEnglish
                ? 'Output valid JSON only. All content must be in English.'
                : '只输出有效的JSON，所有内容用中文。',
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
        const parsed = JSON.parse(content)

        if (!parsed.questions || !Array.isArray(parsed.questions)) {
          throw new Error('Invalid response format: missing questions array')
        }

        return parsed
      },
      {
        maxRetries: 2,
        timeoutMs: 30000, // 30秒超时
        initialDelayMs: 1000,
      }
    )

    return result.questions || []
  } catch (error) {
    console.error('Generate questions error:', parseAIError(error))
    // Fallback if AI fails
    return fallbackQuestions
  }
}
