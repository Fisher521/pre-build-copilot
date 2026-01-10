/**
 * Conversation API Route
 * POST /api/conversation - Create new conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createConversation, updateConversation } from '@/lib/db/conversations'
import { addMessage } from '@/lib/db/messages'
import { generateStarterMessage } from '@/lib/ai'
import { createEmptySchema } from '@/lib/schema'
import type { EvaluationSchema, MVPType, TimelinePreference } from '@/lib/types'

interface WizardData {
  projectType: string
  projectName: string
  timeBudget: string
  audience: string
}

/**
 * Map wizard data to initial schema
 */
function createSchemaFromWizardData(data: WizardData): EvaluationSchema {
  const schema = createEmptySchema()

  // Map project name to idea
  if (data.projectName) {
    schema.idea.one_liner = data.projectName
  }

  // Map audience to user
  const audienceMap: Record<string, string> = {
    self: '自己',
    friends: '朋友/家人',
    public: '大众',
  }
  if (data.audience && audienceMap[data.audience]) {
    schema.user.primary_user = audienceMap[data.audience]
  }

  // Map project type to mvp.type
  const typeMap: Record<string, MVPType> = {
    app: 'functional_tool',
    web: 'functional_tool',
    tool: 'functional_tool',
    ai: 'ai_tool',
    other: 'other',
  }
  if (data.projectType && typeMap[data.projectType]) {
    schema.mvp.type = typeMap[data.projectType]
  }

  // Map time budget to preference
  const timeMap: Record<string, TimelinePreference> = {
    weekend: '7d',
    month: '30d',
    flexible: 'flexible',
  }
  if (data.timeBudget && timeMap[data.timeBudget]) {
    schema.preference.timeline = timeMap[data.timeBudget]
  }

  return schema
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const wizardData = body.wizardData as WizardData | undefined

    // Create new conversation
    const conversation = await createConversation()

    // Initialize schema with wizard data if provided
    let schema = createEmptySchema()
    if (wizardData) {
      schema = createSchemaFromWizardData(wizardData)

      // Update conversation with project name and schema
      await updateConversation(conversation.id, {
        project_name: wizardData.projectName || undefined,
        schema_data: schema,
      })
    }

    // Generate starter message
    const starterMessage = await generateStarterMessage()

    await addMessage(conversation.id, {
      role: 'assistant',
      content: starterMessage.content,
      metadata: starterMessage.metadata,
    })

    return NextResponse.json({
      conversationId: conversation.id,
      message: starterMessage,
      schema,
      wizardContext: wizardData,
    })
  } catch (error) {
    console.error('Conversation API error:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
