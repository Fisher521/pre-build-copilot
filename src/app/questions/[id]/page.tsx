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

// Question bank for the wizard
const QUESTIONS: Question[] = [
  {
    id: 'time_investment',
    text: '你打算花多少时间在这个项目上？',
    options: [
      { label: '1周内', value: '<1week' },
      { label: '1个月', value: '1month' },
      { label: '3个月', value: '3months' },
      { label: '长期投入', value: 'long-term' },
    ],
    allowCustom: true,
  },
  {
    id: 'tech_stack',
    text: '你熟悉哪些技术？',
    options: [
      { label: '前端(React/Vue)', value: 'frontend' },
      { label: '后端(Node/Python)', value: 'backend' },
      { label: '移动端(iOS/Android)', value: 'mobile' },
      { label: '都不太熟', value: 'none' },
    ],
    allowCustom: true,
  },
  {
    id: 'budget',
    text: '愿意投入多少预算？',
    options: [
      { label: '零成本', value: 'free' },
      { label: '几百块', value: '<500' },
      { label: '几千块', value: '<5000' },
      { label: '不差钱', value: 'unlimited' },
    ],
  },
  {
    id: 'monetization',
    text: '计划怎么赚钱？',
    options: [
      { label: '广告', value: 'ads' },
      { label: '订阅付费', value: 'subscription' },
      { label: '一次性购买', value: 'one-time' },
      { label: '暂不考虑', value: 'none' },
    ],
    allowCustom: true,
  },
  {
    id: 'competition',
    text: '知道有类似的产品吗？',
    options: [
      { label: '有很多', value: 'many' },
      { label: '有几个', value: 'some' },
      { label: '好像没有', value: 'none' },
      { label: '不太清楚', value: 'unknown' },
    ],
    allowCustom: true,
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
