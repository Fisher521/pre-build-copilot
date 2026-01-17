'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { VoiceButton } from '@/components/chat/VoiceButton'
import { StepCard } from '@/components/wizard'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

export default function HomePage() {
  const router = useRouter()
  const { t, lang, translations } = useTranslation()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 加载过程中的提示语
  const loadingMessages = translations.home.loadingMessages

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
      setLoadingStep(prev => (prev + 1) % loadingMessages.length)
    }, 1500)

    try {
      // Create conversation with initial input
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialInput: trimmed,
          language: lang,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || t('home.createFailed'))
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
      setError(err instanceof Error ? err.message : t('home.networkError'))
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
    const currentMessage = loadingMessages[loadingStep]
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
              {currentMessage.text[lang]}
            </p>
          </div>

          {/* 进度指示器 */}
          <div className="flex justify-center gap-2 mt-6">
            {loadingMessages.map((_, idx) => (
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
            <p className="text-sm text-gray-400 mb-2">{t('home.yourIdea')}</p>
            <p className="text-gray-700 line-clamp-3">{input}</p>
          </div>
        </div>
      </div>
    )
  }

  const examples = translations.home.examples
  const steps = translations.home.steps

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />

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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">justart.today</h1>
        <p className="text-gray-500 text-lg">{t('home.tagline')}</p>

        {/* Social Proof */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 border-2 border-white" />
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white" />
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white" />
          </div>
          <span
            className="text-sm text-gray-600"
            dangerouslySetInnerHTML={{ __html: t('home.socialProof') }}
          />
        </div>
      </div>

      {/* Main Input Card */}
      <div className="relative z-10 w-full max-w-2xl">
      <StepCard maxWidth="2xl">
        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-900">
            💡 {t('home.inputLabel')}
          </label>
          <p className="text-xs text-gray-400 mt-1">
            🔒 {t('home.privacyNote')}
          </p>

          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('home.inputPlaceholder')}
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
              {t('home.inputHint')}
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
                    {t('home.analyzing')}
                  </>
                ) : (
                  <>
                    {t('home.startEval')}
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-400 mb-3">{t('home.hotIdeas')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {examples.map((example) => (
              <button
                key={example.title[lang]}
                onClick={() => setInput(example.desc[lang])}
                disabled={isLoading}
                className="group p-4 text-left bg-gray-50 hover:bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all disabled:opacity-50"
              >
                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">{example.icon}</span>
                <span className="font-medium text-gray-900 block text-sm">{example.title[lang]}</span>
                <span className="text-xs text-gray-500">{example.desc[lang]}</span>
              </button>
            ))}
          </div>
        </div>
      </StepCard>
      </div>

      {/* How It Works */}
      <div className="relative z-10 mt-12 text-center">
        <p className="text-sm text-gray-400 mb-6">{t('home.threeSteps')}</p>
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          {steps.map((step, i) => (
            <div key={step.label[lang]} className="flex items-center gap-4 sm:gap-8">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-xl sm:text-2xl">
                  {step.icon}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-700">{step.label[lang]}</div>
                <div className="text-xs text-gray-400">{step.sub[lang]}</div>
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
