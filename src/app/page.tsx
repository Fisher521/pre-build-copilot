'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { VoiceButton } from '@/components/chat/VoiceButton'
import { StepCard } from '@/components/wizard'
import { cn } from '@/lib/utils'

// 加载过程中的提示语
const LOADING_MESSAGES = [
  { text: '正在理解你的想法...', icon: '🧠' },
  { text: '分析项目关键信息...', icon: '🔍' },
  { text: '提取核心功能点...', icon: '✨' },
  { text: '识别目标用户群体...', icon: '👥' },
  { text: '马上就好...', icon: '🚀' },
]

export default function HomePage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

  // 清理加载动画
  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current)
      }
    }
  }, [])

  const handleSubmit = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    setError(null)
    setIsLoading(true)
    setLoadingStep(0)

    // 启动加载动画
    loadingIntervalRef.current = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 1500)

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

      // 清理动画
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current)
      }

      // Navigate to review page (Step 2)
      router.push(`/review/${result.conversationId}`)
    } catch (err) {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current)
      }
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

  // 加载状态的全屏遮罩
  if (isLoading) {
    const currentMessage = LOADING_MESSAGES[loadingStep]
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-md mx-auto">
          {/* 动画图标 */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* 外圈旋转 */}
            <div className="absolute inset-0 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin" />
            {/* 内圈图标 */}
            <div className="absolute inset-2 rounded-full bg-white shadow-lg flex items-center justify-center">
              <span className="text-3xl animate-pulse">{currentMessage.icon}</span>
            </div>
          </div>

          {/* 加载文字 */}
          <div className="h-8 flex items-center justify-center">
            <p
              className="text-lg font-medium text-gray-700 animate-in fade-in duration-300"
              key={loadingStep}
            >
              {currentMessage.text}
            </p>
          </div>

          {/* 进度指示器 */}
          <div className="flex justify-center gap-2 mt-6">
            {LOADING_MESSAGES.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  idx === loadingStep ? 'bg-primary-500 scale-125' : 'bg-gray-200'
                )}
              />
            ))}
          </div>

          {/* 用户输入回显 */}
          <div className="mt-8 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-400 mb-2">你的想法：</p>
            <p className="text-gray-700 line-clamp-3">{input}</p>
          </div>
        </div>
      </div>
    )
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
              '用 AI 帮我做个每日新闻摘要站',
              '读书笔记自动生成思维导图',
              '一句话生成落地页的工具',
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
