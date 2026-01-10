/**
 * Messages Data Access Layer
 */

import { createClient } from '@/lib/supabase/server'
import type { Message, MessageMetadata, MessageRole } from '@/lib/types'

/**
 * Add a message to a conversation
 */
export async function addMessage(
  conversationId: string,
  message: {
    role: MessageRole
    content: string
    metadata?: MessageMetadata
  }
): Promise<Message> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      metadata: message.metadata || {},
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding message:', error)
    throw new Error('Failed to add message')
  }

  return data as Message
}

/**
 * Get all messages for a conversation
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error getting messages:', error)
    throw new Error('Failed to get messages')
  }

  return data as Message[]
}

/**
 * Get recent messages for a conversation (with limit)
 */
export async function getRecentMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error getting recent messages:', error)
    throw new Error('Failed to get recent messages')
  }

  // Reverse to get chronological order
  return (data as Message[]).reverse()
}

/**
 * Get a single message by ID
 */
export async function getMessage(id: string): Promise<Message | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error getting message:', error)
    throw new Error('Failed to get message')
  }

  return data as Message
}

/**
 * Update a message's metadata (e.g., to record selected choice)
 */
export async function updateMessageMetadata(id: string, metadata: MessageMetadata): Promise<Message> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .update({ metadata })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating message metadata:', error)
    throw new Error('Failed to update message metadata')
  }

  return data as Message
}

/**
 * Delete a message
 */
export async function deleteMessage(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting message:', error)
    throw new Error('Failed to delete message')
  }
}

/**
 * Count messages in a conversation
 */
export async function countMessages(conversationId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)

  if (error) {
    console.error('Error counting messages:', error)
    throw new Error('Failed to count messages')
  }

  return count || 0
}

/**
 * Get the last message in a conversation
 */
export async function getLastMessage(conversationId: string): Promise<Message | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error getting last message:', error)
    throw new Error('Failed to get last message')
  }

  return data as Message
}
