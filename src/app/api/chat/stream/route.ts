/**
 * Streaming Chat API Route
 * POST /api/chat/stream
 * Handles chat messages with SSE streaming response
 */

import { NextRequest } from 'next/server'
import { getConversation, updateConversationSchema } from '@/lib/db/conversations'
import { addMessage, getRecentMessages } from '@/lib/db/messages'
import { processUserInputStreaming } from '@/lib/ai'
import { createEmptySchema } from '@/lib/schema'
import type { EvaluationSchema, MessageMetadata } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, message } = body as {
      conversationId: string
      message: string
    }

    // Validate input
    if (!conversationId || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing conversationId or message' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get conversation with schema
    const conversation = await getConversation(conversationId)
    if (!conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
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
      .slice(0, -1)
      .map((m) => ({ role: m.role, content: m.content }))

    // Create SSE stream
    const encoder = new TextEncoder()
    let fullContent = ''
    let finalSchema: EvaluationSchema | null = null
    let finalMetadata: MessageMetadata | null = null

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = processUserInputStreaming({
            userMessage: message,
            schema: currentSchema,
            previousMessages,
          })

          for await (const chunk of generator) {
            if (chunk.type === 'content' && chunk.content) {
              fullContent += chunk.content
              // Send content chunk as SSE
              const data = JSON.stringify({ type: 'content', content: chunk.content })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            } else if (chunk.type === 'metadata' && chunk.metadata) {
              finalMetadata = chunk.metadata
              const data = JSON.stringify({ type: 'metadata', metadata: chunk.metadata })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            } else if (chunk.type === 'schema' && chunk.schema) {
              finalSchema = chunk.schema
              const data = JSON.stringify({
                type: 'schema',
                schema: chunk.schema,
                completionScore: chunk.completionScore,
                nextState: chunk.nextState,
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            } else if (chunk.type === 'done') {
              // Save AI message to database
              if (fullContent && finalSchema) {
                const savedMessage = await addMessage(conversationId, {
                  role: 'assistant',
                  content: fullContent.replace(/---CHOICES---[\s\S]*$/, '').trim(),
                  metadata: finalMetadata ?? undefined,
                })

                // Update conversation schema
                await updateConversationSchema(conversationId, finalSchema)

                // Send done event with messageId
                const data = JSON.stringify({ type: 'done', messageId: savedMessage.id })
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error)
          const errorData = JSON.stringify({ type: 'error', error: 'AI 服务暂时不可用' })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat stream API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
