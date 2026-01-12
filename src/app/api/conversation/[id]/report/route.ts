/**
 * Generate Report API
 * POST /api/conversation/[id]/report - Generate V2.0 evaluation report
 */

import { NextRequest, NextResponse } from 'next/server'
import { getConversation, updateConversation } from '@/lib/db/conversations'
import { searchCompetitors } from '@/lib/ai/search'
import OpenAI from 'openai'
import type { VibeReport } from '@/lib/types'

// Vibe Coding 工具库 - V2.1
const VIBE_TOOL_LIBRARY = `
推荐工具库（优先使用这些）：
1. **代码生成器（魔法层）**：
   - **v0.dev**：最适合前端UI、React组件、后台面板（免费额度够用）
   - **Lovable.dev / Bolt.new**：适合全栈应用/原型，适合技术基础较弱的用户
   - **扣子空间**：国产替代，无需科学上网

2. **AI编辑器**：
   - **Cursor**：行业标准，强烈推荐
   - **Windsurf / Trae**：备选方案

3. **后端/数据库**：
   - **Supabase**：默认选择，Auth + 数据库 + 实时功能
   - **MemFire Cloud**：Supabase国产版，国内访问友好
   - **Convex**：实时数据场景

4. **部署/支付**：
   - **Vercel**：默认部署方案
   - **Zeabur**：国产替代
   - **Stripe / LemonSqueezy**：海外支付
`

// 根据经验等级调整语气
const TONE_GUIDES = {
  'never': "语气：极度鼓励，用最简单的词。不用术语。把用户当作聪明但不懂技术的朋友。重点推荐v0/Lovable这类'魔法'工具。",
  'tutorial': "语气：鼓励但有教育意义。解释*为什么*某些工具能省时间。强调边做边学。",
  'small_project': "语气：平等交流，务实。强调速度，警惕过度工程化。",
  'veteran': "语气：尊重，简洁，高层次。重点是消除摩擦，用AI工具提升已有技能。"
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

    // Determine Tone
    const expLevel = (schemaStyles => {
        // approximate mapping if exact enum match isn't perfect, or default to junior
        return schema.user.experience_level || 'junior'
    })() as keyof typeof TONE_GUIDES
    
    const toneInstruction = TONE_GUIDES[expLevel] || TONE_GUIDES['small_project']

    // Generate report using Qwen
    const client = getClient()
    const prompt = `你是一个 Vibe Coding 顾问。为用户的项目生成一份结构化的项目评估报告（V2.1）。

【用户项目信息】
- 想法：${schema.idea.one_liner}
- 目标用户：${schema.user.primary_user}
- 核心功能：${schema.mvp.first_job || '未指定'}
- MVP类型：${schema.mvp.type}
- 经验水平：${schema.user.experience_level}
- 用户问卷回答：${JSON.stringify(conversation.metadata?.answers || {})}

${VIBE_TOOL_LIBRARY}

${toneInstruction}

【市场背景】
${searchContext}

【要求】
1. **语言**：所有内容必须用中文输出
2. **语气**：参考上面的语气指导，务实、注重速度
3. **产品方案**：必须提供2-3个不同的产品实现思路（不是技术方案，是产品逻辑流程）
4. **技术选型**：必须从工具库中选择，不要推荐过于复杂的方案

【JSON输出格式】（严格遵循）
{
  "one_liner_conclusion": "一句话总结（如：很适合新手入门，但要注意API成本）",
  "score": {
    "feasibility": 85,
    "breakdown": { "tech": 90, "market": 70, "onboarding": 80, "user_match": 85 }
  },
  "why_worth_it": ["理由1", "理由2", "理由3"],
  "risks": ["风险1", "风险2"],
  "market_analysis": {
    "opportunity": "市场机会分析...",
    "search_trends": "搜索趋势分析...",
    "competitors": [
      { "name": "竞品A", "url": "...", "pros": "优点", "cons": "缺点" }
    ]
  },
  "product_approaches": {
    "approaches": [
      {
        "id": "approach_a",
        "name": "方案A：xxx模式",
        "description": "一句话描述这个方案的核心思路",
        "workflow": [
          { "step": 1, "action": "数据获取", "detail": "通过RSS/API抓取内容" },
          { "step": 2, "action": "AI处理", "detail": "用LLM进行筛选和摘要" },
          { "step": 3, "action": "内容分发", "detail": "推送到用户订阅渠道" }
        ],
        "pros": ["优势1", "优势2"],
        "cons": ["劣势1", "劣势2"],
        "best_for": "适合什么场景",
        "complexity": "low"
      },
      {
        "id": "approach_b",
        "name": "方案B：xxx模式",
        "description": "一句话描述",
        "workflow": [...],
        "pros": [...],
        "cons": [...],
        "best_for": "...",
        "complexity": "medium"
      }
    ],
    "recommended_id": "approach_a",
    "recommendation_reason": "推荐理由..."
  },
  "tech_options": {
    "option_a": {
      "name": "极简方案（最快）",
      "tools": ["v0", "Next.js", "Vercel"],
      "fit_for": "快速验证想法",
      "capability": "基础功能",
      "dev_time": "2-3天",
      "cost": "免费"
    },
    "option_b": {
      "name": "进阶方案（可扩展）",
      "tools": ["Cursor", "Supabase", "Vercel"],
      "fit_for": "长期迭代",
      "capability": "完整功能",
      "dev_time": "1-2周",
      "cost": "约$20/月"
    },
    "advice": "根据用户情况给出选择建议"
  },
  "fastest_path": [
    {
      "title": "第一步：生成界面",
      "description": "详细说明...",
      "copy_text": "可复制的提示词...",
      "action_label": "打开 v0.dev",
      "action_url": "https://v0.dev"
    }
  ],
  "cost_estimate": {
    "time_breakdown": "最简版：2-3天；标准版：1周",
    "money_breakdown": "开发期免费；上线后约0-100元/月"
  },
  "pitfalls": ["容易踩的坑1", "容易踩的坑2"],
  "learning_takeaways": ["会学到的技能1", "会学到的概念2"],
  "next_steps": {
    "today": ["今天可以做的事1", "今天可以做的事2"],
    "this_week": ["本周可以做的事"],
    "later": ["有人用了再考虑的事"]
  }
}
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

