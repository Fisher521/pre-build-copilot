/**
 * useChat Hook
 * Manages chat state with schema-based flow and streaming support
 */

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { Message, EvaluationSchema, WizardState, MessageMetadata } from '@/lib/types'

interface UseChatOptions {
  conversationId: string
  initialMessages?: Message[]
  initialSchema?: EvaluationSchema | null
  enableStreaming?: boolean
}

interface UseChatResult {
  messages: Message[]
  schema: EvaluationSchema | null
  currentState: WizardState
  completionScore: number
  isLoading: boolean
  isStreaming: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  selectChoice: (choiceId: string, choiceText: string) => Promise<void>
}

export function useChat({
  conversationId,
  initialMessages = [],
  initialSchema = null,
  enableStreaming = true,
}: UseChatOptions): UseChatResult {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [schema, setSchema] = useState<EvaluationSchema | null>(initialSchema)
  const [currentState, setCurrentState] = useState<WizardState>('PARSE_INPUT')
  const [completionScore, setCompletionScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const streamingContentRef = useRef('')
  const abortControllerRef = useRef<AbortController | null>(null)

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const sendMessageStreaming = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || isStreaming) return

    setIsLoading(true)
    setIsStreaming(true)
    setError(null)
    streamingContentRef.current = ''

    // Add user message immediately
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    }

    // Add placeholder AI message for streaming
    const aiMessageId = `ai-${Date.now()}`
    const aiMessage: Message = {
      id: aiMessageId,
      conversation_id: conversationId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage, aiMessage])

    // Create abort controller
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: content.trim(),
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('发送消息失败')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let finalMetadata: MessageMetadata | undefined

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'content' && data.content) {
                streamingContentRef.current += data.content
                // Update the AI message content
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMessageId
                      ? { ...m, content: streamingContentRef.current }
                      : m
                  )
                )
              } else if (data.type === 'metadata' && data.metadata) {
                finalMetadata = data.metadata
              } else if (data.type === 'schema') {
                if (data.schema) {
                  setSchema(data.schema)
                  setCurrentState(data.schema._meta.current_state)
                  setCompletionScore(data.schema._meta.completion_score)
                }
              } else if (data.type === 'done') {
                // Update message with final metadata
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMessageId
                      ? {
                          ...m,
                          id: data.messageId || aiMessageId,
                          content: streamingContentRef.current.replace(/---CHOICES---[\s\S]*$/, '').trim(),
                          metadata: finalMetadata,
                        }
                      : m
                  )
                )
              } else if (data.type === 'error') {
                throw new Error(data.error)
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete data
              if (e instanceof SyntaxError) continue
              throw e
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return

      setError(err instanceof Error ? err.message : '发生错误')
      // Remove the messages on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id && m.id !== aiMessageId))
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [conversationId, isLoading, isStreaming])

  const sendMessageNonStreaming = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

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

      if (!response.ok) throw new Error('发送消息失败')

      const data = await response.json()

      const aiMessage: Message = {
        id: data.messageId || `ai-${Date.now()}`,
        conversation_id: conversationId,
        role: 'assistant',
        content: data.content,
        metadata: data.metadata,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, aiMessage])

      if (data.schema) {
        setSchema(data.schema)
        setCurrentState(data.schema._meta.current_state)
        setCompletionScore(data.schema._meta.completion_score)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生错误')
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }, [conversationId, isLoading])

  const sendMessage = useCallback(async (content: string) => {
    if (enableStreaming) {
      await sendMessageStreaming(content)
    } else {
      await sendMessageNonStreaming(content)
    }
  }, [enableStreaming, sendMessageStreaming, sendMessageNonStreaming])

  const selectChoice = useCallback(async (choiceId: string, choiceText: string) => {
    await sendMessage(choiceText)
  }, [sendMessage])

  return {
    messages,
    schema,
    currentState,
    completionScore,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    selectChoice,
  }
}
