/**
 * Report Page V2.2 - Enhanced with China market focus
 * 使用新组件的报告页面
 */
'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import type { VibeReport } from '@/lib/types'
import {
  ScoreCard,
  MarketAnalysisCard,
  DevelopmentPathCard,
  ValidationMethodsCard,
  TermTranslationTable,
  DissuasionView
} from '@/components/report'

// 加载步骤配置
const LOADING_STEPS = [
  { id: 'analyze', label: '分析项目信息', duration: 3000 },
  { id: 'market', label: '搜索市场竞品', duration: 5000 },
  { id: 'approach', label: '设计产品方案', duration: 4000 },
  { id: 'tech', label: '匹配技术栈', duration: 3000 },
  { id: 'path', label: '规划实施路径', duration: 3000 },
  { id: 'report', label: '生成完整报告', duration: 2000 },
]

// 进度加载组件（保持原有逻辑）
function LoadingProgress({ currentStep, progress, estimatedTime }: {
  currentStep: number
  progress: number
  estimatedTime: number
}) {
  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">正在生成评估报告</h1>
          <p className="text-gray-500">预计需要 {Math.max(0, estimatedTime)} 秒</p>
        </div>
        {/* 进度条等UI保持不变... */}
      </div>
    </div>
  )
}

export default function ReportPageV2() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [report, setReport] = useState<VibeReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  // 加载报告
  useEffect(() => {
    async function generateReport() {
      try {
        const response = await fetch(`/api/conversation/${conversationId}/report`, {
          method: 'POST',
        })

        if (!response.ok) throw new Error('生成报告失败')

        const data = await response.json()
        setProgress(100)
        setCurrentStep(LOADING_STEPS.length)

        setTimeout(() => {
          setReport(data.report)
          setIsLoading(false)
        }, 500)

      } catch (err) {
        setError(err instanceof Error ? err.message : '生成失败')
        setIsLoading(false)
      }
    }

    generateReport()
  }, [conversationId])

  // 模拟进度
  useEffect(() => {
    if (!isLoading) return

    const totalDuration = LOADING_STEPS.reduce((sum, s) => sum + s.duration, 0)
    let elapsed = 0

    const interval = setInterval(() => {
      elapsed += 200
      let cumulative = 0
      for (let i = 0; i < LOADING_STEPS.length; i++) {
        cumulative += LOADING_STEPS[i].duration
        if (elapsed < cumulative) {
          setCurrentStep(i)
          break
        }
      }
      const rawProgress = (elapsed / totalDuration) * 100
      setProgress(Math.min(rawProgress, 95))
    }, 200)

    return () => clearInterval(interval)
  }, [isLoading])

  // 显示加载
  if (isLoading) {
    const estimatedSeconds = Math.ceil(LOADING_STEPS.reduce((sum, s) => sum + s.duration, 0) / 1000)
    return <LoadingProgress currentStep={currentStep} progress={progress} estimatedTime={estimatedSeconds} />
  }

  // 显示错误
  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-md mx-auto text-center py-8 px-6">
          <div className="text-4xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">生成失败</h2>
          <p className="text-gray-500 mb-6">{error || '请稍后重试'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
          >
            重新开始
          </button>
        </div>
      </div>
    )
  }

  // 显示劝退页面
  if (report.dissuasion && report.dissuasion.should_dissuade) {
    return <DissuasionView dissuasion={report.dissuasion} score={report.score.feasibility} />
  }

  // 显示正常报告
  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">项目评估报告</h1>
          <p className="text-gray-500 mt-2">Vibe Checker V2.2 - 中国市场版</p>
        </div>

        {/* 评分卡片 */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ScoreCard
            score={report.score}
            conclusion={report.one_liner_conclusion}
          />
        </div>

        {/* 为什么值得做 / 需要注意的风险 */}
        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>💪</span> 为什么值得做
            </h3>
            <ul className="space-y-3">
              {report.why_worth_it.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚠️</span> 需要注意的风险
            </h3>
            <ul className="space-y-3">
              {report.risks.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="text-amber-500 mt-0.5">!</span>
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 市场分析 */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <MarketAnalysisCard
            demandSignals={report.market_analysis.demand_signals}
            userVoices={report.market_analysis.user_voices}
            competitors={report.market_analysis.competitors}
            opportunity={report.market_analysis.opportunity}
            searchTrends={report.market_analysis.search_trends}
            verificationGuide={report.market_analysis.verification_guide}
          />
        </div>

        {/* 开发路径 */}
        {report.development_path && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <DevelopmentPathCard
              recommendedTools={report.development_path.recommended_tools}
              serviceConnections={report.development_path.service_connections}
              recommendedStack={report.development_path.recommended_stack}
            />
          </div>
        )}

        {/* 快速验证方法 */}
        {report.validation_methods && report.validation_methods.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
            <ValidationMethodsCard methods={report.validation_methods} />
          </div>
        )}

        {/* 术语翻译表 */}
        {report.term_translations && report.term_translations.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
            <TermTranslationTable translations={report.term_translations} />
          </div>
        )}

        {/* 退出选项 */}
        {report.exit_options && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{report.exit_options.message}</h3>
            <div className="space-y-2 mb-6">
              {report.exit_options.alternatives.map((alt, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg text-gray-700 text-sm">
                  • {alt}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 用户反馈 */}
        {report.feedback_prompt && (
          <div className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl p-6 border border-primary-100 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{report.feedback_prompt.question}</h3>
            <div className="flex justify-center gap-4">
              {report.feedback_prompt.options.map((option, idx) => (
                <button
                  key={idx}
                  className="px-6 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary-300 transition-all text-gray-700"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 行动按钮 */}
        <div className="flex gap-4 justify-center pb-12">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            评估另一个想法
          </button>
          <button
            onClick={() => window.print()}
            className="px-8 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
          >
            保存报告
          </button>
        </div>
      </div>
    </div>
  )
}
