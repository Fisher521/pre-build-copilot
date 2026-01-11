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

    // Create new conversation with empty schema
    const conversation = await createConversation()
    const schema = createEmptySchema()

    if (initialInput && initialInput.trim()) {
      // Save user's initial message
      await addMessage(conversation.id, {
        role: 'user',
        content: initialInput.trim(),
      })

      // Process through state machine (STATE_1: PARSE_INPUT)
      const { response, updatedSchema } = await processUserInput({
        userMessage: initialInput.trim(),
        schema,
        previousMessages: [],
      })

      // Save AI response
      await addMessage(conversation.id, {
        role: 'assistant',
        content: response.content,
        metadata: response.metadata,
      })

      // Update conversation schema
      await updateConversationSchema(conversation.id, updatedSchema)

      return NextResponse.json({
        conversationId: conversation.id,
        message: response,
        schema: updatedSchema,
      })
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
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
