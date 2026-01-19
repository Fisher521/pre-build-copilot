/**
 * Conversation API Route
 * POST /api/conversation - Create new conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createConversation, updateConversationSchema } from '@/lib/db/conversations'
import { addMessage } from '@/lib/db/messages'
import { processUserInput } from '@/lib/ai'
import { createEmptySchema } from '@/lib/schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const initialInput = body.initialInput as string | undefined
    const language = (body.language as 'zh' | 'en') || 'zh'
    const prefilledData = body.prefilledData as {
      projectName?: string
      coreFeature?: string
      targetUser?: string
      problemSolved?: string
    } | undefined

    // Create new conversation with empty schema
    let conversation
    try {
      conversation = await createConversation()
    } catch (dbError) {
      console.error('Database error creating conversation:', dbError)
      return NextResponse.json(
        {
          error: '数据库连接失败，请检查网络后重试',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 503 }
      )
    }

    const schema = createEmptySchema()

    // If pre-filled data is provided (from example click), use it directly
    if (prefilledData) {
      const updatedSchema = {
        ...schema,
        idea: {
          ...schema.idea,
          one_liner: prefilledData.projectName || '',
        },
        mvp: {
          ...schema.mvp,
          first_job: prefilledData.coreFeature || '',
        },
        user: {
          ...schema.user,
          primary_user: prefilledData.targetUser || '',
        },
        problem: {
          ...schema.problem,
          scenario: prefilledData.problemSolved || '',
        },
        _meta: {
          ...schema._meta,
          completion_score: 40, // Pre-filled examples have good completion
        },
      }

      // Save the initial input as user message
      if (initialInput && initialInput.trim()) {
        try {
          await addMessage(conversation.id, {
            role: 'user',
            content: initialInput.trim(),
          })
        } catch (msgError) {
          console.error('Error saving user message:', msgError)
        }
      }

      // Update conversation schema
      try {
        await updateConversationSchema(conversation.id, updatedSchema)
      } catch (schemaError) {
        console.error('Error updating schema:', schemaError)
      }

      return NextResponse.json({
        conversationId: conversation.id,
        schema: updatedSchema,
      })
    }

    if (initialInput && initialInput.trim()) {
      // Save user's initial message
      try {
        await addMessage(conversation.id, {
          role: 'user',
          content: initialInput.trim(),
        })
      } catch (msgError) {
        console.error('Error saving user message:', msgError)
        // Continue anyway - the message can be reconstructed from the conversation
      }

      // Process through state machine (STATE_1: PARSE_INPUT)
      try {
        const { response, updatedSchema } = await processUserInput({
          userMessage: initialInput.trim(),
          schema,
          previousMessages: [],
          language,
        })

        // Save AI response
        try {
          await addMessage(conversation.id, {
            role: 'assistant',
            content: response.content,
            metadata: response.metadata,
          })
        } catch (saveError) {
          console.error('Error saving AI response:', saveError)
        }

        // Update conversation schema
        try {
          await updateConversationSchema(conversation.id, updatedSchema)
        } catch (schemaError) {
          console.error('Error updating schema:', schemaError)
        }

        return NextResponse.json({
          conversationId: conversation.id,
          message: response,
          schema: updatedSchema,
        })
      } catch (aiError) {
        console.error('AI processing error:', aiError)
        // Return conversation even if AI fails - user can retry in chat
        return NextResponse.json({
          conversationId: conversation.id,
          schema,
          error: 'AI 处理暂时不可用，请在对话中重试',
        })
      }
    }

    // No initial input - just create conversation
    // This shouldn't happen with the new flow, but handle it gracefully
    return NextResponse.json({
      conversationId: conversation.id,
      schema,
    })
  } catch (error) {
    console.error('Conversation API error:', error)
    return NextResponse.json(
      { 
        error: '创建对话失败，请稍后重试',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

