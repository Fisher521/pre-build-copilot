'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { VoiceButton } from '@/components/chat/VoiceButton'
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

  // 加载状态
  if (isLoading) {
    const currentMessage = loadingMessages[loadingStep]
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          {/* 简洁加载动画 */}
          <div className="w-8 h-8 mx-auto mb-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />

          {/* 加载文字 */}
          <p className="text-base text-gray-600 mb-2" key={loadingStep}>
            {currentMessage.text[lang]}
          </p>

          {/* 进度指示器 */}
          <div className="flex justify-center gap-1.5 mt-4">
            {loadingMessages.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-colors',
                  idx === loadingStep ? 'bg-gray-900' : 'bg-gray-300'
                )}
              />
            ))}
          </div>

          {/* 用户输入回显 */}
          <div className="mt-8 p-4 bg-white border border-gray-200 rounded-lg text-left">
            <p className="text-xs text-gray-400 mb-1">{t('home.yourIdea')}</p>
            <p className="text-gray-700 text-sm line-clamp-3">{input}</p>
          </div>
        </div>
      </div>
    )
  }

  const examples = translations.home.examples
  const steps = translations.home.steps

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">justart.today</h1>
        <p className="text-gray-500">{t('home.tagline')}</p>

        {/* Social Proof */}
        <p
          className="mt-3 text-sm text-gray-400"
          dangerouslySetInnerHTML={{ __html: t('home.socialProof') }}
        />
      </div>

      {/* Main Input Card */}
      <div className="w-full max-w-xl">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                {t('home.inputLabel')}
              </label>
              <p className="text-xs text-gray-400">
                {t('home.privacyNote')}
              </p>
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('home.inputPlaceholder')}
              disabled={isLoading}
              rows={4}
              className={cn(
                'w-full resize-none rounded-md px-3 py-3 text-sm',
                'bg-gray-50 border border-gray-200',
                'focus:border-gray-400 focus:bg-white focus:outline-none',
                'transition-colors',
                'disabled:opacity-50',
                'min-h-[100px]'
              )}
              style={{ maxHeight: '200px' }}
            />

            {/* Action row */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {t('home.inputHint')}
              </span>

              <div className="flex items-center gap-2">
                <VoiceButton
                  onTranscript={handleVoiceTranscript}
                  disabled={isLoading}
                />

                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium',
                    'bg-gray-900 text-white',
                    'hover:bg-gray-800 transition-colors',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    'flex items-center gap-2'
                  )}
                >
                  {isLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('home.analyzing')}
                    </>
                  ) : (
                    t('home.startEval')
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-3">{t('home.hotIdeas')}</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example.title[lang]}
                  onClick={() => setInput(example.desc[lang])}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors disabled:opacity-50"
                >
                  {example.title[lang]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-10 text-center">
        <p className="text-xs text-gray-400 mb-4">{t('home.threeSteps')}</p>
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          {steps.map((step, i) => (
            <div key={step.label[lang]} className="flex items-center gap-6">
              <span>{step.label[lang]}</span>
              {i < 2 && <span className="text-gray-300">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white text-sm px-4 py-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
}
