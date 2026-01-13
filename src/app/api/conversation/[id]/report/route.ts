/**
 * Generate Report API
 * POST /api/conversation/[id]/report - Generate V2.2 evaluation report
 */

import { NextRequest, NextResponse } from 'next/server'
import { getConversation, updateConversation } from '@/lib/db/conversations'
import { searchCompetitors } from '@/lib/ai/search'
import OpenAI from 'openai'
import type { VibeReport } from '@/lib/types'
import {
  VIBE_TOOL_LIBRARY,
  CHINA_MARKET_DATA_SOURCES,
  TERM_TRANSLATIONS,
  DISSUASION_RULES,
  VALIDATION_METHODS_TEMPLATE,
  PROMPT_FRAMEWORK_GUIDE
} from '@/lib/reportConfig'
import { REPORT_JSON_SCHEMA } from '@/lib/reportPrompt'

// 根据经验等级调整语气
const TONE_GUIDES = {
  'never': "语气：极度鼓励，用最简单的词。不用术语（或用括号解释）。把用户当作聪明但不懂技术的朋友。重点推荐扣子空间/豆包MarsCode这类'魔法'工具。",
  'tutorial': "语气：鼓励但有教育意义。解释*为什么*某些工具能省时间。强调边做边学。推荐Cursor。",
  'small_project': "语气：平等交流，务实。强调速度，警惕过度工程化。推荐Cursor + 国产服务。",
  'veteran': "语气：尊重，简洁，高层次。重点是消除摩擦，用AI工具提升已有技能。推荐Cursor Pro + Claude Code。"
}

// 劝退检测函数
function checkDissuasion(projectDescription: string, mvpType: string): { should_dissuade: boolean; reasons: string[]; hard_blockers: string[]; alternatives: { title: string; description: string; why_easier: string }[] } | null {
  const lowerDesc = projectDescription.toLowerCase()
  const reasons: string[] = []
  const hard_blockers: string[] = []
  const alternatives: { title: string; description: string; why_easier: string }[] = []

  // 检查硬性障碍
  for (const rule of DISSUASION_RULES.hard_blockers) {
    if (rule.keywords.some(keyword => lowerDesc.includes(keyword))) {
      hard_blockers.push(rule.condition)
      reasons.push(rule.reason)
      if (rule.alternatives) {
        alternatives.push({
          title: '替代方案',
          description: rule.alternatives,
          why_easier: '不需要线下资源，纯技术实现'
        })
      }
    }
  }

  if (hard_blockers.length > 0) {
    return {
      should_dissuade: true,
      reasons,
      hard_blockers,
      alternatives
    }
  }

  return null
}

// Initialize Qwen client
function getClient(): OpenAI {
  const apiKey = process.env.QWEN_API_KEY
  if (!apiKey) {
    throw new Error('QWEN_API_KEY not configured')
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.QWEN_API_BASE || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const conversation = await getConversation(id)
    if (!conversation) {
      return NextResponse.json(
        { error: '对话不存在' },
        { status: 404 }
      )
    }

    const schema = conversation.schema_data
    
    // Per V2 spec: Perform search first
    // Simulate finding competitors based on user idea
    let searchContext = ''
    try {
       const searchResult = await searchCompetitors(schema.idea.one_liner)
       searchContext = JSON.stringify(searchResult)
    } catch (e) {
       console.warn('Search failed, proceeding without external info', e)
       searchContext = 'Search unavailable.'
    }

    // 检查是否需要劝退
    const dissuasionCheck = checkDissuasion(
      schema.idea.one_liner + ' ' + (schema.idea.background || ''),
      schema.mvp.type
    )

    // Determine Tone
    const expLevel = (schemaStyles => {
        // approximate mapping if exact enum match isn't perfect, or default to junior
        return schema.user.experience_level || 'tutorial'
    })() as keyof typeof TONE_GUIDES

    const toneInstruction = TONE_GUIDES[expLevel] || TONE_GUIDES['small_project']

    // 如果需要劝退，返回劝退报告
    if (dissuasionCheck && dissuasionCheck.should_dissuade) {
      const dissuasionReport: Partial<VibeReport> = {
        score: {
          feasibility: 30,
          breakdown: { tech: 40, market: 30, onboarding: 20, user_match: 30 }
        },
        one_liner_conclusion: '这个项目有较大的硬性障碍，建议考虑替代方案',
        dissuasion: dissuasionCheck,
        why_worth_it: [],
        risks: dissuasionCheck.reasons,
        market_analysis: {
          competitors: [],
          opportunity: '由于硬性障碍，建议暂不进入该市场'
        },
        product_approaches: {
          approaches: [],
          recommended_id: '',
          recommendation_reason: ''
        },
        tech_options: {
          option_a: { id: 'a', name: '', tools: [], capability: '', difficulty: 1, dev_time: '', cost: '', fit_for: '' },
          option_b: { id: 'b', name: '', tools: [], capability: '', difficulty: 1, dev_time: '', cost: '', fit_for: '' },
          advice: ''
        },
        development_path: {
          recommended_tools: [],
          service_connections: [],
          recommended_stack: ''
        },
        fastest_path: [],
        cost_estimate: { time_breakdown: '', money_breakdown: '' },
        pitfalls: [],
        validation_methods: [],
        next_steps: { today: [], this_week: [], later: [] },
        learning_takeaways: [],
        term_translations: TERM_TRANSLATIONS,
        exit_options: {
          message: '看完觉得有点复杂？没关系，你有几个选择',
          alternatives: [
            '收藏这份报告，以后有空再做',
            '换一个更简单的想法试试',
            '找一个会写代码的朋友一起做',
            '直接把这份报告发给开发者，让他帮你做'
          ]
        }
      }

      await updateConversation(id, {
        metadata: {
            ...conversation.metadata,
            v2_report: dissuasionReport
        }
      })

      return NextResponse.json({ report: dissuasionReport })
    }

    // Generate report using Qwen
    const client = getClient()
    const prompt = `你是一个 Vibe Coding 顾问（中国市场版）。为用户的项目生成一份结构化的项目评估报告（V2.2）。

【用户项目信息】
- 想法：${schema.idea.one_liner}
- 目标用户：${schema.user.primary_user}
- 核心功能：${schema.mvp.first_job || '未指定'}
- MVP类型：${schema.mvp.type}
- 经验水平：${schema.user.experience_level}
- 平台形态：${schema.platform.form}
- 用户问卷回答：${JSON.stringify(conversation.metadata?.answers || {})}

${VIBE_TOOL_LIBRARY}

【中国市场数据源】
用户可以去这些地方验证数据：
- 百度指数：${CHINA_MARKET_DATA_SOURCES.search_trends[0].url}
- 小红书搜索：${CHINA_MARKET_DATA_SOURCES.user_feedback[0].search_template}[关键词]
- 应用宝：${CHINA_MARKET_DATA_SOURCES.app_stores[1].search_url}[关键词]

${toneInstruction}

【市场背景（搜索结果）】
${searchContext}

【要求】
1. **语言**：所有内容必须用中文输出
2. **语气**：参考上面的语气指导，务实、注重速度
3. **产品方案**：必须提供2-3个不同的产品实现思路（不是技术方案，是产品逻辑流程）
4. **技术选型**：必须从工具库中选择，**优先推荐国产工具**，确保国内可访问
5. **数据来源**：所有数据必须标注来源，如果是推断的要说明"建议用户自行验证"
6. **链接真实性**：只使用真实存在的链接，竞品链接优先使用App Store/应用宝官方链接

【JSON输出格式】（严格遵循，这是一个完整的示例）
${REPORT_JSON_SCHEMA}

【重要说明】
1. **所有链接必须真实**：竞品链接优先使用 App Store / 应用宝官方链接
2. **数据必须可验证**：如果无法确认数据，标记 verified: false 并添加 note
3. **工具推荐国产优先**：优先推荐扣子空间、Trae、MemFire、DeepSeek、Zeabur等国产工具
4. **术语必须解释**：每次出现专业术语，都在 tools_glossary 或 term_translations 中提供人话解释
5. **快速验证方法**：必须提供至少2个validation_methods
6. **提示词教学**：必须提供 prompt_framework，教框架而非给固定模板
`

    const response = await client.chat.completions.create({
      model: process.env.QWEN_MODEL || 'qwen-plus',
      messages: [
        {
          role: 'system',
          content: '你是一个务实、经验丰富的独立开发顾问。只输出有效的JSON，所有内容用中文。',
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
    let report: VibeReport

    try {
      report = JSON.parse(content)
      
      await updateConversation(id, {
        metadata: {
            ...conversation.metadata,
            v2_report: report
        }
      })

    } catch (parseError) {
      console.error('JSON parse error', parseError)
      throw new Error('Failed to parse AI report')
    }

    return NextResponse.json({
      report,
    })
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json(
      { error: '生成报告失败' },
      { status: 500 }
    )
  }
}

