/**
 * useChat Hook
 * Manages chat state with schema-based flow
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Message, EvaluationSchema, WizardState, AIResponse } from '@/lib/types'

interface UseChatOptions {
  conversationId: string
  initialMessages?: Message[]
  initialSchema?: EvaluationSchema | null
}

interface UseChatResult {
  messages: Message[]
  schema: EvaluationSchema | null
  currentState: WizardState
  completionScore: number
  isLoading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  selectChoice: (choiceId: string, choiceText: string) => Promise<void>
}

export function useChat({
  conversationId,
  initialMessages = [],
  initialSchema = null,
}: UseChatOptions): UseChatResult {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [schema, setSchema] = useState<EvaluationSchema | null>(initialSchema)
  const [currentState, setCurrentState] = useState<WizardState>('PARSE_INPUT')
  const [completionScore, setCompletionScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync messages when initialMessages changes
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages)
    }
  }, [initialMessages])

  // Sync schema when initialSchema changes
  useEffect(() => {
    if (initialSchema) {
      setSchema(initialSchema)
      setCurrentState(initialSchema._meta.current_state)
      setCompletionScore(initialSchema._meta.completion_score)
    }
  }, [initialSchema])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    // Add user message immediately (optimistic update)
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: content.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('发送消息失败')
      }

      const data: AIResponse & {
        messageId?: string
        schema?: EvaluationSchema
      } = await response.json()

      // Add AI response
      const aiMessage: Message = {
        id: data.messageId || `ai-${Date.now()}`,
        conversation_id: conversationId,
        role: 'assistant',
        content: data.content,
        metadata: data.metadata,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, aiMessage])

      // Update schema state
      if (data.schema) {
        setSchema(data.schema)
        setCurrentState(data.schema._meta.current_state)
        setCompletionScore(data.schema._meta.completion_score)
      } else if (data.nextState) {
        setCurrentState(data.nextState)
      }

      if (data.completionScore !== undefined) {
        setCompletionScore(data.completionScore)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生错误')
      // Remove the optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }, [conversationId, isLoading])

  const selectChoice = useCallback(async (choiceId: string, choiceText: string) => {
    await sendMessage(choiceText)
  }, [sendMessage])

  return {
    messages,
    schema,
    currentState,
    completionScore,
    isLoading,
    error,
    sendMessage,
    selectChoice,
  }
}
