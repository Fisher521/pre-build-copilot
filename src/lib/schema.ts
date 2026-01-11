/**
 * Schema Management Module
 * Based on schema_framework_v1.md
 */

import type {
  EvaluationSchema,
  SchemaFieldPath,
  WizardState,
  MVP_REQUIRED_FIELDS,
} from './types'

/**
 * Create a new empty schema
 */
export function createEmptySchema(): EvaluationSchema {
  const now = new Date().toISOString()
  return {
    idea: {
      one_liner: '',
      background: '',
    },
    problem: {
      scenario: '',
      pain_level: 'unknown',
    },
    user: {
      primary_user: '',
      usage_context: '',
    },
    mvp: {
      first_job: '',
      type: 'unknown',
    },
    platform: {
      form: 'unknown',
    },
    constraints: {
      api_or_data_dependency: 'unknown',
      privacy_level: 'unknown',
    },
    preference: {
      priority: 'unknown',
      timeline: 'unknown',
    },
    _meta: {
      current_state: 'PARSE_INPUT',
      completion_score: 0,
      last_updated_field: '',
      created_at: now,
      updated_at: now,
    },
  }
}

/**
 * Get field value from schema by path
 */
export function getFieldValue(schema: EvaluationSchema, path: SchemaFieldPath): string {
  const parts = path.split('.') as [keyof EvaluationSchema, string]
  const section = schema[parts[0]] as Record<string, string>
  return section[parts[1]] || ''
}

/**
 * Set field value in schema by path
 */
export function setFieldValue(
  schema: EvaluationSchema,
  path: SchemaFieldPath,
  value: string
): EvaluationSchema {
  const parts = path.split('.') as [keyof EvaluationSchema, string]
  const sectionKey = parts[0]
  const fieldKey = parts[1]

  return {
    ...schema,
    [sectionKey]: {
      ...(schema[sectionKey] as Record<string, unknown>),
      [fieldKey]: value,
    },
    _meta: {
      ...schema._meta,
      last_updated_field: path,
      updated_at: new Date().toISOString(),
    },
  }
}

/**
 * Check if a field is filled (non-empty and not 'unknown' for enums)
 */
export function isFieldFilled(schema: EvaluationSchema, path: SchemaFieldPath): boolean {
  const value = getFieldValue(schema, path)

  // For string fields, check if non-empty
  if (path === 'idea.one_liner' || path === 'idea.background' ||
      path === 'problem.scenario' || path === 'user.primary_user' ||
      path === 'user.usage_context' || path === 'mvp.first_job') {
    return value.trim().length > 0
  }

  // For enum fields, check if not 'unknown'
  return value !== '' && value !== 'unknown'
}

/**
 * MVP required fields - 评估只需要 3 个核心信息
 */
const MVP_FIELDS: SchemaFieldPath[] = [
  'idea.one_liner',      // 核心想法
  'user.primary_user',   // 目标用户
  'platform.form',       // 产品形态
]

/**
 * All schema fields
 */
const ALL_FIELDS: SchemaFieldPath[] = [
  'idea.one_liner',
  'idea.background',
  'problem.scenario',
  'problem.pain_level',
  'user.primary_user',
  'user.usage_context',
  'mvp.first_job',
  'mvp.type',
  'platform.form',
  'constraints.api_or_data_dependency',
  'constraints.privacy_level',
  'preference.priority',
  'preference.timeline',
]

/**
 * Calculate completion score
 * 核心字段 = 3 个，每个 30 分（满分 90）
 * 加分项 = 非核心字段完成数 × 2（最多到 100）
 *
 * 设计目的：快速进入评估阶段，减少追问
 */
export function calculateCompletionScore(schema: EvaluationSchema): number {
  // Count MVP fields completed (3 fields × 30 = 90 max)
  const mvpCompleted = MVP_FIELDS.filter(field => isFieldFilled(schema, field)).length
  const baseScore = mvpCompleted * 30

  // Count non-MVP fields completed (bonus, max 10)
  const nonMvpFields = ALL_FIELDS.filter(f => !MVP_FIELDS.includes(f))
  const nonMvpCompleted = nonMvpFields.filter(field => isFieldFilled(schema, field)).length
  const bonusScore = nonMvpCompleted * 2

  return Math.min(100, baseScore + bonusScore)
}

/**
 * Get MVP completion status
 */
export function getMVPStatus(schema: EvaluationSchema): {
  completed: number
  total: number
  missingFields: SchemaFieldPath[]
} {
  const missingFields = MVP_FIELDS.filter(field => !isFieldFilled(schema, field))
  return {
    completed: MVP_FIELDS.length - missingFields.length,
    total: MVP_FIELDS.length,
    missingFields,
  }
}

/**
 * Get all unfilled fields sorted by priority
 */
export function getUnfilledFields(schema: EvaluationSchema): SchemaFieldPath[] {
  const unfilledMvp = MVP_FIELDS.filter(field => !isFieldFilled(schema, field))
  const unfilledNonMvp = ALL_FIELDS
    .filter(f => !MVP_FIELDS.includes(f))
    .filter(field => !isFieldFilled(schema, field))

  return [...unfilledMvp, ...unfilledNonMvp]
}

/**
 * Determine next state based on completion score
 *
 * 快速进入评估：
 * - 1 个核心字段 (30%) → 初步评估
 * - 2 个核心字段 (60%) → 完整评估
 */
export function determineNextState(score: number): WizardState {
  if (score < 30) {
    return 'ASK_QUESTION'
  } else if (score < 60) {
    return 'PRELIMINARY_EVAL'
  } else {
    return 'FULL_EVAL'
  }
}

/**
 * Update schema with new values and recalculate score
 */
export function updateSchema(
  schema: EvaluationSchema,
  updates: Partial<{
    idea: Partial<EvaluationSchema['idea']>
    problem: Partial<EvaluationSchema['problem']>
    user: Partial<EvaluationSchema['user']>
    mvp: Partial<EvaluationSchema['mvp']>
    platform: Partial<EvaluationSchema['platform']>
    constraints: Partial<EvaluationSchema['constraints']>
    preference: Partial<EvaluationSchema['preference']>
  }>
): EvaluationSchema {
  const updatedSchema: EvaluationSchema = {
    idea: { ...schema.idea, ...updates.idea },
    problem: { ...schema.problem, ...updates.problem },
    user: { ...schema.user, ...updates.user },
    mvp: { ...schema.mvp, ...updates.mvp },
    platform: { ...schema.platform, ...updates.platform },
    constraints: { ...schema.constraints, ...updates.constraints },
    preference: { ...schema.preference, ...updates.preference },
    _meta: {
      ...schema._meta,
      updated_at: new Date().toISOString(),
    },
  }

  // Recalculate completion score
  updatedSchema._meta.completion_score = calculateCompletionScore(updatedSchema)

  // Determine next state
  updatedSchema._meta.current_state = determineNextState(updatedSchema._meta.completion_score)

  return updatedSchema
}

/**
 * Generate progress bar string
 */
export function generateProgressBar(score: number): string {
  const filled = Math.floor(score / 20)
  const empty = 5 - filled
  return '[' + '■'.repeat(filled) + '□'.repeat(empty) + ']'
}

/**
 * Format schema as readable summary
 */
export function formatSchemaSummary(schema: EvaluationSchema): string {
  const fields: string[] = []

  if (schema.idea.one_liner) {
    fields.push(`| 产品描述 | ${schema.idea.one_liner} |`)
  }
  if (schema.user.primary_user) {
    fields.push(`| 目标用户 | ${schema.user.primary_user} |`)
  }
  if (schema.mvp.type !== 'unknown') {
    const typeLabels: Record<string, string> = {
      content_tool: '内容生成工具',
      functional_tool: '功能工具',
      ai_tool: 'AI 工具',
      other: '其他',
    }
    fields.push(`| 产品类型 | ${typeLabels[schema.mvp.type] || schema.mvp.type} |`)
  }
  if (schema.platform.form !== 'unknown') {
    const platformLabels: Record<string, string> = {
      web: '网页 / Web App',
      ios: 'iOS App',
      android: 'Android App',
      plugin: '浏览器插件 / 桌面工具',
      cli: '命令行工具',
    }
    fields.push(`| 产品形态 | ${platformLabels[schema.platform.form] || schema.platform.form} |`)
  }
  if (schema.preference.timeline !== 'unknown') {
    const timelineLabels: Record<string, string> = {
      '7d': '一周内',
      '14d': '两周左右',
      '30d': '一个月',
      flexible: '不着急',
    }
    fields.push(`| 时间预期 | ${timelineLabels[schema.preference.timeline] || schema.preference.timeline} |`)
  }
  if (schema.preference.priority !== 'unknown') {
    const priorityLabels: Record<string, string> = {
      ship_fast: '速度优先',
      stable_first: '稳定优先',
      cost_first: '成本优先',
    }
    fields.push(`| 优先级 | ${priorityLabels[schema.preference.priority] || schema.preference.priority} |`)
  }

  if (fields.length === 0) {
    return '暂无已确认的信息'
  }

  return `| 字段 | 内容 |\n|------|------|\n${fields.join('\n')}`
}
