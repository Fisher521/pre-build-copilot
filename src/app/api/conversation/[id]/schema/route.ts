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
        // 中文 fallback 问题，确保流程继续
        generatedQuestions = [
          {
            id: 'experience',
            field: 'user.experience_level',
            question: '你之前做过类似的项目吗？',
            insight: '这会帮我调整建议的详细程度',
            type: 'choice',
            options: [
              { id: 'never', label: '从没用 AI 做过东西，今天想试试', value: 'never', feedback: { type: 'neutral', message: '那我会给你最详细的步骤，每一步都带说明，别担心' } },
              { id: 'tutorial', label: '跟着教程做过，但自己想做的没做出来', value: 'tutorial', feedback: { type: 'neutral', message: '我会重点标出容易卡住的地方，帮你避坑' } },
              { id: 'small_project', label: '做过一些小东西，想做个正经点的', value: 'small_project', feedback: { type: 'positive', message: '基础的我就不啰嗦了，重点讲这个项目特殊的地方' } },
              { id: 'veteran', label: '做过好几个了，想看看这个想法靠不靠谱', value: 'veteran', feedback: { type: 'positive', message: '直接讲关键决策点，不浪费你时间' } }
            ]
          },
          {
            id: 'product_form',
            field: 'platform.form',
            question: '你希望做成什么样子？',
            insight: '不同形式的难度差很多，选对了能省很多事',
            type: 'choice',
            options: [
              { id: 'web', label: '网页，打开就能用', value: 'web', feedback: { type: 'positive', message: '最简单的形式，几小时就能上线' } },
              { id: 'miniprogram', label: '微信小程序', value: 'miniprogram', feedback: { type: 'warning', message: '需要注册和审核，比网页多一周流程' } },
              { id: 'plugin', label: '浏览器插件', value: 'plugin', feedback: { type: 'neutral', message: '中等难度，要学一点插件开发的规则' } },
              { id: 'app', label: '手机 App', value: 'ios', feedback: { type: 'warning', message: '最复杂，建议先用网页验证想法' } }
            ]
          },
          {
            id: 'monetization',
            field: 'preference.priority',
            question: '你希望它能赚钱吗？',
            insight: '这会影响我给你的建议方向',
            type: 'choice',
            options: [
              { id: 'hobby', label: '不用，做着玩 / 自己用', value: 'ship_fast', feedback: { type: 'positive', message: '那专注做得好用就行' } },
              { id: 'pocket', label: '能赚点零花钱就行', value: 'stable_first', feedback: { type: 'neutral', message: '我会建议一些简单的变现方式' } },
              { id: 'sideline', label: '希望能当副业', value: 'cost_first', feedback: { type: 'neutral', message: '会帮你想想定价和获客' } },
              { id: 'unsure', label: '没想过', value: 'unknown', feedback: { type: 'neutral', message: '先做出来，后面再说也行' } }
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
