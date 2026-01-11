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
    
    // Map time_investment to timeline preference
    const timelineMap: Record<string, TimelinePreference> = {
      '<1week': '7d',
      '1month': '30d',
      '3months': 'flexible',
      'long-term': 'flexible',
    }
    
    // Map tech_stack to mvp type
    const mvpTypeMap: Record<string, MVPType> = {
      'frontend': 'functional_tool',
      'backend': 'functional_tool',
      'mobile': 'functional_tool',
      'none': 'content_tool',
    }

    const updatedSchema: EvaluationSchema = {
      ...currentSchema,
      preference: {
        ...currentSchema.preference,
        timeline: timelineMap[answers.time_investment] || currentSchema.preference.timeline,
      },
      mvp: {
        ...currentSchema.mvp,
        type: mvpTypeMap[answers.tech_stack] || currentSchema.mvp.type,
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
