/**
 * Brief Generation API Route
 * POST /api/brief/generate - Generate Pre-build Brief from conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getConversationWithMessages } from '@/lib/db/conversations'
import { createBrief } from '@/lib/db/briefs'
import { generateBrief } from '@/lib/ai'
import { createEmptySchema } from '@/lib/schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    // Get conversation with messages
    const conversation = await getConversationWithMessages(conversationId)
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Get schema from conversation or create empty
    const schema = conversation.schema_data || createEmptySchema()

    // Generate brief using AI
    const markdownContent = await generateBrief({
      schema,
      messages: conversation.messages,
    })

    // Save brief to database
    const brief = await createBrief({
      conversation_id: conversationId,
      project_name: schema.idea.one_liner || conversation.project_name || '未命名项目',
      markdown_content: markdownContent,
    })

    return NextResponse.json({
      briefId: brief.id,
      markdown: markdownContent,
      projectName: brief.project_name,
    })
  } catch (error) {
    console.error('Brief generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate brief' },
      { status: 500 }
    )
  }
}
