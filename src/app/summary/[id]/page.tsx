'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StepCard } from '@/components/wizard'
import { cn } from '@/lib/utils'

interface SummaryData {
  projectName: string
  coreFeature: string
  strengths: string[]
  risks: string[]
  userProfile: string
}

export default function SummaryPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<SummaryData | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`/api/conversation/${conversationId}`)
        if (!response.ok) throw new Error('加载失败')
        const conv = await response.json()
        const schema = conv.schema
        
        // Simple logic to determine strengths/risks based on answers
        // In a real app, this could be done by AI
        const strengths = [
          '你自己就是目标用户，同理心强', // Hardcoded for vibe check
          schema.user.experience_level === 'veteran' ? '你有相关开发经验' : '选择简单的技术栈起步是正确的',
          schema.mvp.type === 'content_tool' ? '内容类产品启动最快' : '工具类产品需求明确'
        ]
        
        const risks = [
          schema.preference.timeline === '7d' ? '这种极速开发需要砍掉90%的功能' : '注意开发周期可能比预想长',
          '还没有明确的推广计划'
        ]

        setData({
          projectName: schema.idea.one_liner,
          coreFeature: schema.mvp.first_job,
          strengths,
          risks,
          userProfile: schema.user.experience_level
        })
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [conversationId])

  const handleCreateReport = () => {
    router.push(`/report/${conversationId}`)
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white">
      <StepCard maxWidth="xl">
        <div className="space-y-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              评估完成，总结一下
            </h2>
            <p className="text-gray-500">
              在生成最终报告前，我们发现了这些关键点
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-5 rounded-xl bg-green-50 border border-green-100">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <span>✅</span> 你的优势
              </h3>
              <ul className="space-y-2">
                {data.strengths.map((s, i) => (
                  <li key={i} className="text-green-800 text-sm leading-relaxed flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"/>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-100">
              <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <span>⚠️</span> 需要注意
              </h3>
              <ul className="space-y-2">
                {data.risks.map((s, i) => (
                  <li key={i} className="text-amber-800 text-sm leading-relaxed flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"/>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-primary-50 rounded-xl p-4 text-center">
            <p className="text-primary-900 font-medium mb-1">
              💡 这些我都记下了
            </p>
            <p className="text-primary-700 text-sm">
              报告里会针对性地给你【最快上手路径】建议
            </p>
          </div>

          <button
            onClick={handleCreateReport}
            className={cn(
              "w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg shadow-primary-500/20",
              "bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700",
              "transform transition-all active:scale-[0.98] duration-200"
            )}
          >
            生成完整报告 ✨
          </button>
        </div>
      </StepCard>
    </div>
  )
}
