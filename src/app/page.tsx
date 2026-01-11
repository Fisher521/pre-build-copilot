'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { VoiceButton } from '@/components/chat/VoiceButton'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [input])

  // Auto focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    setError(null)
    setIsLoading(true)

    try {
      // Create conversation with initial input
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialInput: trimmed,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '创建对话失败')
      }

      // Show warning if AI had issues but conversation was created
      if (result.error && result.conversationId) {
        console.warn('AI warning:', result.error)
      }

      // Navigate to chat page
      router.push(`/chat/${result.conversationId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误，请检查连接后重试')
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    setInput((prev) => prev + transcript)
    textareaRef.current?.focus()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white">
      {/* Logo */}
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
          style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}
        >
          <span className="text-white">🚀</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Pre-build Copilot</h1>
        <p className="text-gray-500 mt-2">开发前决策助手</p>
      </div>

      {/* Welcome Message */}
      <div className="w-full max-w-xl text-center mb-8">
        <div className="bg-gray-100 rounded-2xl rounded-bl-sm p-6 text-left shadow-sm">
          <p className="text-gray-900 text-lg leading-relaxed">
            嗨！我是你的开发决策助手 👋
          </p>
          <p className="text-gray-700 mt-3 leading-relaxed">
            先别急着写代码，咱们聊聊你的想法？
            <br />
            你可以随便说说，不用想得太清楚 😊
          </p>
          <p className="text-gray-500 mt-4 text-sm">
            比如：「我想做一个帮人快速生成周报的工具」
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="w-full max-w-xl">
        <div className="relative flex items-end gap-2 bg-white rounded-2xl shadow-lg p-3 border border-gray-200">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="告诉我你想做什么..."
            disabled={isLoading}
            rows={3}
            className={cn(
              'flex-1 resize-none rounded-xl px-4 py-3 text-base leading-relaxed',
              'bg-gray-50 border-2 border-transparent',
              'focus:border-primary-500 focus:bg-white focus:outline-none',
              'transition-all duration-200',
              'disabled:opacity-50',
              'min-h-[80px]'
            )}
            style={{ maxHeight: '160px' }}
          />
          {/* Voice Button */}
          <VoiceButton
            onTranscript={handleVoiceTranscript}
            disabled={isLoading}
          />
          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center',
              'bg-primary-500 text-white',
              'transition-all duration-200',
              'hover:bg-primary-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Hint */}
        <p className="text-center text-sm text-gray-400 mt-4">
          按 Enter 发送，Shift+Enter 换行
        </p>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  )
}
