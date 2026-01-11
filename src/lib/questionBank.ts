/**
 * Question Bank Module - Vibe Check
 *
 * 针对 vibe coder 重新设计的问题：
 * - 问「感受 / 心理偏好」而非「承诺 / 事实」
 * - 每个选项都是可以选的，没有压力
 * - 需要评估后才知道的信息，由 AI 推断
 */

import type { Question, SchemaFieldPath, EvaluationSchema, Choice } from './types'
import { isFieldFilled } from './schema'

/**
 * Question definitions - 感受型设计
 *
 * 设计原则：
 * 1. 第一阶段只问「想法是什么」+ 「给谁用」+ 「什么形式」
 * 2. 第二阶段改为感受型问题，用户可以全跳过
 * 3. 所有选项都「可以选」，不会选错
 */
export const QUESTION_BANK: Question[] = [
  // ===== 第一阶段：描述想法（3题） =====

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

  // ===== 第二阶段：感受型问题（全部可跳过） =====

  // Q4: 时间心理偏好
  {
    id: 'q4',
    field: 'preference.timeline',
    question: '你更希望这个项目是？',
    type: 'choice',
    options: [
      { id: 'quick', label: '一两天随便试试', value: '7d' },
      { id: 'mvp', label: '一两周认真做个 MVP', value: '14d' },
      { id: 'long', label: '如果顺了，可以长期做', value: '30d' },
      { id: 'unsure', label: '现在还没想清楚', value: 'flexible' },
    ],
    priority: 4,
    isMVP: false,
  },

  // Q5: 技术舒适度
  {
    id: 'q5',
    field: 'mvp.type',
    question: '你现在更像哪种状态？',
    type: 'choice',
    options: [
      { id: 'code_simple', label: '会写代码，但不想折腾复杂架构', value: 'functional_tool' },
      { id: 'ai_build', label: '技术一般，主要靠 AI + 拼起来', value: 'ai_tool' },
      { id: 'code_good', label: '技术不错，但不想一开始就重', value: 'functional_tool' },
      { id: 'unsure', label: '不太确定', value: 'content_tool' },
    ],
    priority: 5,
    isMVP: false,
  },

  // Q6: 花钱意愿
  {
    id: 'q6',
    field: 'preference.priority',
    question: '你对「花钱」这件事的感觉更接近？',
    type: 'choice',
    options: [
      { id: 'free', label: '能不花钱最好', value: 'cost_first' },
      { id: 'little', label: '每月几十块可以接受', value: 'stable_first' },
      { id: 'invest', label: '如果有希望，几百块也行', value: 'ship_fast' },
      { id: 'later', label: '现在还不想考虑', value: 'unknown' },
    ],
    priority: 6,
    isMVP: false,
  },

  // Q7: 商业化意图
  {
    id: 'q7',
    field: 'user.usage_context',
    question: '你现在做这个项目，更像是？',
    type: 'choice',
    options: [
      { id: 'self_maybe', label: '自己用 + 顺便看看有没有人愿意付费', value: '自用为主可能商业化' },
      { id: 'business', label: '明确想做一个能赚钱的产品', value: '商业化' },
      { id: 'first', label: '先做出来再说', value: '先做再说' },
      { id: 'unsure', label: '还没想清楚', value: '还没想清楚' },
    ],
    priority: 7,
    isMVP: false,
  },

  // Q8: 市场认知（系统自己查竞品）
  {
    id: 'q8',
    field: 'problem.scenario',
    question: '你现在对市场的感觉更像是？',
    type: 'choice',
    options: [
      { id: 'exists', label: '我感觉可能已经有人做过', value: '可能有竞品' },
      { id: 'unseen', label: '我没见过类似的，但也不确定', value: '没见过但不确定' },
      { id: 'uncheck', label: '我完全没查过', value: '没查过' },
      { id: 'doesnt_matter', label: '不重要，先做再说', value: '先做再说' },
    ],
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
