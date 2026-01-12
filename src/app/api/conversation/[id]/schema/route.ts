/**
 * Update Schema API
 * PATCH /api/conversation/[id]/schema - Update conversation schema
 */

import { NextRequest, NextResponse } from 'next/server'
import { getConversation, updateConversationSchema } from '@/lib/db/conversations'
import { updateSchema } from '@/lib/schema'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const conversation = await getConversation(id)
    if (!conversation) {
      return NextResponse.json(
        { error: '对话不存在' },
        { status: 404 }
      )
    }

    // Merge updates into existing schema
    const currentSchema = conversation.schema_data
    const updatedSchema = updateSchema(currentSchema, body)
    
    // Update schema in DB
    await updateConversationSchema(id, updatedSchema)

    // Hook: If this is the "Confirm" step (contains core fields), generate specific questions
    if (body.idea || body.mvp) {
      const { generateProjectQuestions } = await import('@/lib/ai')
      const { updateConversation } = await import('@/lib/db/conversations')

      // Generate questions (this might take a few seconds)
      const generatedQuestions = await generateProjectQuestions(updatedSchema)

      // Store in conversation metadata
      await updateConversation(id, {
        metadata: {
          ...conversation.metadata,
          generatedQuestions,
        },
      })
    }

    return NextResponse.json({
      success: true,
      schema: updatedSchema,
    })
  } catch (error) {
    console.error('Update schema error:', error)
    return NextResponse.json(
      { error: '更新失败' },
      { status: 500 }
    )
  }
}
