/**
 * Feedback Data Access Layer
 * Store user feedback for report quality improvement
 */

import { createClient } from '@/lib/supabase/server'

export interface Feedback {
  id: string
  conversation_id: string
  rating: 'helpful' | 'not_helpful'
  reasons: string[]
  comment?: string
  report_score?: number
  created_at: string
}

export interface CreateFeedbackInput {
  conversation_id: string
  rating: 'helpful' | 'not_helpful'
  reasons: string[]
  comment?: string
  report_score?: number
}

/**
 * Create feedback for a report
 */
export async function createFeedback(input: CreateFeedbackInput): Promise<Feedback> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('feedback')
    .insert({
      conversation_id: input.conversation_id,
      rating: input.rating,
      reasons: input.reasons,
      comment: input.comment || null,
      report_score: input.report_score || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating feedback:', error)
    throw new Error('Failed to create feedback')
  }

  return data as Feedback
}

/**
 * Get feedback by conversation ID
 */
export async function getFeedbackByConversation(conversationId: string): Promise<Feedback | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('conversation_id', conversationId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error getting feedback:', error)
    throw new Error('Failed to get feedback')
  }

  return data as Feedback
}

/**
 * Get all feedback (for admin/analytics)
 */
export async function getAllFeedback(limit: number = 100): Promise<Feedback[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error getting all feedback:', error)
    throw new Error('Failed to get feedback')
  }

  return (data || []) as Feedback[]
}

/**
 * Get feedback statistics
 */
export async function getFeedbackStats(): Promise<{
  total: number
  helpful: number
  not_helpful: number
  helpfulRate: number
  topReasons: { reason: string; count: number }[]
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('feedback')
    .select('rating, reasons')

  if (error) {
    console.error('Error getting feedback stats:', error)
    throw new Error('Failed to get feedback stats')
  }

  const feedbacks = data || []
  const total = feedbacks.length
  const helpful = feedbacks.filter(f => f.rating === 'helpful').length
  const not_helpful = total - helpful

  // Count reasons
  const reasonCounts: Record<string, number> = {}
  feedbacks.forEach(f => {
    (f.reasons || []).forEach((reason: string) => {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
    })
  })

  const topReasons = Object.entries(reasonCounts)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    total,
    helpful,
    not_helpful,
    helpfulRate: total > 0 ? (helpful / total) * 100 : 0,
    topReasons,
  }
}
