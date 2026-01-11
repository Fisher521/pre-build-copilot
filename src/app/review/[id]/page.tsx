'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StepCard, ActionButtons } from '@/components/wizard'
import { cn } from '@/lib/utils'

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
        if (!response.ok) throw new Error('加载失败')
        
        const data = await response.json()
        const schema = data.schema
        
        // Extract info from schema (matching EvaluationSchema structure)
        setParsedInfo({
          projectName: schema?.idea?.one_liner || '未命名项目',
          coreFeature: schema?.mvp?.first_job || '',
          targetUser: schema?.user?.primary_user || '',
          problemSolved: schema?.problem?.scenario || '',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setIsLoading(false)
      }
    }

    loadConversation()
  }, [conversationId])

  const handleFieldChange = (field: keyof ParsedInfo, value: string) => {
    setParsedInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleConfirm = async () => {
    setIsSaving(true)
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
      
      // Navigate to questions page (Step 3)
      router.push(`/questions/${conversationId}`)
    } catch (err) {
      setError('保存失败，请重试')
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">正在分析你的想法...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white">
      <StepCard 
        title="✨ 我理解了你的想法"
        subtitle="请确认以下信息，可以直接修改"
        maxWidth="xl"
      >
        <div className="space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📌 项目名称
            </label>
            <input
              type="text"
              value={parsedInfo.projectName}
              onChange={(e) => handleFieldChange('projectName', e.target.value)}
              className={cn(
                'w-full px-4 py-3 rounded-xl text-base',
                'bg-gray-50 border-2 border-transparent',
                'focus:border-primary-500 focus:bg-white focus:outline-none',
                'transition-all duration-200'
              )}
              placeholder="给你的项目起个名字"
            />
          </div>

          {/* Core Feature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎯 核心功能
            </label>
            <textarea
              value={parsedInfo.coreFeature}
              onChange={(e) => handleFieldChange('coreFeature', e.target.value)}
              rows={2}
              className={cn(
                'w-full px-4 py-3 rounded-xl text-base resize-none',
                'bg-gray-50 border-2 border-transparent',
                'focus:border-primary-500 focus:bg-white focus:outline-none',
                'transition-all duration-200'
              )}
              placeholder="这个产品最核心要做什么"
            />
          </div>

          {/* Target User */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👥 目标用户
            </label>
            <input
              type="text"
              value={parsedInfo.targetUser}
              onChange={(e) => handleFieldChange('targetUser', e.target.value)}
              className={cn(
                'w-full px-4 py-3 rounded-xl text-base',
                'bg-gray-50 border-2 border-transparent',
                'focus:border-primary-500 focus:bg-white focus:outline-none',
                'transition-all duration-200'
              )}
              placeholder="谁会用这个产品"
            />
          </div>

          {/* Problem Solved */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💡 解决什么问题
            </label>
            <textarea
              value={parsedInfo.problemSolved}
              onChange={(e) => handleFieldChange('problemSolved', e.target.value)}
              rows={2}
              className={cn(
                'w-full px-4 py-3 rounded-xl text-base resize-none',
                'bg-gray-50 border-2 border-transparent',
                'focus:border-primary-500 focus:bg-white focus:outline-none',
                'transition-all duration-200'
              )}
              placeholder="用户现在遇到什么痛点"
            />
          </div>
        </div>

        <ActionButtons
          onBack={handleBack}
          onNext={handleConfirm}
          backLabel="← 重新描述"
          nextLabel="确认继续 →"
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
