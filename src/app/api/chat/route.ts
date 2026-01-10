/**
 * Chat API Route
 * POST /api/chat
 * Handles chat messages using state machine flow
 */

import { NextRequest, NextResponse } from 'next/server'
import { getConversation, updateConversationSchema } from '@/lib/db/conversations'
import { addMessage, getRecentMessages } from '@/lib/db/messages'
import { processUserInput } from '@/lib/ai'
import { createEmptySchema } from '@/lib/schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, message } = body as {
      conversationId: string
      message: string
    }

    // Validate input
    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'Missing conversationId or message' },
        { status: 400 }
      )
    }

    // Get conversation with schema
    const conversation = await getConversation(conversationId)
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Get current schema (or create empty one)
    const currentSchema = conversation.schema_data || createEmptySchema()

    // Save user message
    await addMessage(conversationId, {
      role: 'user',
      content: message,
    })

    // Get recent messages for context
    const recentMessages = await getRecentMessages(conversationId, 10)
    const previousMessages = recentMessages
      .filter((m) => m.role !== 'system')
      .slice(0, -1) // Exclude the message we just added
      .map((m) => ({ role: m.role, content: m.content }))

    // Process through state machine
    const { response, updatedSchema } = await processUserInput({
      userMessage: message,
      schema: currentSchema,
      previousMessages,
    })

    // Save AI response
    const savedMessage = await addMessage(conversationId, {
      role: 'assistant',
      content: response.content,
      metadata: response.metadata,
    })

    // Update conversation schema
    await updateConversationSchema(conversationId, updatedSchema)

    return NextResponse.json({
      ...response,
      messageId: savedMessage.id,
      schema: updatedSchema,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
