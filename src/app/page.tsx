'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { VoiceButton } from '@/components/chat/VoiceButton'
import { StepCard } from '@/components/wizard'
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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
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

      // Navigate to review page (Step 2)
      router.push(`/review/${result.conversationId}`)
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
          <span className="text-white">💡</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Vibe Checker</h1>
        <p className="text-gray-500 mt-2">写代码前，先 check 一下</p>
      </div>

      {/* Main Input Card */}
      <StepCard maxWidth="2xl">
        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-900">
            💡 告诉我你想做什么
          </label>
          
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="随便说说你的想法，不用想得太清楚..."
              disabled={isLoading}
              rows={4}
              className={cn(
                'w-full resize-none rounded-xl px-4 py-4 text-base leading-relaxed',
                'bg-gray-50 border-2 border-transparent',
                'focus:border-primary-500 focus:bg-white focus:outline-none',
                'transition-all duration-200',
                'disabled:opacity-50',
                'min-h-[120px]'
              )}
              style={{ maxHeight: '200px' }}
            />
          </div>

          {/* Action row */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              按 Enter 发送，Shift+Enter 换行
            </div>
            
            <div className="flex items-center gap-3">
              <VoiceButton
                onTranscript={handleVoiceTranscript}
                disabled={isLoading}
              />
              
              <button
                onClick={handleSubmit}
                disabled={isLoading || !input.trim()}
                className={cn(
                  'px-6 py-2.5 rounded-xl text-sm font-medium',
                  'bg-primary-500 text-white',
                  'hover:bg-primary-600 transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center gap-2'
                )}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    开始评估
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-400 mb-3">比如：</p>
          <div className="flex flex-wrap gap-2">
            {[
              '帮人快速生成周报的工具',
              '独居老人订菜小程序',
              '宠物健康追踪 App',
            ].map((example) => (
              <button
                key={example}
                onClick={() => setInput(example)}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </StepCard>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  )
}
