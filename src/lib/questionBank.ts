/**
 * Question Bank Module
 * Based on question_bank_v1.md
 *
 * 每个 Schema 字段对应的标准化追问问题
 */

import type { Question, SchemaFieldPath, EvaluationSchema, Choice } from './types'
import { isFieldFilled } from './schema'

/**
 * Question definitions
 * 按优先级排序，MVP 必填字段优先
 */
export const QUESTION_BANK: Question[] = [
  // Q1: idea.one_liner (MVP)
  {
    id: 'q1',
    field: 'idea.one_liner',
    question: '用一句话描述，你想做的这个东西是什么？\n\n比如：「一个帮人快速生成周报的工具」「一个追踪加密货币价格的 App」\n\n（随便说，不用很精确，之后可以改）',
    type: 'open',
    priority: 1,
    isMVP: true,
  },
  // Q3: user.primary_user (MVP)
  {
    id: 'q3',
    field: 'user.primary_user',
    question: '这个东西主要是给谁用的？',
    type: 'choice',
    options: [
      { id: 'self', label: '主要给自己用', value: '自己' },
      { id: 'specific', label: '给特定的一群人（比如设计师、学生、XX从业者）', value: '特定人群' },
      { id: 'public', label: '希望大众都能用', value: '大众' },
      { id: 'skip', label: '还没想好 / 先跳过', value: 'unknown' },
    ],
    priority: 2,
    isMVP: true,
  },
  // Q5: mvp.type (MVP)
  {
    id: 'q5',
    field: 'mvp.type',
    question: '这个产品主要是做什么的？',
    type: 'choice',
    options: [
      { id: 'content', label: '帮用户生成内容（文字、图片、视频等）', value: 'content_tool' },
      { id: 'functional', label: '帮用户完成某个具体功能（计算、转换、自动化等）', value: 'functional_tool' },
      { id: 'ai', label: '封装 AI 能力（调用 ChatGPT、生成图片等）', value: 'ai_tool' },
      { id: 'other', label: '其他类型 / 不确定', value: 'other' },
    ],
    priority: 3,
    isMVP: true,
  },
  // Q7: platform.form (MVP)
  {
    id: 'q7',
    field: 'platform.form',
    question: '你希望它是什么形态的产品？',
    type: 'choice',
    options: [
      { id: 'web', label: '网页 / Web App', value: 'web' },
      { id: 'mobile', label: '手机 App（iOS 或 Android）', value: 'ios' },
      { id: 'plugin', label: '浏览器插件 / 桌面工具', value: 'plugin' },
      { id: 'cli', label: '命令行工具 / 脚本', value: 'cli' },
      { id: 'skip', label: '还没想好 / 先跳过', value: 'unknown' },
    ],
    priority: 4,
    isMVP: true,
  },
  // Q8: preference.timeline (MVP)
  {
    id: 'q8',
    field: 'preference.timeline',
    question: '你希望多久能看到一个可用的版本？',
    type: 'choice',
    options: [
      { id: '7d', label: '一周内（快速验证想法）', value: '7d' },
      { id: '14d', label: '两周左右（有基本功能）', value: '14d' },
      { id: '30d', label: '一个月（相对完整）', value: '30d' },
      { id: 'flexible', label: '不着急 / 先跳过', value: 'flexible' },
    ],
    priority: 5,
    isMVP: true,
  },
  // Q2: idea.background (可选)
  {
    id: 'q2',
    field: 'idea.background',
    question: '方便说说你为什么想做这个吗？',
    type: 'choice',
    options: [
      { id: 'self_need', label: '自己遇到了这个问题', value: '自己遇到问题' },
      { id: 'others_need', label: '看到别人有这个需求', value: '他人需求' },
      { id: 'opportunity', label: '觉得这个方向有机会', value: '市场机会' },
      { id: 'skip', label: '就是想试试 / 先跳过', value: '' },
    ],
    priority: 6,
    isMVP: false,
  },
  // Q4: user.usage_context (可选)
  {
    id: 'q4',
    field: 'user.usage_context',
    question: '用户一般会在什么情况下用它？',
    type: 'choice',
    options: [
      { id: 'work', label: '工作中（提高效率、完成任务）', value: '工作场景' },
      { id: 'life', label: '生活中（娱乐、记录、管理）', value: '生活场景' },
      { id: 'specific', label: '特定场景（出差时、睡前、通勤中...）', value: '特定场景' },
      { id: 'skip', label: '不确定 / 先跳过', value: '' },
    ],
    priority: 7,
    isMVP: false,
  },
  // Q6: mvp.first_job (可选)
  {
    id: 'q6',
    field: 'mvp.first_job',
    question: '如果这个产品只能做一件事，你最希望它先完成什么？\n\n（比如：「能生成一份周报」「能查到今天的汇率」「能把语音转成文字」）',
    type: 'open',
    priority: 8,
    isMVP: false,
  },
  // Q9: preference.priority (可选)
  {
    id: 'q9',
    field: 'preference.priority',
    question: '如果要选一个最重要的，你更在意：',
    type: 'choice',
    options: [
      { id: 'fast', label: '速度 - 先做出来再说', value: 'ship_fast' },
      { id: 'stable', label: '稳定 - 宁可慢点，少出问题', value: 'stable_first' },
      { id: 'cost', label: '成本 - 尽量少花钱', value: 'cost_first' },
      { id: 'skip', label: '都重要 / 不确定', value: 'unknown' },
    ],
    priority: 9,
    isMVP: false,
  },
  // Q10: constraints.api_or_data_dependency (可选)
  {
    id: 'q10',
    field: 'constraints.api_or_data_dependency',
    question: '这个产品需要用到外部的数据或服务吗？',
    type: 'choice',
    options: [
      { id: 'none', label: '不需要，自己就能完成', value: 'none' },
      { id: 'possible', label: '可能需要（比如调用 AI、获取天气、查汇率）', value: 'possible' },
      { id: 'confirmed', label: '肯定需要，而且我知道用哪个', value: 'confirmed' },
      { id: 'skip', label: '不确定 / 先跳过', value: 'unknown' },
    ],
    priority: 10,
    isMVP: false,
  },
  // Q11: constraints.privacy_level (可选)
  {
    id: 'q11',
    field: 'constraints.privacy_level',
    question: '这个产品会处理用户的隐私数据吗？',
    type: 'choice',
    options: [
      { id: 'low', label: '不会，完全不涉及个人信息', value: 'low' },
      { id: 'medium', label: '可能会有一些（昵称、偏好设置等）', value: 'medium' },
      { id: 'high', label: '会涉及敏感信息（支付、健康、位置等）', value: 'high' },
      { id: 'skip', label: '不确定 / 先跳过', value: 'unknown' },
    ],
    priority: 11,
    isMVP: false,
  },
  // Q12: problem.scenario (可选)
  {
    id: 'q12',
    field: 'problem.scenario',
    question: '能举个具体例子吗？用户现在遇到什么问题、怎么处理的？\n\n（比如：「每周五要花 2 小时写周报，经常忘记写了什么」）',
    type: 'open',
    priority: 12,
    isMVP: false,
  },
  // Q13: problem.pain_level (可选)
  {
    id: 'q13',
    field: 'problem.pain_level',
    question: '你觉得这个问题有多痛？',
    type: 'choice',
    options: [
      { id: 'low', label: '有点烦，但忍忍也行', value: 'low' },
      { id: 'medium', label: '经常影响效率或心情', value: 'medium' },
      { id: 'high', label: '非常痛，愿意花钱解决', value: 'high' },
      { id: 'skip', label: '不确定 / 先跳过', value: 'unknown' },
    ],
    priority: 13,
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
 */
export function parseAnswerValue(question: Question, answer: string): string {
  if (question.type === 'open') {
    return answer.trim()
  }

  // Try to match by option ID or label
  const option = question.options?.find(
    opt => opt.id === answer ||
           opt.label === answer ||
           opt.value === answer ||
           opt.label.includes(answer)
  )

  if (option) {
    return option.value
  }

  // If no match, return the raw answer for open interpretation
  return answer.trim()
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
