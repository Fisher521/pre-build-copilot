/**
 * Feedback API
 * POST /api/feedback - Submit feedback for a report
 * GET /api/feedback - Get feedback stats (admin)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createFeedback, getFeedbackStats, getFeedbackByConversation } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversation_id, rating, reasons, comment, report_score } = body

    // Validation
    if (!conversation_id) {
      return NextResponse.json(
        { error: '缺少 conversation_id' },
        { status: 400 }
      )
    }

    if (!rating || !['helpful', 'not_helpful'].includes(rating)) {
      return NextResponse.json(
        { error: '无效的 rating，必须是 helpful 或 not_helpful' },
        { status: 400 }
      )
    }

    if (!Array.isArray(reasons)) {
      return NextResponse.json(
        { error: 'reasons 必须是数组' },
        { status: 400 }
      )
    }

    // Check if feedback already exists
    const existingFeedback = await getFeedbackByConversation(conversation_id)
    if (existingFeedback) {
      return NextResponse.json(
        { error: '已经提交过反馈', feedback: existingFeedback },
        { status: 409 }
      )
    }

    // Create feedback
    const feedback = await createFeedback({
      conversation_id,
      rating,
      reasons,
      comment: comment || undefined,
      report_score: report_score || undefined,
    })

    return NextResponse.json({ success: true, feedback })
  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json(
      { error: '提交反馈失败' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const stats = await getFeedbackStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Feedback stats error:', error)
    return NextResponse.json(
      { error: '获取统计失败' },
      { status: 500 }
    )
  }
}
