'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StepCard } from '@/components/wizard'
import { cn } from '@/lib/utils'

interface ReportData {
  projectName: string
  score: number
  verdict: string
  strengths: string[]
  challenges: string[]
  marketAnalysis?: {
    verdict: string
    signals: string[]
    competitors?: Array<{ name: string; feature: string; gap: string }>
  }
  implementation?: {
    techStack: {
      frontend: string
      backend: string
      database: string
      deployment: string
      aiService?: string
    }
    coreFlow: string[]
    devProcess: Array<{ step: string; difficulty: string; dependency: string }>
    recommendation: string
  }
  costEstimate?: {
    timeCost: {
      mvp: string
      fullVersion: string
      dailyHours: string
    }
    moneyCost: {
      development: string
      monthlyOperation: Array<{ item: string; cost: string; note: string }>
      totalMonthly: string
    }
    savingTips: string[]
  }
  nextSteps: string[]
}

export default function ReportPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [report, setReport] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function generateReport() {
      try {
        const response = await fetch(`/api/conversation/${conversationId}/report`, {
          method: 'POST',
        })
        
        if (!response.ok) throw new Error('生成报告失败')
        
        const data = await response.json()
        setReport(data.report)
      } catch (err) {
        setError(err instanceof Error ? err.message : '生成失败')
      } finally {
        setIsLoading(false)
      }
    }

    generateReport()
  }, [conversationId])

  const handleRestart = () => {
    router.push('/')
  }

  const handleDownload = () => {
    alert('下载功能即将上线')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-primary-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-primary-50 border-primary-200'
    if (score >= 40) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes('简单')) return 'bg-green-100 text-green-700'
    if (difficulty.includes('中等')) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">正在生成评估报告...</p>
          <p className="text-sm text-gray-500">AI 正在综合分析，请稍候</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <StepCard maxWidth="md">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">😔</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">生成失败</h2>
            <p className="text-gray-500 mb-6">{error || '请稍后重试'}</p>
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
            >
              重新开始
            </button>
          </div>
        </StepCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">📊 Vibe Check 评估报告</h1>
          <p className="text-gray-500 mt-2">{report.projectName}</p>
        </div>

        {/* Score Card */}
        <div className={cn(
          'rounded-2xl border-2 p-8 mb-6 text-center',
          getScoreBg(report.score)
        )}>
          <div className={cn('text-6xl font-bold mb-2', getScoreColor(report.score))}>
            {report.score}
          </div>
          <div className="text-gray-500 text-sm mb-3">可行性评分 / 100</div>
          <div className={cn(
            'inline-block px-4 py-1.5 rounded-full text-sm font-medium',
            report.score >= 60 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          )}>
            {report.verdict}
          </div>
        </div>

        {/* Strengths & Challenges - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Strengths */}
          <StepCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>💪</span> 为什么值得试
            </h3>
            <ul className="space-y-2">
              {report.strengths.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </StepCard>

          {/* Challenges */}
          <StepCard>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚠️</span> 容易卡住的地方
            </h3>
            <ul className="space-y-2">
              {report.challenges.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="text-yellow-500 mt-0.5 flex-shrink-0">!</span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </StepCard>
        </div>

        {/* Market Analysis */}
        {report.marketAnalysis && (
          <StepCard className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📈</span> 市场分析
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                <p className="text-primary-800 font-medium">{report.marketAnalysis.verdict}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">事实信号</div>
                <ul className="space-y-1">
                  {report.marketAnalysis.signals.map((signal, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span>🔎</span> {signal}
                    </li>
                  ))}
                </ul>
              </div>
              {report.marketAnalysis.competitors && report.marketAnalysis.competitors.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">竞品分析</div>
                  <div className="space-y-2">
                    {report.marketAnalysis.competitors.map((comp, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="font-medium text-gray-900">{comp.name}</div>
                        <div className="text-gray-600">✓ 做得好：{comp.feature}</div>
                        <div className="text-gray-600">✗ 没做好：{comp.gap}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </StepCard>
        )}

        {/* Implementation */}
        {report.implementation && (
          <StepCard className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🛠️</span> 技术实现
            </h3>
            <div className="space-y-5">
              {/* Tech Stack */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">推荐技术栈</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(report.implementation.techStack).map(([key, value]) => value && (
                    <div key={key} className="p-2 bg-gray-800 rounded-lg text-center">
                      <div className="text-xs text-gray-400 capitalize">{key === 'aiService' ? 'AI 服务' : key}</div>
                      <div className="text-sm text-white font-medium">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Flow */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">核心流程</div>
                <div className="flex flex-wrap items-center gap-2">
                  {report.implementation.coreFlow.map((step, i) => (
                    <div key={i} className="flex items-center">
                      <div className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm">{step}</div>
                      {i < report.implementation!.coreFlow.length - 1 && <span className="mx-1 text-gray-400">→</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dev Process */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">开发步骤</div>
                <div className="space-y-2">
                  {report.implementation.devProcess.map((proc, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-medium flex-shrink-0">{i + 1}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{proc.step}</div>
                        <div className="text-xs text-gray-500">依赖：{proc.dependency}</div>
                      </div>
                      <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getDifficultyColor(proc.difficulty))}>{proc.difficulty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-xs font-medium text-blue-600 mb-1">💡 开发建议</div>
                <p className="text-sm text-blue-700">{report.implementation.recommendation}</p>
              </div>
            </div>
          </StepCard>
        )}

        {/* Cost Estimate */}
        {report.costEstimate && (
          <StepCard className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>💰</span> 成本估算
            </h3>
            <div className="space-y-5">
              {/* Time Cost */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">⏱️ 时间成本</div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-purple-50 rounded-xl text-center">
                    <div className="text-xs text-purple-600 mb-1">MVP 开发</div>
                    <div className="font-bold text-purple-700">{report.costEstimate.timeCost.mvp}</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl text-center">
                    <div className="text-xs text-purple-600 mb-1">完整版本</div>
                    <div className="font-bold text-purple-700">{report.costEstimate.timeCost.fullVersion}</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl text-center">
                    <div className="text-xs text-purple-600 mb-1">每天投入</div>
                    <div className="font-bold text-purple-700">{report.costEstimate.timeCost.dailyHours}</div>
                  </div>
                </div>
              </div>

              {/* Money Cost */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">💵 金钱成本</div>
                <div className="p-3 bg-gray-50 rounded-lg mb-2">
                  <div className="text-xs text-gray-500 mb-1">开发期间</div>
                  <div className="text-sm font-medium text-gray-900">{report.costEstimate.moneyCost.development}</div>
                </div>
                <div className="space-y-2">
                  {report.costEstimate.moneyCost.monthlyOperation.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm text-gray-900">{item.item}</span>
                        {item.note && <span className="text-xs text-gray-500 ml-2">({item.note})</span>}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.cost}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-green-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">月度总计</span>
                  <span className="text-lg font-bold text-green-700">{report.costEstimate.moneyCost.totalMonthly}</span>
                </div>
              </div>

              {/* Saving Tips */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs font-medium text-blue-600 mb-2">💡 省钱建议</div>
                <ul className="space-y-1">
                  {report.costEstimate.savingTips.map((tip, i) => (
                    <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                      <span className="text-blue-500">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </StepCard>
        )}

        {/* Next Steps */}
        <StepCard className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🚀</span> 建议下一步
          </h3>
          <ol className="space-y-3">
            {report.nextSteps.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </StepCard>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleRestart}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            重新评估
          </button>
          <button
            onClick={handleDownload}
            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors"
          >
            下载报告
          </button>
        </div>
      </div>
    </div>
  )
}
