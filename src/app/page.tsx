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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />

      {/* GitHub Link */}
      <a
        href="https://github.com/anthropics/claude-code"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
        <span>GitHub</span>
      </a>

      {/* Hero Section */}
      <div className="text-center mb-8 relative z-10">
        {/* Logo with glow effect */}
        <div className="relative w-20 h-20 mx-auto mb-5">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 blur-xl opacity-40 animate-pulse" />
          <div
            className="relative w-full h-full rounded-2xl flex items-center justify-center text-4xl shadow-xl"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)' }}
          >
            <span className="text-white drop-shadow-sm">💡</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vibe Checker</h1>
        <p className="text-gray-500 text-lg">写代码前，先 vibe 一下</p>

        {/* Social Proof */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 border-2 border-white" />
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white" />
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white" />
          </div>
          <span className="text-sm text-gray-600">
            已有 <span className="font-semibold text-gray-900">2,000+</span> 个项目完成评估
          </span>
        </div>
      </div>

      {/* Main Input Card */}
      <div className="relative z-10 w-full max-w-2xl">
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
          <p className="text-sm text-gray-400 mb-3">试试这些热门想法：</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: '📰', title: 'AI 新闻站', desc: '每日新闻 AI 摘要' },
              { icon: '🧠', title: '思维导图', desc: '读书笔记自动生成' },
              { icon: '🎯', title: '落地页生成', desc: '一句话生成落地页' },
            ].map((example) => (
              <button
                key={example.title}
                onClick={() => setInput(example.desc)}
                disabled={isLoading}
                className="group p-4 text-left bg-gray-50 hover:bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all disabled:opacity-50"
              >
                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">{example.icon}</span>
                <span className="font-medium text-gray-900 block text-sm">{example.title}</span>
                <span className="text-xs text-gray-500">{example.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </StepCard>
      </div>

      {/* How It Works */}
      <div className="relative z-10 mt-12 text-center">
        <p className="text-sm text-gray-400 mb-6">三步搞定可行性分析</p>
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          {[
            { icon: '📝', label: '描述想法', sub: '30秒输入' },
            { icon: '🔍', label: 'AI 分析', sub: '智能评估' },
            { icon: '📊', label: '获得报告', sub: '可行方案' },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-4 sm:gap-8">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-xl sm:text-2xl">
                  {step.icon}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-700">{step.label}</div>
                <div className="text-xs text-gray-400">{step.sub}</div>
              </div>
              {i < 2 && (
                <div className="text-gray-300 text-lg">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  )
}
