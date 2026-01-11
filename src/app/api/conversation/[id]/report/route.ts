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
          content: `你是一个资深的项目可行性评估专家。根据用户提供的项目信息，生成一份全面的评估报告。

请以 JSON 格式返回，包含以下字段：
{
  "projectName": "项目名称",
  "score": 评分(0-100的整数),
  "verdict": "一句话判断，如'非常值得做'或'需要重新思考'",
  "strengths": ["优势1", "优势2", "优势3"],
  "challenges": ["挑战1", "挑战2"],
  "marketAnalysis": {
    "targetSize": "目标市场规模描述",
    "competition": "竞争情况分析",
    "opportunity": "市场机会点"
  },
  "costEstimate": {
    "development": "开发成本估算（时间和费用）",
    "operation": "运营成本估算",
    "tips": "省钱建议"
  },
  "techAnalysis": {
    "difficulty": "技术难度（简单/中等/较难）",
    "stack": "推荐技术栈",
    "mvpTime": "MVP开发周期估算"
  },
  "nextSteps": ["建议1", "建议2", "建议3"]
}

评分标准：
- 80+: 非常值得做
- 60-79: 值得尝试，但有挑战
- 40-59: 需要慎重考虑
- <40: 建议重新思考

请只返回 JSON，不要有其他内容。`,
        },
        {
          role: 'user',
          content: `请评估以下项目：

项目想法：${schema.idea.one_liner || '未说明'}
背景信息：${schema.idea.background || '未说明'}
目标用户：${schema.user.primary_user || '未说明'}
使用场景：${schema.user.usage_context || '未说明'}
解决问题：${schema.problem.scenario || '未说明'}
痛点程度：${schema.problem.pain_level || '未说明'}
MVP 核心功能：${schema.mvp.first_job || '未说明'}
产品形态：${schema.platform.form || '未说明'}
时间偏好：${schema.preference.timeline || '未说明'}
开发优先级：${schema.preference.priority || '未说明'}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
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

