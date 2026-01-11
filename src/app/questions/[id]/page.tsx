'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StepCard, WizardProgress, ActionButtons } from '@/components/wizard'
import { VoiceButton } from '@/components/chat/VoiceButton'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  text: string
  options?: { label: string; value: string }[]
  allowCustom?: boolean
}

// 感受型问题 - 针对 Vibe Coder 设计
const QUESTIONS: Question[] = [
  {
    id: 'timeline',
    text: '你更希望这个项目是？',
    options: [
      { label: '一两天随便试试', value: '7d' },
      { label: '一两周认真做个 MVP', value: '14d' },
      { label: '如果顺了，可以长期做', value: '30d' },
      { label: '现在还没想清楚', value: 'flexible' },
    ],
  },
  {
    id: 'tech_comfort',
    text: '你现在更像哪种状态？',
    options: [
      { label: '会写代码，但不想折腾复杂架构', value: 'code_simple' },
      { label: '技术一般，主要靠 AI + 拼起来', value: 'ai_build' },
      { label: '技术不错，但不想一开始就重', value: 'code_good' },
      { label: '不太确定', value: 'unsure' },
    ],
  },
  {
    id: 'budget_feeling',
    text: '你对「花钱」这件事的感觉更接近？',
    options: [
      { label: '能不花钱最好', value: 'free' },
      { label: '每月几十块可以接受', value: 'little' },
      { label: '如果有希望，几百块也行', value: 'invest' },
      { label: '现在还不想考虑', value: 'later' },
    ],
  },
  {
    id: 'commercialization',
    text: '你现在做这个项目，更像是？',
    options: [
      { label: '自己用 + 顺便看看有没有人愿意付费', value: 'self_maybe' },
      { label: '明确想做一个能赚钱的产品', value: 'business' },
      { label: '先做出来再说', value: 'first' },
      { label: '还没想清楚', value: 'unsure' },
    ],
  },
  {
    id: 'market_feeling',
    text: '你现在对市场的感觉更像是？',
    options: [
      { label: '我感觉可能已经有人做过', value: 'exists' },
      { label: '我没见过类似的，但也不确定', value: 'unseen' },
      { label: '我完全没查过', value: 'uncheck' },
      { label: '不重要，先做再说', value: 'doesnt_matter' },
    ],
  },
]

export default function QuestionsPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [customInput, setCustomInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const currentQuestion = QUESTIONS[currentIndex]
  const isLastQuestion = currentIndex === QUESTIONS.length - 1

  const handleOptionClick = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))
    setCustomInput('')
    
    // Auto-advance after selection
    if (!isLastQuestion) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300)
    }
  }

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: customInput.trim() }))
      setCustomInput('')
      
      if (!isLastQuestion) {
        setCurrentIndex(prev => prev + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentIndex === 0) {
      router.push(`/review/${conversationId}`)
    } else {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    if (!isLastQuestion) {
      setCurrentIndex(prev => prev + 1)
    } else {
      handleFinish()
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
      
      // Navigate to report page (Step 4)
      router.push(`/report/${conversationId}`)
    } catch (err) {
      console.error('Save failed:', err)
      setIsSaving(false)
    }
  }

  const selectedValue = answers[currentQuestion.id]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <WizardProgress
          currentStep={currentIndex + 1}
          totalSteps={QUESTIONS.length}
          className="mb-8"
        />

        {/* Question Card */}
        <StepCard maxWidth="xl">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Options Grid */}
          {currentQuestion.options && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={cn(
                    'px-4 py-4 rounded-xl text-sm font-medium',
                    'border-2 transition-all duration-200',
                    selectedValue === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50/50'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {/* Custom Input */}
          {currentQuestion.allowCustom && (
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                placeholder="或者自己说..."
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl text-base',
                  'bg-gray-50 border-2 border-transparent',
                  'focus:border-primary-500 focus:bg-white focus:outline-none',
                  'transition-all duration-200'
                )}
              />
              <VoiceButton
                onTranscript={(text) => setCustomInput(prev => prev + text)}
                className="flex-shrink-0"
              />
              {customInput.trim() && (
                <button
                  onClick={handleCustomSubmit}
                  className="px-4 py-2.5 text-sm bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                >
                  确定
                </button>
              )}
            </div>
          )}

          <ActionButtons
            onBack={handleBack}
            onNext={isLastQuestion ? handleFinish : undefined}
            onSkip={handleSkip}
            showSkip={true}
            nextLabel={isLastQuestion ? '生成报告 →' : undefined}
            nextLoading={isSaving}
            skipLabel={isLastQuestion ? '跳过并生成' : '跳过'}
          />
        </StepCard>
      </div>
    </div>
  )
}
