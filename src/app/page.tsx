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

    // 启动加载动画 - 不循环，只递增到最后一步
    loadingIntervalRef.current = setInterval(() => {
      setLoadingStep(prev => Math.min(prev + 1, loadingMessages.length - 1))
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
    const progress = ((loadingStep + 1) / loadingMessages.length) * 100
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-50 pt-16">
        <div className="text-center w-full max-w-sm mx-auto">
          {/* 进度条 */}
          <div className="w-full h-1 bg-gray-200 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 加载文字 */}
          <p className="text-sm text-gray-600 mb-1" key={loadingStep}>
            {currentMessage.text[lang]}
          </p>
          <p className="text-xs text-gray-400">
            {loadingStep + 1} / {loadingMessages.length}
          </p>

          {/* 用户输入回显 */}
          <div className="mt-6 p-3 sm:p-4 bg-white border border-gray-200 rounded-lg text-left">
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 sm:p-6 bg-gray-50 pt-16 sm:pt-20">
      {/* Hero Section */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">justart.today</h1>
        <p className="text-sm sm:text-base text-gray-500">{t('home.tagline')}</p>

        {/* Social Proof */}
        <p
          className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400"
          dangerouslySetInnerHTML={{ __html: t('home.socialProof') }}
        />
      </div>

      {/* Main Input Card */}
      <div className="w-full max-w-lg">
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-0.5 sm:mb-1">
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
              rows={3}
              className={cn(
                'w-full resize-none rounded-md px-3 py-2.5 sm:py-3 text-sm',
                'bg-gray-50 border border-gray-200',
                'focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-100',
                'transition-colors',
                'disabled:opacity-50',
                'min-h-[80px] sm:min-h-[100px]'
              )}
              style={{ maxHeight: '200px' }}
            />

            {/* Action row */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-400 hidden sm:inline">
                {t('home.inputHint')}
              </span>

              <div className="flex items-center gap-2 ml-auto">
                <VoiceButton
                  onTranscript={handleVoiceTranscript}
                  disabled={isLoading}
                />

                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap',
                    'bg-indigo-600 text-white',
                    'hover:bg-indigo-700 transition-colors',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    'flex items-center gap-2'
                  )}
                >
                  {isLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">{t('home.analyzing')}</span>
                    </>
                  ) : (
                    t('home.startEval')
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2 sm:mb-3">{t('home.hotIdeas')}</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example.title[lang]}
                  onClick={() => setInput(example.desc[lang])}
                  disabled={isLoading}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 rounded-md transition-colors disabled:opacity-50"
                >
                  {example.title[lang]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - hidden on mobile */}
      <div className="mt-8 sm:mt-10 text-center hidden sm:block">
        <p className="text-xs text-gray-400 mb-4">{t('home.threeSteps')}</p>
        <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-gray-500">
          {steps.map((step, i) => (
            <div key={step.label[lang]} className="flex items-center gap-4 sm:gap-6">
              <span>{step.label[lang]}</span>
              {i < 2 && <span className="text-gray-300">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 bg-red-600 text-white text-sm px-4 py-2 rounded-md text-center">
          {error}
        </div>
      )}
    </div>
  )
}
