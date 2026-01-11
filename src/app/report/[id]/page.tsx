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
    targetSize: string
    competition: string
    opportunity: string
  }
  costEstimate?: {
    development: string
    operation: string
    tips: string
  }
  techAnalysis?: {
    difficulty: string
    stack: string
    mvpTime: string
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

  // Generate report on mount
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">📊 Pre-build 评估报告</h1>
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

        {/* Strengths */}
        <StepCard className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>💪</span> 优势
          </h3>
          <ul className="space-y-2">
            {report.strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </StepCard>

        {/* Challenges */}
        <StepCard className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>⚠️</span> 挑战
          </h3>
          <ul className="space-y-2">
            {report.challenges.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <span className="text-yellow-500 mt-0.5">!</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </StepCard>

        {/* Market Analysis */}
        {report.marketAnalysis && (
          <StepCard className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📈</span> 市场分析
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">目标市场</div>
                <p className="text-gray-700">{report.marketAnalysis.targetSize}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">竞争情况</div>
                <p className="text-gray-700">{report.marketAnalysis.competition}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">机会点</div>
                <p className="text-gray-700">{report.marketAnalysis.opportunity}</p>
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
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">开发成本</div>
                <p className="text-gray-700">{report.costEstimate.development}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">运营成本</div>
                <p className="text-gray-700">{report.costEstimate.operation}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-600 mb-1">💡 省钱建议</div>
                <p className="text-blue-700 text-sm">{report.costEstimate.tips}</p>
              </div>
            </div>
          </StepCard>
        )}

        {/* Tech Analysis */}
        {report.techAnalysis && (
          <StepCard className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🛠️</span> 技术实现
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">技术难度</div>
                <div className="font-semibold text-gray-900">{report.techAnalysis.difficulty}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">MVP 周期</div>
                <div className="font-semibold text-gray-900">{report.techAnalysis.mvpTime}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl col-span-1">
                <div className="text-sm text-gray-500 mb-1">推荐栈</div>
                <div className="font-semibold text-gray-900 text-sm">{report.techAnalysis.stack}</div>
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

