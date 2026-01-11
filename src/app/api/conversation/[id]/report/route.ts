/**
 * Generate Report API
 * POST /api/conversation/[id]/report - Generate evaluation report
 */

import { NextRequest, NextResponse } from 'next/server'
import { getConversation } from '@/lib/db/conversations'
import OpenAI from 'openai'

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

    // Generate report using AI
    const client = getClient()
    const response = await client.chat.completions.create({
      model: process.env.QWEN_MODEL || 'qwen-plus',
      messages: [
        {
          role: 'system',
          content: `你是一个帮助 Vibe Coder（用 AI 辅助写代码的独立开发者）评估项目的专家。

目标用户特点：
- 主要靠 AI 工具（Cursor、Claude、v0.dev）生成代码
- 预算有限，追求低成本甚至零成本
- 时间有限，希望快速验证想法
- 技术能力中等，能拼接但不想搞复杂架构

请以 JSON 格式返回评估报告：
{
  "projectName": "项目简称",
  "score": 评分(0-100),
  "verdict": "一句话判断",
  "strengths": ["优势1", "优势2", "优势3"],
  "challenges": ["挑战1", "挑战2"],
  "marketAnalysis": {
    "verdict": "一句话市场判断",
    "signals": ["事实信号1", "事实信号2", "事实信号3"],
    "competitors": [
      {"name": "竞品名", "feature": "做得好的点", "gap": "没做好的点"}
    ]
  },
  "implementation": {
    "techStack": {
      "frontend": "推荐前端技术",
      "backend": "推荐后端技术",
      "database": "推荐数据库",
      "deployment": "部署方案",
      "aiService": "AI服务（如需要）"
    },
    "coreFlow": [
      "步骤1：XXX",
      "步骤2：XXX",
      "步骤3：XXX"
    ],
    "devProcess": [
      {"step": "第一步做什么", "difficulty": "简单/中等/较难", "dependency": "依赖什么"},
      {"step": "第二步做什么", "difficulty": "简单/中等/较难", "dependency": "依赖什么"}
    ],
    "recommendation": "串行还是模块化并行开发，为什么"
  },
  "costEstimate": {
    "timeCost": {
      "mvp": "MVP 开发时间（天/周）",
      "fullVersion": "完整版本时间",
      "dailyHours": "每天建议投入时间"
    },
    "moneyCost": {
      "development": "开发期间费用（通常为0）",
      "monthlyOperation": [
        {"item": "项目", "cost": "费用", "note": "备注"}
      ],
      "totalMonthly": "月运营总成本估算"
    },
    "savingTips": ["省钱建议1", "省钱建议2"]
  },
  "nextSteps": ["第一步做什么", "第二步做什么", "第三步做什么"]
}

评分标准：
- 80+: 非常值得做，技术门槛低，市场有空间
- 60-79: 值得尝试，但有挑战需克服
- 40-59: 需要慎重，可能超出 vibe coder 能力范围
- <40: 建议换个方向

请只返回 JSON，不要有其他内容。`,
        },
        {
          role: 'user',
          content: `请为以下项目生成评估报告：

【项目想法】${schema.idea.one_liner || '未说明'}
【目标用户】${schema.user.primary_user || '未说明'}
【产品形态】${schema.platform.form || '未说明'}
【时间偏好】${schema.preference.timeline || '未说明'}
【技术状态】${schema.mvp.type || '未说明'}
【预算偏好】${schema.preference.priority || '未说明'}
【商业意图】${schema.user.usage_context || '未说明'}
【市场感觉】${schema.problem.scenario || '未说明'}

请特别注意：
1. 技术实现要拆解具体步骤流程（如 AI 日报：筛选源→抓数据→评估→筛选→评分→概括）
2. 开发过程要给出具体步骤、难度、依赖
3. 成本要分时间成本和金钱成本，金钱主要是 API 和工具费用
4. 推荐技术栈要具体到产品名（Supabase、Vercel、OpenAI等）`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content || ''
    
    // Parse JSON from response
    let report
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        report = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Invalid response format')
      }
    } catch (parseError) {
      // Fallback report
      report = {
        projectName: schema.idea.one_liner || '未命名项目',
        score: 65,
        verdict: '值得尝试',
        strengths: ['有明确的目标用户', '问题定义清晰'],
        challenges: ['需要进一步验证市场需求'],
        nextSteps: ['制作 MVP', '寻找早期用户测试', '收集反馈迭代'],
      }
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

