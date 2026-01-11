/**
 * WizardContainer Component
 * Main container managing the 2-step wizard flow
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { StepIndicator } from './StepIndicator'
import { CategoryCard } from './CategoryCard'
import { OptionButton } from './OptionButton'
import { Button } from '@/components/ui/Button'

// Project type options
const PROJECT_TYPES = [
  { id: 'app', icon: '📱', title: 'App', description: '移动应用' },
  { id: 'web', icon: '🌐', title: '网站', description: 'Web 应用' },
  { id: 'tool', icon: '🔧', title: '工具', description: '小工具/插件' },
  { id: 'ai', icon: '🤖', title: 'AI 产品', description: 'AI 相关应用' },
  { id: 'other', icon: '💬', title: '其他', description: '用语音告诉我' },
]

// Time budget options
const TIME_OPTIONS = [
  { id: 'weekend', icon: '🚀', label: '这周末' },
  { id: 'month', icon: '📅', label: '一个月' },
  { id: 'flexible', icon: '🐢', label: '慢慢做' },
]

// Target audience options
const AUDIENCE_OPTIONS = [
  { id: 'self', icon: '👤', label: '自己用' },
  { id: 'friends', icon: '👥', label: '朋友用' },
  { id: 'public', icon: '🌍', label: '公开发布' },
]

export interface WizardData {
  projectType: string
  projectName: string
  timeBudget: string
  audience: string
}

interface WizardContainerProps {
  onComplete: (data: WizardData) => void
}

export function WizardContainer({ onComplete }: WizardContainerProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardData>({
    projectType: '',
    projectName: '',
    timeBudget: '',
    audience: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleProjectTypeSelect = (id: string) => {
    setData((prev) => ({ ...prev, projectType: id }))
    // Auto advance to next step
    setTimeout(() => setStep(1), 300)
  }

  const handleTimeSelect = (id: string) => {
    setData((prev) => ({ ...prev, timeBudget: id }))
  }

  const handleAudienceSelect = (id: string) => {
    setData((prev) => ({ ...prev, audience: id }))
  }

  const handleBack = () => {
    setStep(0)
  }

  const handleStart = async () => {
    if (!data.projectType || !data.timeBudget || !data.audience) {
      return
    }
    setIsLoading(true)
    onComplete(data)
  }

  const canProceed = data.timeBudget && data.audience

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white">
      {/* Logo */}
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
          style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}
        >
          <span className="text-white">🚀</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Vibe Checker</h1>
      </div>

      {/* Wizard Content */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Project Type */}
              <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
                你想做什么？
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {PROJECT_TYPES.map((type) => (
                  <CategoryCard
                    key={type.id}
                    id={type.id}
                    icon={type.icon}
                    title={type.title}
                    description={type.description}
                    selected={data.projectType === type.id}
                    onClick={handleProjectTypeSelect}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Step 2: Details */}
              <div className="bg-white rounded-2xl p-6 shadow-md">
                {/* Project Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    项目名称 (可选)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={data.projectName}
                      onChange={(e) =>
                        setData((prev) => ({ ...prev, projectName: e.target.value }))
                      }
                      placeholder="给你的项目起个名字"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
                      title="语音输入"
                    >
                      🎤
                    </button>
                  </div>
                </div>

                {/* Time Budget */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    你有多少时间？
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {TIME_OPTIONS.map((option) => (
                      <OptionButton
                        key={option.id}
                        id={option.id}
                        icon={option.icon}
                        label={option.label}
                        selected={data.timeBudget === option.id}
                        onClick={handleTimeSelect}
                      />
                    ))}
                  </div>
                </div>

                {/* Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    做给谁用？
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {AUDIENCE_OPTIONS.map((option) => (
                      <OptionButton
                        key={option.id}
                        id={option.id}
                        icon={option.icon}
                        label={option.label}
                        selected={data.audience === option.id}
                        onClick={handleAudienceSelect}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  ← 上一步
                </button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStart}
                  disabled={!canProceed}
                  loading={isLoading}
                >
                  开始对话 →
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step Indicator */}
      <div className="mt-8">
        <StepIndicator currentStep={step} totalSteps={2} />
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-gray-400 text-center max-w-md">
        先别急着写代码，咱们聊聊你的想法 😊
      </p>
    </div>
  )
}
