'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StepCard, WizardProgress, ActionButtons } from '@/components/wizard'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'
import type { Question, QuestionOption } from '@/lib/types'

export default function QuestionsPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string
  const { t, lang } = useTranslation()

  const [isLoading, setIsLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

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
          // Check if we need to generate them or show a loading state
          // Ideally this page shouldn't be loaded until questions are ready
          // For now, let's assume they might be missing and handle gracefully
          console.warn('No generated questions found')
        }
      } catch (err) {
        console.error('Load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [conversationId])

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const selectedValue = currentQuestion ? answers[currentQuestion.id] : undefined
  
  // Find selected option object to get feedback
  const selectedOption = currentQuestion?.options?.find(opt => opt.value === selectedValue)

  const handleOptionClick = (value: string) => {
    if (showFeedback) return // Prevent changing answer while showing feedback (optional design choice)
    
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
    try {
      // Save answers to schema
      await fetch(`/api/conversation/${conversationId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      
      // Navigate directly to Report (skip summary)
      router.push(`/report/${conversationId}`)
    } catch (err) {
      console.error('Save failed:', err)
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{t('questions.generating')}</p>
          <p className="text-sm text-gray-400">{t('questions.refreshHint')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <WizardProgress
          currentStep={currentIndex + 1}
          totalSteps={questions.length}
          className="mb-8"
        />

        {/* Question Card */}
        <StepCard maxWidth="xl">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {currentQuestion.question}
              </h2>
              {currentQuestion.insight && (
                <div className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-lg">💡</span>
                  <p className="leading-relaxed">{currentQuestion.insight}</p>
                </div>
              )}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options?.map((option) => {
                const isSelected = selectedValue === option.value
                const isOtherSelected = selectedValue && selectedValue !== option.value
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleOptionClick(option.value)}
                    disabled={showFeedback}
                    className={cn(
                      'text-left px-5 py-4 rounded-xl text-base transition-all duration-200 relative overflow-hidden',
                      'border-2',
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm'
                        : 'border-gray-100 bg-white text-gray-700 hover:border-primary-200 hover:bg-gray-50',
                      showFeedback && isOtherSelected && 'opacity-40 grayscale'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {isSelected && (
                        <span className="text-primary-600">
                          {showFeedback ? ' ' : '✓'}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Immediate Feedback Card - V2.0 Core Feature */}
            {showFeedback && selectedOption?.feedback && (
              <div className={cn(
                "rounded-xl p-4 border animate-in fade-in slide-in-from-top-2 duration-300",
                selectedOption.feedback.type === 'warning' 
                  ? "bg-amber-50 border-amber-200 text-amber-900" 
                  : selectedOption.feedback.type === 'positive'
                    ? "bg-green-50 border-green-200 text-green-900"
                    : "bg-blue-50 border-blue-200 text-blue-900"
              )}>
                <div className="flex items-start gap-3">
                  <span className="text-xl">
                    {selectedOption.feedback.type === 'warning' ? '⚠️' : selectedOption.feedback.type === 'positive' ? '👍' : '💬'}
                  </span>
                  <div>
                    <p className="font-medium text-sm leading-relaxed">
                      {selectedOption.feedback.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <ActionButtons
              onBack={handleBack}
              onNext={handleNext}
              backLabel={t('questions.prevStep')}
              nextLabel={isLastQuestion ? t('questions.generateReport') : t('questions.nextQuestion')}
              nextDisabled={!selectedValue || !showFeedback} // Force user to see feedback
              nextLoading={isSaving}
            />
          </div>
        </StepCard>
      </div>
    </div>
  )
}
