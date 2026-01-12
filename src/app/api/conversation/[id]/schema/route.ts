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

      // Generate questions with strict 8s timeout for Vercel Serverless
      let generatedQuestions = []
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI Generation Timeout')), 8000)
        )
        
        generatedQuestions = await Promise.race([
          generateProjectQuestions(updatedSchema),
          timeoutPromise
        ]) as any[]
      } catch (error) {
        console.warn('Question generation timed out/failed, using fallback:', error)
        // Hardcoded fallback to ensure flow continues
        generatedQuestions = [
          {
            id: 'experience',
            field: 'user.experience_level',
            question: 'What is your experience level with coding/products?',
            insight: 'This helps us tailor the tech stack recommendations.',
            type: 'choice',
            options: [
              { id: 'never', label: 'First timer', value: 'never', feedback: { type: 'neutral', message: "Welcome! We'll guide you step-by-step." } },
              { id: 'veteran', label: 'Experienced', value: 'veteran', feedback: { type: 'positive', message: "Awesome, let's talk advanced tools." } }
            ]
          }
        ]
      }

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
