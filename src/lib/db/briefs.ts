/**
 * Briefs Data Access Layer
 */

import { createClient } from '@/lib/supabase/server'
import type { Brief, MarketAnalysis, TechStack, CostEstimate, TimelineEstimate, LearningResource, Risk } from '@/lib/types'

/**
 * Create a new brief
 */
export async function createBrief(data: {
  conversation_id: string
  project_name: string
  project_description?: string
  market_analysis?: MarketAnalysis
  tech_stack?: TechStack
  cost_estimate?: CostEstimate
  timeline_estimate?: TimelineEstimate
  learning_resources?: LearningResource[]
  risks?: Risk[]
  markdown_content: string
}): Promise<Brief> {
  const supabase = await createClient()

  const { data: brief, error } = await supabase
    .from('briefs')
    .insert({
      conversation_id: data.conversation_id,
      project_name: data.project_name,
      project_description: data.project_description,
      market_analysis: data.market_analysis || {},
      tech_stack: data.tech_stack || {},
      cost_estimate: data.cost_estimate || {},
      timeline_estimate: data.timeline_estimate || {},
      learning_resources: data.learning_resources || [],
      risks: data.risks || [],
      markdown_content: data.markdown_content,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating brief:', error)
    throw new Error('Failed to create brief')
  }

  return brief as Brief
}

/**
 * Get a brief by ID
 */
export async function getBrief(id: string): Promise<Brief | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('briefs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error getting brief:', error)
    throw new Error('Failed to get brief')
  }

  return data as Brief
}

/**
 * Get a brief by conversation ID
 */
export async function getBriefByConversation(conversationId: string): Promise<Brief | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('briefs')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error getting brief by conversation:', error)
    throw new Error('Failed to get brief by conversation')
  }

  return data as Brief
}

/**
 * Update a brief
 */
export async function updateBrief(
  id: string,
  updates: Partial<{
    project_name: string
    project_description: string
    market_analysis: MarketAnalysis
    tech_stack: TechStack
    cost_estimate: CostEstimate
    timeline_estimate: TimelineEstimate
    learning_resources: LearningResource[]
    risks: Risk[]
    markdown_content: string
  }>
): Promise<Brief> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('briefs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating brief:', error)
    throw new Error('Failed to update brief')
  }

  return data as Brief
}

/**
 * Delete a brief
 */
export async function deleteBrief(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('briefs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting brief:', error)
    throw new Error('Failed to delete brief')
  }
}

/**
 * Get all briefs for a user (requires user_id in conversations)
 */
export async function getUserBriefs(userId: string, limit: number = 10): Promise<Brief[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('briefs')
    .select(`
      *,
      conversations!inner (
        user_id
      )
    `)
    .eq('conversations.user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error getting user briefs:', error)
    throw new Error('Failed to get user briefs')
  }

  return data as Brief[]
}
