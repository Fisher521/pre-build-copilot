/**
 * Conversations Data Access Layer
 * Updated to support EvaluationSchema
 */

import { createClient } from '@/lib/supabase/server'
import type { Conversation, ConversationWithMessages, ConversationStatus, EvaluationSchema } from '@/lib/types'
import { createEmptySchema } from '@/lib/schema'

/**
 * Create a new conversation with empty schema
 */
export async function createConversation(userId?: string): Promise<Conversation> {
  const supabase = await createClient()
  const initialSchema = createEmptySchema()

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId || null,
      current_layer: 1, // Keep for backward compatibility
      status: 'active',
      schema_data: initialSchema,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating conversation:', error)
    throw new Error('Failed to create conversation')
  }

  // Ensure schema_data is properly typed
  return {
    ...data,
    schema_data: data.schema_data || initialSchema,
  } as Conversation
}

/**
 * Get a conversation by ID
 */
export async function getConversation(id: string): Promise<Conversation | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error getting conversation:', error)
    throw new Error('Failed to get conversation')
  }

  // Ensure schema_data exists
  return {
    ...data,
    schema_data: data.schema_data || createEmptySchema(),
  } as Conversation
}

/**
 * Get a conversation with all its messages
 */
export async function getConversationWithMessages(id: string): Promise<ConversationWithMessages | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages (
        id,
        conversation_id,
        role,
        content,
        metadata,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error getting conversation with messages:', error)
    throw new Error('Failed to get conversation with messages')
  }

  // Sort messages by created_at
  if (data.messages) {
    data.messages.sort((a: { created_at: string }, b: { created_at: string }) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }

  return {
    ...data,
    schema_data: data.schema_data || createEmptySchema(),
  } as ConversationWithMessages
}

/**
 * Update a conversation
 */
export async function updateConversation(
  id: string,
  updates: Partial<{
    current_layer: number
    status: ConversationStatus
    project_name: string
    project_description: string
    schema_data: EvaluationSchema
    metadata: Record<string, unknown>
    completed_at: string
  }>
): Promise<Conversation> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conversations')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating conversation:', error)
    throw new Error('Failed to update conversation')
  }

  return {
    ...data,
    schema_data: data.schema_data || createEmptySchema(),
  } as Conversation
}

/**
 * Update conversation schema
 */
export async function updateConversationSchema(
  id: string,
  schema: EvaluationSchema
): Promise<Conversation> {
  return updateConversation(id, { schema_data: schema })
}

/**
 * Mark conversation as completed
 */
export async function completeConversation(id: string): Promise<Conversation> {
  return updateConversation(id, {
    status: 'completed',
    completed_at: new Date().toISOString(),
  })
}

/**
 * Mark conversation as abandoned
 */
export async function abandonConversation(id: string): Promise<Conversation> {
  return updateConversation(id, {
    status: 'abandoned',
  })
}

/**
 * Get recent conversations for a user
 */
export async function getRecentConversations(userId?: string, limit: number = 10): Promise<Conversation[]> {
  const supabase = await createClient()

  let query = supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error getting recent conversations:', error)
    throw new Error('Failed to get recent conversations')
  }

  return (data || []).map(conv => ({
    ...conv,
    schema_data: conv.schema_data || createEmptySchema(),
  })) as Conversation[]
}

/**
 * Delete a conversation (and all related data)
 */
export async function deleteConversation(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting conversation:', error)
    throw new Error('Failed to delete conversation')
  }
}
