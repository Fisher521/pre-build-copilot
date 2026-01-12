/**
 * Get Conversation API
 * GET /api/conversation/[id] - Get conversation details
 */

import { NextRequest, NextResponse } from 'next/server'
import { getConversation } from '@/lib/db/conversations'

export async function GET(
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

    return NextResponse.json({
      id: conversation.id,
      schema: conversation.schema_data,
      status: conversation.status,
      metadata: conversation.metadata,
      createdAt: conversation.created_at,
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json(
      { error: '获取对话失败' },
      { status: 500 }
    )
  }
}
