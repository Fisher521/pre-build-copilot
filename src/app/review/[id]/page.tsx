'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
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
  const { t, lang } = useTranslation()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedInfo, setParsedInfo] = useState<ParsedInfo>({
    projectName: '',
    coreFeature: '',
    targetUser: '',
    problemSolved: '',
  })

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

  const handleConfirm = async () => {
    setIsSaving(true)

    try {
      // Save updated info (fast operation, no need for loading animation)
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

      // Navigate immediately to questions page (Step 3)
      router.push(`/questions/${conversationId}`)
    } catch (err) {
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
      <div className="min-h-screen flex items-center justify-center pt-14 sm:pt-16 bg-gray-50">
        <div className="text-center w-full max-w-md mx-auto p-4 sm:p-6">
          {/* 骨架卡片 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="space-y-4">
              {/* 骨架标题 */}
              <div className="h-6 bg-gray-100 rounded w-3/4 mx-auto animate-pulse" />
              <div className="h-4 bg-gray-50 rounded w-1/2 mx-auto animate-pulse" />

              {/* 骨架输入框 */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                  <div className="h-12 bg-gray-50 rounded-md animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* 加载提示 */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">{t('review.analyzing')}</p>
          </div>
        </div>
      </div>
    )
  }

  // 保存/跳转加载状态 - 简化版，只显示简短的加载提示
  if (isSaving) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14 sm:pt-16 bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">{lang === 'zh' ? '正在保存...' : 'Saving...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col pt-14 sm:pt-16 bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
              {t('review.title')}
            </h1>
            <p className="text-sm text-gray-500">{t('review.subtitle')}</p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-5">
              {/* Project Name */}
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-900 mb-1.5">
                  {t('review.projectName')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="projectName"
                    name="projectName"
                    type="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    readOnly={false}
                    value={parsedInfo.projectName}
                    onChange={(e) => setParsedInfo(prev => ({ ...prev, projectName: e.target.value }))}
                    className="flex-1 px-3 py-2.5 rounded-md text-sm bg-white border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors cursor-text"
                    placeholder={t('review.projectNamePlaceholder')}
                  />
                  <VoiceButton
                    onTranscript={(text) => setParsedInfo(prev => ({ ...prev, projectName: prev.projectName + text }))}
                    className="flex-shrink-0"
                  />
                </div>
              </div>

              {/* Core Feature */}
              <div>
                <label htmlFor="coreFeature" className="block text-sm font-medium text-gray-900 mb-1.5">
                  {t('review.coreFeature')}
                </label>
                <div className="flex items-start gap-2">
                  <textarea
                    id="coreFeature"
                    name="coreFeature"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    readOnly={false}
                    value={parsedInfo.coreFeature}
                    onChange={(e) => setParsedInfo(prev => ({ ...prev, coreFeature: e.target.value }))}
                    rows={2}
                    className="flex-1 px-3 py-2.5 rounded-md text-sm resize-none bg-white border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors cursor-text"
                    placeholder={t('review.coreFeaturePlaceholder')}
                  />
                  <VoiceButton
                    onTranscript={(text) => setParsedInfo(prev => ({ ...prev, coreFeature: prev.coreFeature + text }))}
                    className="flex-shrink-0 mt-1"
                  />
                </div>
              </div>

              {/* Target User */}
              <div>
                <label htmlFor="targetUser" className="block text-sm font-medium text-gray-900 mb-1.5">
                  {t('review.targetUser')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="targetUser"
                    name="targetUser"
                    type="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    readOnly={false}
                    value={parsedInfo.targetUser}
                    onChange={(e) => setParsedInfo(prev => ({ ...prev, targetUser: e.target.value }))}
                    className="flex-1 px-3 py-2.5 rounded-md text-sm bg-white border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors cursor-text"
                    placeholder={t('review.targetUserPlaceholder')}
                  />
                  <VoiceButton
                    onTranscript={(text) => setParsedInfo(prev => ({ ...prev, targetUser: prev.targetUser + text }))}
                    className="flex-shrink-0"
                  />
                </div>
              </div>

              {/* Problem Solved */}
              <div>
                <label htmlFor="problemSolved" className="block text-sm font-medium text-gray-900 mb-1.5">
                  {t('review.problemSolved')}
                </label>
                <div className="flex items-start gap-2">
                  <textarea
                    id="problemSolved"
                    name="problemSolved"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    readOnly={false}
                    value={parsedInfo.problemSolved}
                    onChange={(e) => setParsedInfo(prev => ({ ...prev, problemSolved: e.target.value }))}
                    rows={2}
                    className="flex-1 px-3 py-2.5 rounded-md text-sm resize-none bg-white border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors cursor-text"
                    placeholder={t('review.problemSolvedPlaceholder')}
                  />
                  <VoiceButton
                    onTranscript={(text) => setParsedInfo(prev => ({ ...prev, problemSolved: prev.problemSolved + text }))}
                    className="flex-shrink-0 mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between mt-6 gap-4">
              <button
                onClick={handleBack}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors py-2"
              >
                {t('review.backLabel')}
              </button>

              <button
                onClick={handleConfirm}
                disabled={!parsedInfo.projectName.trim() || isSaving}
                className={cn(
                  'px-5 sm:px-6 py-2 sm:py-2.5 rounded-md text-sm font-medium transition-colors',
                  'bg-indigo-600 text-white hover:bg-indigo-700',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  'flex items-center gap-2 whitespace-nowrap'
                )}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  t('review.nextLabel')
                )}
              </button>
            </div>
          </div>
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
