/**
 * Question Bank Module - Vibe Checker
 *
 * 针对 vibe coder 重新设计的问题：
 * - 用日常语言，不问技术问题
 * - 只问用户能回答的问题
 * - 需要评估后才知道的信息，由 AI 推断
 */

import type { Question, SchemaFieldPath, EvaluationSchema, Choice } from './types'
import { isFieldFilled } from './schema'

/**
 * Question definitions
 *
 * 设计原则：
 * 1. MVP 必填只需 3 题即可给出评估
 * 2. 删除技术问题（时间预期、技术偏好、外部依赖、隐私级别）
 * 3. 问题语言更口语化、低压力
 */
export const QUESTION_BANK: Question[] = [
  // ===== 第一阶段：必答（3题，完成后即可评估） =====

  // Q1: 产品描述 (MVP)
  {
    id: 'q1',
    field: 'idea.one_liner',
    question: '用一句话描述，你想做的这个东西是什么？\n\n比如：「一个帮人快速生成周报的工具」「一个追踪加密货币价格的 App」\n\n（随便说，不用很精确）',
    type: 'open',
    priority: 1,
    isMVP: true,
  },

  // Q2: 目标用户 (MVP)
  {
    id: 'q2',
    field: 'user.primary_user',
    question: '这个东西主要是给谁用的？',
    type: 'choice',
    options: [
      { id: 'self', label: '主要给自己用', value: '自己' },
      { id: 'friends', label: '给身边的朋友/同事用', value: '朋友同事' },
      { id: 'specific', label: '给特定的一群人（比如设计师、学生）', value: '特定人群' },
      { id: 'public', label: '希望大家都能用', value: '大众' },
    ],
    priority: 2,
    isMVP: true,
  },

  // Q3: 产品形态 (MVP)
  {
    id: 'q3',
    field: 'platform.form',
    question: '你希望它是什么形式？',
    type: 'choice',
    options: [
      { id: 'web', label: '网页（电脑或手机都能打开）', value: 'web' },
      { id: 'mobile', label: '手机 App', value: 'ios' },
      { id: 'plugin', label: '浏览器插件', value: 'plugin' },
      { id: 'wechat', label: '微信小程序', value: 'miniprogram' },
      { id: 'skip', label: '还没想好', value: 'unknown' },
    ],
    priority: 3,
    isMVP: true,
  },

  // ===== 第二阶段：补充（可选，有助于更准确评估） =====

  // Q4: 是否自己会用 - 判断是否 scratch your own itch
  {
    id: 'q4',
    field: 'idea.background',
    question: '你自己会用这个产品吗？',
    type: 'choice',
    options: [
      { id: 'yes', label: '会，我自己就很需要', value: '自己需要' },
      { id: 'maybe', label: '可能偶尔用', value: '偶尔使用' },
      { id: 'no', label: '不太会，主要给别人用', value: '给他人用' },
      { id: 'skip', label: '跳过', value: '' },
    ],
    priority: 4,
    isMVP: false,
  },

  // Q5: 身边有人需要吗 - 初步验证需求
  {
    id: 'q5',
    field: 'problem.pain_level',
    question: '你身边有人需要这个吗？',
    type: 'choice',
    options: [
      { id: 'yes', label: '有，好几个人都提过类似需求', value: 'high' },
      { id: 'maybe', label: '可能有，但没直接问过', value: 'medium' },
      { id: 'no', label: '不确定', value: 'low' },
      { id: 'skip', label: '跳过', value: 'unknown' },
    ],
    priority: 5,
    isMVP: false,
  },

  // Q6: 核心功能
  {
    id: 'q6',
    field: 'mvp.first_job',
    question: '如果这个产品只能做一件事，你希望它做什么？\n\n（比如：「能生成一份周报」「能查到今天的汇率」）',
    type: 'open',
    priority: 6,
    isMVP: false,
  },

  // Q7: 是否想过怎么赚钱（可选）
  {
    id: 'q7',
    field: 'user.usage_context',
    question: '你有想过怎么靠它赚钱吗？（没想好也没关系）',
    type: 'choice',
    options: [
      { id: 'free', label: '先免费，以后再说', value: '暂时免费' },
      { id: 'paid', label: '付费订阅或一次性购买', value: '付费' },
      { id: 'ads', label: '靠广告', value: '广告' },
      { id: 'none', label: '不打算赚钱，自己用', value: '不考虑' },
      { id: 'skip', label: '还没想', value: '' },
    ],
    priority: 7,
    isMVP: false,
  },

  // Q8: 见过类似产品吗（可选）
  {
    id: 'q8',
    field: 'problem.scenario',
    question: '你见过类似的产品吗？（说不上来也没事）',
    type: 'open',
    priority: 8,
    isMVP: false,
  },
]

/**
 * Get next question to ask based on schema state
 * Returns the highest priority unfilled field's question
 */
export function getNextQuestion(schema: EvaluationSchema): Question | null {
  // Sort by priority and get first unfilled
  for (const question of QUESTION_BANK) {
    if (!isFieldFilled(schema, question.field)) {
      return question
    }
  }
  return null
}

/**
 * Get question by field path
 */
export function getQuestionByField(field: SchemaFieldPath): Question | undefined {
  return QUESTION_BANK.find(q => q.field === field)
}

/**
 * Get question by ID
 */
export function getQuestionById(id: string): Question | undefined {
  return QUESTION_BANK.find(q => q.id === id)
}

/**
 * Format question for display
 */
export function formatQuestionForDisplay(question: Question): {
  text: string
  choices?: Choice[]
} {
  if (question.type === 'open') {
    return {
      text: question.question,
    }
  }

  // Format choice question
  const choices: Choice[] = question.options?.map(opt => ({
    id: opt.id,
    text: opt.label,
  })) || []

  return {
    text: question.question,
    choices,
  }
}

/**
 * Parse user answer and get the value to store in schema
 *
 * 匹配优先级：
 * 1. 精确匹配 option ID
 * 2. 精确匹配 option label
 * 3. 精确匹配 option value
 * 4. 数字选择（如 "1", "2"）
 * 5. 模糊匹配（answer 包含在 label 中，且长度 >= 2）
 */
export function parseAnswerValue(question: Question, answer: string): string {
  const trimmedAnswer = answer.trim()

  if (question.type === 'open') {
    return trimmedAnswer
  }

  const options = question.options || []

  // 1. 精确匹配 ID
  const byId = options.find(opt => opt.id === trimmedAnswer)
  if (byId) return byId.value

  // 2. 精确匹配 label
  const byLabel = options.find(opt => opt.label === trimmedAnswer)
  if (byLabel) return byLabel.value

  // 3. 精确匹配 value
  const byValue = options.find(opt => opt.value === trimmedAnswer)
  if (byValue) return byValue.value

  // 4. 数字选择（用户输入 "1", "2" 等）
  const numIndex = parseInt(trimmedAnswer, 10)
  if (!isNaN(numIndex) && numIndex >= 1 && numIndex <= options.length) {
    return options[numIndex - 1].value
  }

  // 5. 模糊匹配：answer 是 label 的子串，且长度足够避免误匹配
  if (trimmedAnswer.length >= 2) {
    const byFuzzy = options.find(opt =>
      opt.label.toLowerCase().includes(trimmedAnswer.toLowerCase())
    )
    if (byFuzzy) return byFuzzy.value
  }

  // 无匹配，返回原始答案
  return trimmedAnswer
}

/**
 * Get all MVP questions
 */
export function getMVPQuestions(): Question[] {
  return QUESTION_BANK.filter(q => q.isMVP)
}

/**
 * Get remaining questions count
 */
export function getRemainingQuestionsCount(schema: EvaluationSchema): {
  mvp: number
  optional: number
  total: number
} {
  let mvp = 0
  let optional = 0

  for (const question of QUESTION_BANK) {
    if (!isFieldFilled(schema, question.field)) {
      if (question.isMVP) {
        mvp++
      } else {
        optional++
      }
    }
  }

  return { mvp, optional, total: mvp + optional }
}

/**
 * Get optional (non-MVP) questions
 */
export function getOptionalQuestions(): Question[] {
  return QUESTION_BANK.filter(q => !q.isMVP)
}

/**
 * Get questions by stage
 * Stage 1: MVP 必答题
 * Stage 2: 可选补充题
 */
export function getQuestionsByStage(stage: 1 | 2): Question[] {
  return stage === 1 ? getMVPQuestions() : getOptionalQuestions()
}

/**
 * Get previous question based on current question
 */
export function getPreviousQuestion(
  currentQuestion: Question,
  schema: EvaluationSchema
): Question | null {
  const currentIndex = QUESTION_BANK.findIndex(q => q.id === currentQuestion.id)
  if (currentIndex <= 0) return null

  // 返回上一个已填写的问题，或上一个问题
  for (let i = currentIndex - 1; i >= 0; i--) {
    const q = QUESTION_BANK[i]
    if (isFieldFilled(schema, q.field)) {
      return q
    }
  }

  return QUESTION_BANK[currentIndex - 1]
}

/**
 * Get completion progress
 * Returns percentage and counts
 */
export function getProgress(schema: EvaluationSchema): {
  mvpPercent: number
  totalPercent: number
  mvpAnswered: number
  mvpTotal: number
  optionalAnswered: number
  optionalTotal: number
} {
  const mvpQuestions = getMVPQuestions()
  const optionalQuestions = getOptionalQuestions()

  const mvpAnswered = mvpQuestions.filter(q => isFieldFilled(schema, q.field)).length
  const optionalAnswered = optionalQuestions.filter(q => isFieldFilled(schema, q.field)).length

  const mvpTotal = mvpQuestions.length
  const optionalTotal = optionalQuestions.length

  return {
    mvpPercent: mvpTotal > 0 ? Math.round((mvpAnswered / mvpTotal) * 100) : 0,
    totalPercent: QUESTION_BANK.length > 0
      ? Math.round(((mvpAnswered + optionalAnswered) / QUESTION_BANK.length) * 100)
      : 0,
    mvpAnswered,
    mvpTotal,
    optionalAnswered,
    optionalTotal,
  }
}

/**
 * Check if MVP questions are complete (ready for evaluation)
 */
export function isMVPComplete(schema: EvaluationSchema): boolean {
  return getMVPQuestions().every(q => isFieldFilled(schema, q.field))
}

/**
 * Get current stage based on completion
 * Returns 1 if still answering MVP, 2 if answering optional
 */
export function getCurrentStage(schema: EvaluationSchema): 1 | 2 {
  return isMVPComplete(schema) ? 2 : 1
}
