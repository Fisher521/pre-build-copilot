'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'
import type { Question } from '@/lib/types'

export default function QuestionsPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string
  const { t } = useTranslation()

  const [isLoading, setIsLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const lastClickRef = useRef<{ value: string; time: number } | null>(null)

  // Load questions from metadata
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`/api/conversation/${conversationId}`)
        if (!response.ok) throw new Error(t('review.loadFailed'))

        const data = await response.json()
        const generated = data.metadata?.generatedQuestions as Question[]

        if (generated && generated.length > 0) {
          setQuestions(generated)
        } else {
          console.warn('No generated questions found')
        }
      } catch (err) {
        console.error('Load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [conversationId, t])

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const selectedValue = currentQuestion ? answers[currentQuestion.id] : undefined

  // Find selected option object to get feedback
  const selectedOption = currentQuestion?.options?.find(opt => opt.value === selectedValue)

  const handleOptionClick = (value: string) => {
    const now = Date.now()
    const lastClick = lastClickRef.current

    // Check for double-click (within 400ms on same option)
    if (lastClick && lastClick.value === value && now - lastClick.time < 400) {
      // Double-click: select and proceed immediately
      setAnswers(prev => ({ ...prev, [currentQuestion!.id]: value }))
      lastClickRef.current = null

      // Proceed to next
      setTimeout(() => {
        if (!isLastQuestion) {
          setShowFeedback(false)
          setCurrentIndex(prev => prev + 1)
        } else {
          handleFinish()
        }
      }, 100)
      return
    }

    // Single click: select and show feedback
    lastClickRef.current = { value, time: now }

    if (showFeedback && selectedValue === value) return

    setAnswers(prev => ({ ...prev, [currentQuestion!.id]: value }))
    setShowFeedback(true)
  }

  const handleNext = () => {
    setShowFeedback(false)
    if (!isLastQuestion) {
      setCurrentIndex(prev => prev + 1)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    if (currentIndex === 0) {
      router.push(`/review/${conversationId}`)
    } else {
      setShowFeedback(false)
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleFinish = async () => {
    setIsSaving(true)

    // 先跳转到报告页面，不等待保存完成
    router.push(`/report/${conversationId}`)

    // 后台保存答案（fire and forget）
    fetch(`/api/conversation/${conversationId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    }).catch(err => {
      console.error('Save answers failed:', err)
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14 bg-gray-50">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14 bg-gray-50">
        <div className="text-center px-4">
          <p className="text-gray-500 mb-2 text-sm">{t('questions.generating')}</p>
          <p className="text-xs text-gray-400">{t('questions.refreshHint')}</p>
        </div>
      </div>
    )
  }

  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-14 sm:pt-16">
      {/* Progress bar */}
      <div className="fixed top-12 sm:top-14 left-0 right-0 h-1 bg-gray-200 z-40">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col p-4 sm:p-6">
        <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
          {/* Question number */}
          <div className="text-xs text-gray-400 mb-2 sm:mb-4">
            {currentIndex + 1} / {questions.length}
          </div>

          {/* Question Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 flex-1 flex flex-col">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-2 leading-relaxed">
                {currentQuestion.question}
              </h2>
              {currentQuestion.insight && (
                <p className="text-xs sm:text-sm text-gray-500 bg-gray-50 p-2 sm:p-3 rounded-md border border-gray-100 leading-relaxed">
                  {currentQuestion.insight}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2 sm:space-y-3 flex-1">
              {currentQuestion.options?.map((option) => {
                const isSelected = selectedValue === option.value
                const isOtherSelected = selectedValue && selectedValue !== option.value

                return (
                  <button
                    key={option.value}
                    onClick={() => handleOptionClick(option.value)}
                    className={cn(
                      'w-full text-left px-3 sm:px-4 py-3 sm:py-3.5 rounded-md text-sm transition-all',
                      'border',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-gray-50',
                      showFeedback && isOtherSelected && 'opacity-40'
                    )}
                  >
                    <span className="leading-relaxed">{option.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Feedback */}
            {showFeedback && selectedOption?.feedback && (
              <div className={cn(
                "mt-4 rounded-md p-3 border text-sm",
                selectedOption.feedback.type === 'warning'
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : selectedOption.feedback.type === 'positive'
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-blue-50 border-blue-200 text-blue-800"
              )}>
                <p className="leading-relaxed">{selectedOption.feedback.message}</p>
              </div>
            )}

            {/* Double-click hint */}
            {showFeedback && (
              <p className="text-xs text-gray-400 mt-3 text-center">
                {t('questions.doubleClickHint')}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between mt-4 sm:mt-6 gap-4">
            <button
              onClick={handleBack}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors py-2"
            >
              {t('questions.prevStep')}
            </button>

            <button
              onClick={handleNext}
              disabled={!selectedValue || isSaving}
              className={cn(
                'px-5 sm:px-6 py-2 sm:py-2.5 rounded-md text-sm font-medium transition-colors',
                'bg-indigo-600 text-white hover:bg-indigo-700',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'flex items-center gap-2'
              )}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                isLastQuestion ? t('questions.generateReport') : t('questions.nextQuestion')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
