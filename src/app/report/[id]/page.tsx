'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { StepCard } from '@/components/wizard'
import { cn } from '@/lib/utils'
import type { VibeReport, ProductApproach } from '@/lib/types'

// 加载步骤配置
const LOADING_STEPS = [
  { id: 'analyze', label: '分析项目信息', duration: 3000 },
  { id: 'market', label: '搜索市场竞品', duration: 5000 },
  { id: 'approach', label: '设计产品方案', duration: 4000 },
  { id: 'tech', label: '匹配技术栈', duration: 3000 },
  { id: 'path', label: '规划实施路径', duration: 3000 },
  { id: 'report', label: '生成完整报告', duration: 2000 },
]

// 有趣的等待提示语
const WAITING_TIPS = [
  '💡 好的产品想法比代码更重要',
  '🚀 先做出来，再慢慢完善',
  '📊 80%的项目失败是因为没人用，不是技术问题',
  '⚡ Vibe Coding 的精髓：能用就行',
  '🎯 找到第一个愿意付费的用户比10000行代码更有价值',
  '💪 一个周末做出MVP，比一个月做出完美产品更好',
]

// 进度加载组件
function LoadingProgress({
  currentStep,
  progress,
  estimatedTime
}: {
  currentStep: number
  progress: number
  estimatedTime: number
}) {
  const [tipIndex, setTipIndex] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  // 轮换提示语
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % WAITING_TIPS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // 计时器
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const remainingTime = Math.max(0, estimatedTime - elapsedTime)

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">正在生成评估报告</h1>
          <p className="text-gray-500">预计需要 {remainingTime > 0 ? `${remainingTime}` : '即将完成'} 秒</p>
        </div>

        {/* 进度条 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">整体进度</span>
              <span className="text-primary-600 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 步骤列表 */}
          <div className="space-y-3">
            {LOADING_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep
              const isCurrent = idx === currentStep
              const isPending = idx > currentStep

              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300',
                    isCompleted && 'bg-green-50',
                    isCurrent && 'bg-primary-50',
                    isPending && 'opacity-40'
                  )}
                >
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent && 'bg-primary-500 text-white animate-pulse',
                    isPending && 'bg-gray-200 text-gray-500'
                  )}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className={cn(
                    'text-sm',
                    isCompleted && 'text-green-700',
                    isCurrent && 'text-primary-700 font-medium',
                    isPending && 'text-gray-500'
                  )}>
                    {step.label}
                    {isCurrent && <span className="ml-2 text-primary-500">处理中...</span>}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 提示语卡片 */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 text-center">
          <div className="text-2xl mb-2">💭</div>
          <p className="text-indigo-800 font-medium transition-all duration-500">
            {WAITING_TIPS[tipIndex]}
          </p>
        </div>

        {/* 小提示 */}
        <p className="text-center text-xs text-gray-400 mt-6">
          AI 正在综合分析你的项目，生成个性化建议
        </p>
      </div>
    </div>
  )
}

// 骨架屏 - 用于报告加载完成后的渐进显示
function ReportSectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-3/4 bg-gray-100 rounded" />
        <div className="h-4 w-5/6 bg-gray-100 rounded" />
      </div>
    </div>
  )
}

export default function ReportPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [report, setReport] = useState<VibeReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedApproach, setSelectedApproach] = useState<string | null>(null)

  // 加载进度状态
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef(Date.now())

  // 模拟进度推进
  useEffect(() => {
    if (!isLoading) return

    const totalDuration = LOADING_STEPS.reduce((sum, s) => sum + s.duration, 0)
    let elapsed = 0

    const interval = setInterval(() => {
      elapsed += 200

      // 计算当前步骤
      let cumulative = 0
      for (let i = 0; i < LOADING_STEPS.length; i++) {
        cumulative += LOADING_STEPS[i].duration
        if (elapsed < cumulative) {
          setCurrentStep(i)
          break
        }
      }

      // 计算进度（最多到95%，剩下的等API返回）
      const rawProgress = (elapsed / totalDuration) * 100
      setProgress(Math.min(rawProgress, 95))

    }, 200)

    return () => clearInterval(interval)
  }, [isLoading])

  useEffect(() => {
    async function generateReport() {
      try {
        const response = await fetch(`/api/conversation/${conversationId}/report`, {
          method: 'POST',
        })

        if (!response.ok) throw new Error('生成报告失败')

        // 处理流式响应
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.type === 'start') {
                  // 开始生成
                  setCurrentStep(0)
                } else if (data.type === 'progress') {
                  // 根据内容长度更新进度（使用函数式更新避免 stale closure）
                  const estimatedProgress = Math.min((data.length / 3000) * 100, 90)
                  setProgress(prev => Math.max(prev, estimatedProgress))
                  // 根据进度推进步骤
                  const stepIndex = Math.floor((estimatedProgress / 100) * LOADING_STEPS.length)
                  setCurrentStep(prev => Math.max(prev, Math.min(stepIndex, LOADING_STEPS.length - 1)))
                } else if (data.type === 'complete') {
                  // 完成进度
                  setProgress(100)
                  setCurrentStep(LOADING_STEPS.length)

                  // 短暂延迟后显示报告
                  setTimeout(() => {
                    setReport(data.report)
                    if (data.report?.product_approaches?.recommended_id) {
                      setSelectedApproach(data.report.product_approaches.recommended_id)
                    }
                    setIsLoading(false)
                  }, 500)
                } else if (data.type === 'error') {
                  throw new Error(data.message || '生成失败')
                }
              } catch (e) {
                if (e instanceof SyntaxError) continue
                throw e
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '生成失败')
        setIsLoading(false)
      }
    }

    generateReport()
  }, [conversationId])

  const handleRestart = () => {
    router.push('/')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-primary-600'
    if (score >= 40) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-primary-50 border-primary-200'
    if (score >= 40) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'low': return { text: '简单', color: 'bg-green-100 text-green-700' }
      case 'medium': return { text: '中等', color: 'bg-amber-100 text-amber-700' }
      case 'high': return { text: '复杂', color: 'bg-red-100 text-red-700' }
      default: return { text: '未知', color: 'bg-gray-100 text-gray-700' }
    }
  }

  const getSelectedApproachData = (): ProductApproach | undefined => {
    if (!report?.product_approaches?.approaches || !selectedApproach) return undefined
    return report.product_approaches.approaches.find(a => a.id === selectedApproach)
  }

  // 显示加载进度
  if (isLoading) {
    const estimatedSeconds = Math.ceil(LOADING_STEPS.reduce((sum, s) => sum + s.duration, 0) / 1000)
    return (
      <LoadingProgress
        currentStep={currentStep}
        progress={progress}
        estimatedTime={estimatedSeconds}
      />
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

  const selectedApproachData = getSelectedApproachData()

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">项目评估报告</h1>
          <p className="text-gray-500 mt-2">Vibe Checker 2.0</p>
        </div>

        {/* Score Card */}
        <div className={cn(
          'rounded-2xl border p-8 mb-6 text-center shadow-sm bg-white animate-in fade-in slide-in-from-bottom-4 duration-500',
          getScoreBg(report.score.feasibility)
        )}>
          <div className={cn('text-6xl font-bold mb-2', getScoreColor(report.score.feasibility))}>
            {report.score.feasibility}
          </div>
          <div className="text-gray-500 text-sm mb-4">可行性评分 / 100</div>

          <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100">
            <p className="text-lg font-medium text-gray-800">{report.one_liner_conclusion}</p>
          </div>

          <div className="grid grid-cols-4 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-bold text-gray-900 text-lg">{report.score.breakdown.tech}</div>
              <div className="text-gray-500">技术可行</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-bold text-gray-900 text-lg">{report.score.breakdown.market}</div>
              <div className="text-gray-500">市场机会</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-bold text-gray-900 text-lg">{report.score.breakdown.onboarding}</div>
              <div className="text-gray-500">上手难度</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-bold text-gray-900 text-lg">{report.score.breakdown.user_match}</div>
              <div className="text-gray-500">用户匹配</div>
            </div>
          </div>
        </div>

        {/* Strengths & Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
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

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
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

        {/* Market Analysis */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📈</span> 市场分析
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
              <div className="text-sm font-medium text-primary-700 mb-1">机会洞察</div>
              <p className="text-gray-700 leading-relaxed">{report.market_analysis.opportunity}</p>
            </div>

            {report.market_analysis.search_trends && (
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">搜索趋势</div>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {report.market_analysis.search_trends}
                </div>
              </div>
            )}

            {report.market_analysis.competitors.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-500 mb-3">现有竞品</div>
                <div className="grid gap-3">
                  {report.market_analysis.competitors.map((comp, i) => (
                    <div key={i} className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900">{comp.name}</div>
                        {comp.url && (
                          <a href={comp.url} target="_blank" className="text-xs text-primary-600 hover:text-primary-700 hover:underline">
                            查看 →
                          </a>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-green-600">✓ {comp.pros}</div>
                        <div className="text-red-500">✗ {comp.cons}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Approach Selection */}
        {report.product_approaches && report.product_approaches.approaches.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>🎯</span> 产品实现方案
            </h3>
            <p className="text-sm text-gray-500 mb-4">选择一个产品逻辑方案，后续的技术选型和实施路径会基于此调整</p>

            <div className="grid gap-4 mb-4">
              {report.product_approaches.approaches.map((approach) => {
                const isSelected = selectedApproach === approach.id
                const isRecommended = approach.id === report.product_approaches.recommended_id
                const complexity = getComplexityLabel(approach.complexity)

                return (
                  <button
                    key={approach.id}
                    onClick={() => setSelectedApproach(approach.id)}
                    className={cn(
                      'text-left p-5 rounded-xl border-2 transition-all',
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100 bg-white hover:border-primary-200'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{approach.name}</span>
                        {isRecommended && (
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">推荐</span>
                        )}
                      </div>
                      <span className={cn('text-xs px-2 py-1 rounded-full', complexity.color)}>
                        {complexity.text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{approach.description}</p>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 flex-wrap">
                      {approach.workflow.map((step, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          <span className="bg-gray-100 px-2 py-1 rounded">{step.action}</span>
                          {idx < approach.workflow.length - 1 && <span>→</span>}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-green-600">✓ {approach.pros[0]}</div>
                      <div className="text-amber-600">⚠ {approach.cons[0]}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
              <span className="font-medium">💡 建议：</span>
              {report.product_approaches.recommendation_reason}
            </div>

            {selectedApproachData && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3">详细流程</h4>
                <div className="space-y-3">
                  {selectedApproachData.workflow.map((step) => (
                    <div key={step.step} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {step.step}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{step.action}</div>
                        <div className="text-sm text-gray-600">{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-green-700 mb-2">优势</div>
                    <ul className="space-y-1">
                      {selectedApproachData.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-1">
                          <span className="text-green-500">✓</span> {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-700 mb-2">劣势</div>
                    <ul className="space-y-1">
                      {selectedApproachData.cons.map((con, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-1">
                          <span className="text-amber-500">⚠</span> {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  <span className="font-medium">最适合：</span>{selectedApproachData.best_for}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tech Stack */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>⚙️</span> 技术方案选择
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="text-center mb-3">
                <div className="font-bold text-gray-900">{report.tech_options.option_a.name}</div>
                <div className="text-xs text-gray-500">{report.tech_options.option_a.fit_for}</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500">工具</span>
                  <span className="font-medium text-right max-w-[60%] text-gray-700">{report.tech_options.option_a.tools.join(' + ')}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500">能力</span>
                  <span className="text-gray-700">{report.tech_options.option_a.capability}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500">时间</span>
                  <span className="text-gray-700">{report.tech_options.option_a.dev_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">成本</span>
                  <span className="text-green-600 font-medium">{report.tech_options.option_a.cost}</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-primary-200 rounded-xl p-4 bg-primary-50">
              <div className="text-center mb-3">
                <div className="font-bold text-gray-900">{report.tech_options.option_b.name}</div>
                <div className="text-xs text-primary-600">{report.tech_options.option_b.fit_for}</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-primary-100 pb-1">
                  <span className="text-gray-500">工具</span>
                  <span className="font-medium text-right max-w-[60%] text-gray-700">{report.tech_options.option_b.tools.join(' + ')}</span>
                </div>
                <div className="flex justify-between border-b border-primary-100 pb-1">
                  <span className="text-gray-500">能力</span>
                  <span className="text-gray-700">{report.tech_options.option_b.capability}</span>
                </div>
                <div className="flex justify-between border-b border-primary-100 pb-1">
                  <span className="text-gray-500">时间</span>
                  <span className="text-gray-700">{report.tech_options.option_b.dev_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">成本</span>
                  <span className="text-green-600 font-medium">{report.tech_options.option_b.cost}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
            <span className="font-medium">💡 建议：</span>
            {report.tech_options.advice}
          </div>
        </div>

        {/* Fastest Path */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <span>🚀</span> 最快上手路径
          </h3>
          <div className="space-y-5">
            {report.fastest_path.map((step, i) => (
              <div key={i} className="relative pl-12">
                <div className="absolute left-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                  <div className="font-semibold text-gray-900 mb-2 text-base">{step.title}</div>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-4">{step.description}</p>
                  {step.copy_text && (
                    <div
                      className="bg-white border border-gray-200 p-4 rounded-lg text-sm text-gray-700 mb-4 cursor-pointer hover:bg-gray-50 transition-colors group leading-relaxed whitespace-pre-line"
                      onClick={() => navigator.clipboard.writeText(step.copy_text!)}
                      title="点击复制"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-gray-500">📋 可复制的提示词</span>
                        <span className="text-xs text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">点击复制</span>
                      </div>
                      {step.copy_text}
                    </div>
                  )}
                  {step.action_url && (
                    <a
                      href={step.action_url}
                      target="_blank"
                      className="inline-block px-5 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      {step.action_label || '去执行 →'}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost & Pitfalls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-600">
          {/* 成本预估 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <span>💰</span> 成本预估
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-xs font-medium text-blue-600 mb-2">⏱️ 时间投入</div>
                <div className="text-sm text-gray-800 leading-relaxed">{report.cost_estimate.time_breakdown}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="text-xs font-medium text-green-600 mb-2">💵 金钱投入</div>
                <div className="text-sm text-gray-800 leading-relaxed">{report.cost_estimate.money_breakdown}</div>
              </div>
            </div>
          </div>

          {/* 避坑指南 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <span>⚠️</span> 避坑指南
            </h3>
            <ul className="space-y-3">
              {report.pitfalls.map((pit, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-xs font-medium mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-800 leading-relaxed">{pit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Learning */}
        <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
            <span>🎓</span> 学习收获
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.learning_takeaways.map((learn, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-indigo-800 bg-white border border-indigo-100 p-3 rounded-lg">
                <span>💡</span> {learn}
              </li>
            ))}
          </ul>
        </div>

        {/* Feedback */}
        <div className="mb-8 text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-gray-700 font-medium mb-4">这份报告对你有帮助吗？</h3>
          <div className="flex items-center justify-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all text-gray-700">
              <span>👍</span> 有用
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all text-gray-700">
              <span>👎</span> 没帮助
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleRestart}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            评估新项目
          </button>
          <button
            onClick={() => alert('保存功能即将上线')}
            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm"
          >
            保存报告
          </button>
        </div>
      </div>
    </div>
  )
}
