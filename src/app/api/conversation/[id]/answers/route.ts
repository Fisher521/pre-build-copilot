/**
 * Save Answers API
 * POST /api/conversation/[id]/answers - Save wizard question answers
 */

import { NextRequest, NextResponse } from 'next/server'
import { getConversation, updateConversation } from '@/lib/db/conversations'
import type { EvaluationSchema } from '@/lib/types'

// Helper to update nested object by dot notation path
// e.g. set(obj, 'user.experience_level', 'expert')
function setDeep(obj: any, path: string, value: any) {
  const keys = path.split('.')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {}
    current = current[keys[i]]
  }
  current[keys[keys.length - 1]] = value
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { answers } = body

    const conversation = await getConversation(id)
    if (!conversation) {
      return NextResponse.json(
        { error: '对话不存在' },
        { status: 404 }
      )
    }

    // 1. Save answers to metadata (The Source of Truth for Report V2)
    const newMetadata = {
      ...conversation.metadata,
      answers: {
        ...(conversation.metadata?.answers as Record<string, any> || {}),
        ...answers
      }
    }

    // 2. Attempt to update schema data if keys match schema paths
    // Dynamic questions have 'field' property like 'user.experience_level'
    const newSchema = { ...conversation.schema_data }
    Object.entries(answers).forEach(([key, value]) => {
      // If key looks like a path (contains dot), try to update schema
      if (key.includes('.')) {
        try {
          setDeep(newSchema, key, value)
        } catch (e) {
          console.warn(`Failed to map answer ${key} to schema`, e)
        }
      }
    })
    
    // Update timestamp
    newSchema._meta = {
       ...newSchema._meta,
       updated_at: new Date().toISOString()
    }

    // Save both
    await updateConversation(id, {
      metadata: newMetadata,
      schema_data: newSchema
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Save answers error:', error)
    return NextResponse.json(
      { error: '保存失败' },
      { status: 500 }
    )
  }
}
