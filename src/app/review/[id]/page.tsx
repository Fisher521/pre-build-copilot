'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { StepCard, ActionButtons } from '@/components/wizard'
import { VoiceButton } from '@/components/chat/VoiceButton'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface ParsedInfo {
  projectName: string
  coreFeature: string
  targetUser: string
  problemSolved: string
}

export default function ReviewPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string
  const { t, lang, translations } = useTranslation()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savingStep, setSavingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [parsedInfo, setParsedInfo] = useState<ParsedInfo>({
    projectName: '',
    coreFeature: '',
    targetUser: '',
    problemSolved: '',
  })
  const savingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 确认后的加载步骤
  const savingSteps = translations.review.savingSteps

  // Load conversation data
  useEffect(() => {
    async function loadConversation() {
      try {
        const response = await fetch(`/api/conversation/${conversationId}`)
        if (!response.ok) throw new Error(t('review.loadFailed'))

        const data = await response.json()
        const schema = data.schema

        // Extract info from schema (matching EvaluationSchema structure)
        setParsedInfo({
          projectName: schema?.idea?.one_liner || (lang === 'zh' ? '未命名项目' : 'Untitled Project'),
          coreFeature: schema?.mvp?.first_job || '',
          targetUser: schema?.user?.primary_user || '',
          problemSolved: schema?.problem?.scenario || '',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : t('review.loadFailed'))
      } finally {
        setIsLoading(false)
      }
    }

    loadConversation()
  }, [conversationId, t, lang])

  // 清理动画
  useEffect(() => {
    return () => {
      if (savingIntervalRef.current) {
        clearInterval(savingIntervalRef.current)
      }
    }
  }, [])

  const handleFieldChange = (field: keyof ParsedInfo, value: string) => {
    setParsedInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleConfirm = async () => {
    setIsSaving(true)
    setSavingStep(0)

    // 启动加载动画
    savingIntervalRef.current = setInterval(() => {
      setSavingStep(prev => Math.min(prev + 1, savingSteps.length - 1))
    }, 2000)

    try {
      // Save updated info
      await fetch(`/api/conversation/${conversationId}/schema`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: {
            one_liner: parsedInfo.projectName,
          },
          mvp: {
            first_job: parsedInfo.coreFeature,
          },
          user: {
            primary_user: parsedInfo.targetUser,
          },
          problem: {
            scenario: parsedInfo.problemSolved,
          },
        }),
      })

      // 清理动画
      if (savingIntervalRef.current) {
        clearInterval(savingIntervalRef.current)
      }

      // Navigate to questions page (Step 3)
      router.push(`/questions/${conversationId}`)
    } catch (err) {
      if (savingIntervalRef.current) {
        clearInterval(savingIntervalRef.current)
      }
      setError(t('review.saveFailed'))
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  // 初始加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-md mx-auto p-6">
          {/* 骨架卡片 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="space-y-4">
              {/* 骨架标题 */}
              <div className="h-6 bg-gray-100 rounded-lg w-3/4 mx-auto animate-pulse" />
              <div className="h-4 bg-gray-50 rounded w-1/2 mx-auto animate-pulse" />

              {/* 骨架输入框 */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                  <div className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* 加载提示 */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">{t('review.analyzing')}</p>
          </div>
        </div>
      </div>
    )
  }

  // 保存/跳转加载状态
  if (isSaving) {
    const currentStep = savingSteps[savingStep]
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-md mx-auto p-6">
          {/* 动画图标 */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin" />
            <div className="absolute inset-2 rounded-full bg-white shadow-lg flex items-center justify-center">
              <span className="text-2xl">{currentStep.icon}</span>
            </div>
          </div>

          {/* 当前步骤 */}
          <p className="text-lg font-medium text-gray-700 mb-4">{currentStep.text[lang]}</p>

          {/* 步骤指示器 */}
          <div className="flex justify-center gap-3 mb-6">
            {savingSteps.map((step, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all',
                  idx < savingStep
                    ? 'bg-green-100 text-green-700'
                    : idx === savingStep
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                {idx < savingStep ? (
                  <span>✓</span>
                ) : idx === savingStep ? (
                  <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="w-3 h-3 rounded-full bg-gray-300" />
                )}
                <span className="hidden sm:inline">{step.text[lang].replace('...', '')}</span>
              </div>
            ))}
          </div>

          {/* 项目信息回显 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left">
            <p className="text-sm text-gray-400 mb-2">{t('review.projectInfo')}</p>
            <p className="text-gray-700 font-medium">{parsedInfo.projectName}</p>
            {parsedInfo.coreFeature && (
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">{parsedInfo.coreFeature}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white">
      <StepCard
        title={`✨ ${t('review.title')}`}
        subtitle={t('review.subtitle')}
        maxWidth="xl"
      >
        <div className="space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📌 {t('review.projectName')}
            </label>
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={parsedInfo.projectName}
                onChange={(e) => handleFieldChange('projectName', e.target.value)}
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl text-base',
                  'bg-gray-50 border-2 border-transparent',
                  'focus:border-primary-500 focus:bg-white focus:outline-none',
                  'transition-all duration-200'
                )}
                placeholder={t('review.projectNamePlaceholder')}
              />
              <VoiceButton
                onTranscript={(text) => handleFieldChange('projectName', parsedInfo.projectName + text)}
                className="flex-shrink-0"
              />
            </div>
          </div>

          {/* Core Feature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎯 {t('review.coreFeature')}
            </label>
            <div className="relative flex items-start gap-2">
              <textarea
                value={parsedInfo.coreFeature}
                onChange={(e) => handleFieldChange('coreFeature', e.target.value)}
                rows={2}
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl text-base resize-none',
                  'bg-gray-50 border-2 border-transparent',
                  'focus:border-primary-500 focus:bg-white focus:outline-none',
                  'transition-all duration-200'
                )}
                placeholder={t('review.coreFeaturePlaceholder')}
              />
              <VoiceButton
                onTranscript={(text) => handleFieldChange('coreFeature', parsedInfo.coreFeature + text)}
                className="flex-shrink-0 mt-2"
              />
            </div>
          </div>

          {/* Target User */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👥 {t('review.targetUser')}
            </label>
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={parsedInfo.targetUser}
                onChange={(e) => handleFieldChange('targetUser', e.target.value)}
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl text-base',
                  'bg-gray-50 border-2 border-transparent',
                  'focus:border-primary-500 focus:bg-white focus:outline-none',
                  'transition-all duration-200'
                )}
                placeholder={t('review.targetUserPlaceholder')}
              />
              <VoiceButton
                onTranscript={(text) => handleFieldChange('targetUser', parsedInfo.targetUser + text)}
                className="flex-shrink-0"
              />
            </div>
          </div>

          {/* Problem Solved */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💡 {t('review.problemSolved')}
            </label>
            <div className="relative flex items-start gap-2">
              <textarea
                value={parsedInfo.problemSolved}
                onChange={(e) => handleFieldChange('problemSolved', e.target.value)}
                rows={2}
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl text-base resize-none',
                  'bg-gray-50 border-2 border-transparent',
                  'focus:border-primary-500 focus:bg-white focus:outline-none',
                  'transition-all duration-200'
                )}
                placeholder={t('review.problemSolvedPlaceholder')}
              />
              <VoiceButton
                onTranscript={(text) => handleFieldChange('problemSolved', parsedInfo.problemSolved + text)}
                className="flex-shrink-0 mt-2"
              />
            </div>
          </div>
        </div>

        <ActionButtons
          onBack={handleBack}
          onNext={handleConfirm}
          backLabel={t('review.backLabel')}
          nextLabel={t('review.nextLabel')}
          nextLoading={isSaving}
          nextDisabled={!parsedInfo.projectName.trim()}
        />
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
