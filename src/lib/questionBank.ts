/**
 * Question Bank Module - Vibe Check
 *
 * 针对 vibe coder 重新设计的问题：
 * - 问「感受 / 心理偏好」而非「承诺 / 事实」
 * - 每个选项都是可以选的，没有压力
 * - 需要评估后才知道的信息，由 AI 推断
 *
 * Internationalized version with zh/en support
 */

import type { Question, SchemaFieldPath, EvaluationSchema, Choice } from './types'
import type { Language } from './i18n'
import { isFieldFilled } from './schema'

interface I18nText {
  zh: string
  en: string
}

interface I18nOption {
  id: string
  label: I18nText
  value: string
}

interface I18nQuestion {
  id: string
  field: SchemaFieldPath
  question: I18nText
  type: 'choice' | 'open'
  options?: I18nOption[]
  priority: number
  isMVP: boolean
}

/**
 * Question definitions - 感受型设计 (Internationalized)
 */
const I18N_QUESTION_BANK: I18nQuestion[] = [
  // ===== 第一阶段：描述想法（3题） =====

  // Q1: 产品描述 (MVP)
  {
    id: 'q1',
    field: 'idea.one_liner',
    question: {
      zh: '用一句话描述，你想做的这个东西是什么？\n\n比如：「一个帮人快速生成周报的工具」「一个追踪加密货币价格的 App」\n\n（随便说，不用很精确）',
      en: 'Describe in one sentence what you want to build.\n\nFor example: "A tool that helps generate weekly reports" or "An app that tracks crypto prices"\n\n(Just share roughly, doesn\'t need to be precise)',
    },
    type: 'open',
    priority: 1,
    isMVP: true,
  },

  // Q2: 目标用户 (MVP)
  {
    id: 'q2',
    field: 'user.primary_user',
    question: {
      zh: '这个东西主要是给谁用的？',
      en: 'Who is this mainly for?',
    },
    type: 'choice',
    options: [
      { id: 'self', label: { zh: '主要给自己用', en: 'Mainly for myself' }, value: '自己' },
      { id: 'friends', label: { zh: '给身边的朋友/同事用', en: 'For friends/colleagues' }, value: '朋友同事' },
      { id: 'specific', label: { zh: '给特定的一群人（比如设计师、学生）', en: 'For a specific group (e.g., designers, students)' }, value: '特定人群' },
      { id: 'public', label: { zh: '希望大家都能用', en: 'For everyone' }, value: '大众' },
    ],
    priority: 2,
    isMVP: true,
  },

  // Q3: 产品形态 (MVP)
  {
    id: 'q3',
    field: 'platform.form',
    question: {
      zh: '你希望它是什么形式？',
      en: 'What form do you want it to take?',
    },
    type: 'choice',
    options: [
      { id: 'web', label: { zh: '网页（电脑或手机都能打开）', en: 'Web app, open and use' }, value: 'web' },
      { id: 'pwa', label: { zh: '微信小程序', en: 'PWA (installable web app)' }, value: 'pwa' },
      { id: 'plugin', label: { zh: '浏览器插件', en: 'Browser extension' }, value: 'plugin' },
      { id: 'mobile', label: { zh: '手机 App', en: 'Mobile App' }, value: 'mobile_app' },
    ],
    priority: 3,
    isMVP: true,
  },

  // ===== 第二阶段：感受型问题（全部可跳过） =====

  // Q4: 时间心理偏好
  {
    id: 'q4',
    field: 'preference.timeline',
    question: {
      zh: '你更希望这个项目是？',
      en: 'What\'s your timeline preference?',
    },
    type: 'choice',
    options: [
      { id: 'quick', label: { zh: '一两天随便试试', en: '1-2 days quick experiment' }, value: '7d' },
      { id: 'mvp', label: { zh: '一两周认真做个 MVP', en: '1-2 weeks serious MVP' }, value: '14d' },
      { id: 'long', label: { zh: '如果顺了，可以长期做', en: 'Long-term if it works out' }, value: '30d' },
      { id: 'unsure', label: { zh: '现在还没想清楚', en: 'Haven\'t decided yet' }, value: 'flexible' },
    ],
    priority: 4,
    isMVP: false,
  },

  // Q5: 技术舒适度
  {
    id: 'q5',
    field: 'mvp.type',
    question: {
      zh: '你现在更像哪种状态？',
      en: 'Which describes you best?',
    },
    type: 'choice',
    options: [
      { id: 'code_simple', label: { zh: '会写代码，但不想折腾复杂架构', en: 'Can code, but want to keep it simple' }, value: 'functional_tool' },
      { id: 'ai_build', label: { zh: '技术一般，主要靠 AI + 拼起来', en: 'Moderate skills, rely on AI tools' }, value: 'ai_tool' },
      { id: 'code_good', label: { zh: '技术不错，但不想一开始就重', en: 'Good at coding, but want to start light' }, value: 'functional_tool' },
      { id: 'unsure', label: { zh: '不太确定', en: 'Not sure' }, value: 'content_tool' },
    ],
    priority: 5,
    isMVP: false,
  },

  // Q6: 花钱意愿
  {
    id: 'q6',
    field: 'preference.priority',
    question: {
      zh: '你对「花钱」这件事的感觉更接近？',
      en: 'How do you feel about spending money?',
    },
    type: 'choice',
    options: [
      { id: 'free', label: { zh: '能不花钱最好', en: 'Prefer free if possible' }, value: 'cost_first' },
      { id: 'little', label: { zh: '每月几十块可以接受', en: 'A few dollars/month is fine' }, value: 'stable_first' },
      { id: 'invest', label: { zh: '如果有希望，几百块也行', en: 'Willing to invest if promising' }, value: 'ship_fast' },
      { id: 'later', label: { zh: '现在还不想考虑', en: 'Don\'t want to think about it yet' }, value: 'unknown' },
    ],
    priority: 6,
    isMVP: false,
  },

  // Q7: 商业化意图
  {
    id: 'q7',
    field: 'user.usage_context',
    question: {
      zh: '你现在做这个项目，更像是？',
      en: 'What\'s your goal with this project?',
    },
    type: 'choice',
    options: [
      { id: 'self_maybe', label: { zh: '自己用 + 顺便看看有没有人愿意付费', en: 'Personal use + maybe monetize' }, value: '自用为主可能商业化' },
      { id: 'business', label: { zh: '明确想做一个能赚钱的产品', en: 'Building a money-making product' }, value: '商业化' },
      { id: 'first', label: { zh: '先做出来再说', en: 'Build first, figure out later' }, value: '先做再说' },
      { id: 'unsure', label: { zh: '还没想清楚', en: 'Haven\'t figured it out' }, value: '还没想清楚' },
    ],
    priority: 7,
    isMVP: false,
  },

  // Q8: 市场认知（系统自己查竞品）
  {
    id: 'q8',
    field: 'problem.scenario',
    question: {
      zh: '你现在对市场的感觉更像是？',
      en: 'How do you feel about the market?',
    },
    type: 'choice',
    options: [
      { id: 'exists', label: { zh: '我感觉可能已经有人做过', en: 'I think others have done this' }, value: '可能有竞品' },
      { id: 'unseen', label: { zh: '我没见过类似的，但也不确定', en: 'Haven\'t seen similar, but not sure' }, value: '没见过但不确定' },
      { id: 'uncheck', label: { zh: '我完全没查过', en: 'Haven\'t checked at all' }, value: '没查过' },
      { id: 'doesnt_matter', label: { zh: '不重要，先做再说', en: 'Doesn\'t matter, just build' }, value: '先做再说' },
    ],
    priority: 8,
    isMVP: false,
  },
]

/**
 * Get localized question bank
 */
export function getQuestionBank(lang: Language = 'zh'): Question[] {
  return I18N_QUESTION_BANK.map(q => ({
    id: q.id,
    field: q.field,
    question: q.question[lang],
    type: q.type,
    options: q.options?.map(opt => ({
      id: opt.id,
      label: opt.label[lang],
      value: opt.value,
    })),
    priority: q.priority,
    isMVP: q.isMVP,
  }))
}

/**
 * Legacy export for backward compatibility
 */
export const QUESTION_BANK = getQuestionBank('zh')

/**
 * Get next question to ask based on schema state
 * Returns the highest priority unfilled field's question
 */
export function getNextQuestion(schema: EvaluationSchema, lang: Language = 'zh'): Question | null {
  const questions = getQuestionBank(lang)
  for (const question of questions) {
    if (!isFieldFilled(schema, question.field)) {
      return question
    }
  }
  return null
}

/**
 * Get question by field path
 */
export function getQuestionByField(field: SchemaFieldPath, lang: Language = 'zh'): Question | undefined {
  const questions = getQuestionBank(lang)
  return questions.find(q => q.field === field)
}

/**
 * Get question by ID
 */
export function getQuestionById(id: string, lang: Language = 'zh'): Question | undefined {
  const questions = getQuestionBank(lang)
  return questions.find(q => q.id === id)
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
export function getMVPQuestions(lang: Language = 'zh'): Question[] {
  return getQuestionBank(lang).filter(q => q.isMVP)
}

/**
 * Get remaining questions count
 */
export function getRemainingQuestionsCount(schema: EvaluationSchema, lang: Language = 'zh'): {
  mvp: number
  optional: number
  total: number
} {
  const questions = getQuestionBank(lang)
  let mvp = 0
  let optional = 0

  for (const question of questions) {
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
export function getOptionalQuestions(lang: Language = 'zh'): Question[] {
  return getQuestionBank(lang).filter(q => !q.isMVP)
}

/**
 * Get questions by stage
 * Stage 1: MVP 必答题
 * Stage 2: 可选补充题
 */
export function getQuestionsByStage(stage: 1 | 2, lang: Language = 'zh'): Question[] {
  return stage === 1 ? getMVPQuestions(lang) : getOptionalQuestions(lang)
}

/**
 * Get previous question based on current question
 */
export function getPreviousQuestion(
  currentQuestion: Question,
  schema: EvaluationSchema,
  lang: Language = 'zh'
): Question | null {
  const questions = getQuestionBank(lang)
  const currentIndex = questions.findIndex(q => q.id === currentQuestion.id)
  if (currentIndex <= 0) return null

  // 返回上一个已填写的问题，或上一个问题
  for (let i = currentIndex - 1; i >= 0; i--) {
    const q = questions[i]
    if (isFieldFilled(schema, q.field)) {
      return q
    }
  }

  return questions[currentIndex - 1]
}

/**
 * Get completion progress
 * Returns percentage and counts
 */
export function getProgress(schema: EvaluationSchema, lang: Language = 'zh'): {
  mvpPercent: number
  totalPercent: number
  mvpAnswered: number
  mvpTotal: number
  optionalAnswered: number
  optionalTotal: number
} {
  const mvpQuestions = getMVPQuestions(lang)
  const optionalQuestions = getOptionalQuestions(lang)

  const mvpAnswered = mvpQuestions.filter(q => isFieldFilled(schema, q.field)).length
  const optionalAnswered = optionalQuestions.filter(q => isFieldFilled(schema, q.field)).length

  const mvpTotal = mvpQuestions.length
  const optionalTotal = optionalQuestions.length
  const totalQuestions = getQuestionBank(lang).length

  return {
    mvpPercent: mvpTotal > 0 ? Math.round((mvpAnswered / mvpTotal) * 100) : 0,
    totalPercent: totalQuestions > 0
      ? Math.round(((mvpAnswered + optionalAnswered) / totalQuestions) * 100)
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
export function isMVPComplete(schema: EvaluationSchema, lang: Language = 'zh'): boolean {
  return getMVPQuestions(lang).every(q => isFieldFilled(schema, q.field))
}

/**
 * Get current stage based on completion
 * Returns 1 if still answering MVP, 2 if answering optional
 */
export function getCurrentStage(schema: EvaluationSchema, lang: Language = 'zh'): 1 | 2 {
  return isMVPComplete(schema, lang) ? 2 : 1
}
