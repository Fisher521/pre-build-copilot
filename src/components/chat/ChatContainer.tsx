/**
 * ChatContainer Component
 * Main chat interface with progress indicator and schema-based flow
 */

'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from '@/hooks/useChat'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { LoadingDots } from '@/components/ui/LoadingDots'
import { Button } from '@/components/ui/Button'
import type { Message, EvaluationSchema } from '@/lib/types'

interface ChatContainerProps {
  conversationId: string
  initialMessages?: Message[]
  initialSchema?: EvaluationSchema | null
  onBack?: () => void
}

/**
 * Progress bar component
 */
function ProgressBar({ score }: { score: number }) {
  const filled = Math.floor(score / 20)
  const segments = Array.from({ length: 5 }, (_, i) => i < filled)

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <div className="flex gap-1">
        {segments.map((isFilled, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-sm ${
              isFilled ? 'bg-primary-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <span>{score}%</span>
      {score < 40 && <span className="text-gray-400">· 收集信息中</span>}
      {score >= 40 && score < 80 && <span className="text-gray-400">· 可以给初步建议了</span>}
      {score >= 80 && <span className="text-green-600">· 信息充足</span>}
    </div>
  )
}

export function ChatContainer({
  conversationId,
  initialMessages = [],
  initialSchema = null,
  onBack,
}: ChatContainerProps) {
  const router = useRouter()
  const {
    messages,
    schema,
    completionScore,
    isLoading,
    error,
    sendMessage,
  } = useChat({
    conversationId,
    initialMessages,
    initialSchema,
  })

  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push('/')
    }
  }

  const handleGenerateBrief = async () => {
    setIsGeneratingBrief(true)
    try {
      const response = await fetch('/api/brief/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate brief')
      }

      const result = await response.json()
      router.push(`/brief/${result.briefId}`)
    } catch (err) {
      console.error('Brief generation error:', err)
      alert('生成 Brief 失败，请稍后重试')
    } finally {
      setIsGeneratingBrief(false)
    }
  }

  // Can generate brief when score >= 40
  const canGenerateBrief = completionScore >= 40

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              ← 返回
            </button>
            <h1 className="font-semibold text-gray-900">Pre-build Copilot</h1>
            {canGenerateBrief && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateBrief}
                loading={isGeneratingBrief}
                disabled={isLoading || isGeneratingBrief}
              >
                生成报告
              </Button>
            )}
            {!canGenerateBrief && <div className="w-20" />}
          </div>

          {/* Progress Bar */}
          <div className="mt-2">
            <ProgressBar score={completionScore} />
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto pb-24 pt-24">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              开始和我聊聊你的项目想法吧
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLast={index === messages.length - 1 && !isLoading}
            />
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm">
                <LoadingDots />
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-4 text-red-500 text-sm">
              {error}
              <button
                className="ml-2 text-primary-500 hover:underline"
                onClick={() => window.location.reload()}
              >
                重试
              </button>
            </div>
          )}

          {/* Brief Generation Prompt - shown when score >= 40 */}
          {canGenerateBrief && !isLoading && completionScore < 80 && (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-3">
                信息已经足够给你初步建议了，你可以继续聊或者直接生成报告
              </p>
              <Button
                variant="secondary"
                size="md"
                onClick={handleGenerateBrief}
                loading={isGeneratingBrief}
              >
                生成 Pre-build Brief
              </Button>
            </div>
          )}

          {/* Full evaluation prompt - shown when score >= 80 */}
          {completionScore >= 80 && !isLoading && (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-3">
                信息收集完整，可以生成完整的评估报告了
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={handleGenerateBrief}
                loading={isGeneratingBrief}
              >
                生成完整评估报告
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  )
}
