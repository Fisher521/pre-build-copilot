/**
 * Save Answers API
 * POST /api/conversation/[id]/answers - Save wizard question answers
 */

import { NextRequest, NextResponse } from 'next/server'
import { getConversation, updateConversationSchema } from '@/lib/db/conversations'
import type { EvaluationSchema, TimelinePreference, MVPType } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { answers } = body

    const conversation = await getConversation(id)
    if (!conversation) {
      return NextResponse.json(
        { error: '对话不存在' },
        { status: 404 }
      )
    }

    // Map answers to schema fields
    const currentSchema = conversation.schema_data
    
    // Map timeline
    const timelineVal = answers.timeline
    const timelineMap: Record<string, TimelinePreference> = {
      '7d': '7d',
      '14d': '14d',
      '30d': '30d',
      'flexible': 'flexible',
    }
    
    // Map tech_comfort to mvp type
    const techMap: Record<string, MVPType> = {
      'code_simple': 'functional_tool',
      'ai_build': 'ai_tool',
      'code_good': 'functional_tool',
      'unsure': 'unknown',
    }

    // Map budget to priority
    const priority = (answers.budget_feeling === 'free' || answers.budget_feeling === 'little') 
      ? 'cost_first' 
      : 'ship_fast'

    const updatedSchema: EvaluationSchema = {
      ...currentSchema,
      preference: {
        ...currentSchema.preference,
        timeline: timelineMap[timelineVal] || currentSchema.preference.timeline,
        priority: priority,
      },
      mvp: {
        ...currentSchema.mvp,
        type: techMap[answers.tech_comfort] || currentSchema.mvp.type,
      },
      user: {
        ...currentSchema.user,
        usage_context: answers.commercialization || currentSchema.user.usage_context,
      },
      problem: {
        ...currentSchema.problem,
        scenario: answers.market_feeling ? `市场感觉：${answers.market_feeling}` : currentSchema.problem.scenario,
      },
      _meta: {
        ...currentSchema._meta,
        updated_at: new Date().toISOString(),
      },
    }

    await updateConversationSchema(id, updatedSchema)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Save answers error:', error)
    return NextResponse.json(
      { error: '保存失败' },
      { status: 500 }
    )
  }
}
