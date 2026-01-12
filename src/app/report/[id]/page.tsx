'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StepCard } from '@/components/wizard'
import { cn } from '@/lib/utils'
import type { VibeReport, ProductApproach } from '@/lib/types'

// 骨架屏组件
function ReportSkeleton() {
  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 标题骨架 */}
        <div className="text-center mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded-lg mx-auto mb-2 animate-pulse" />
          <div className="h-4 w-32 bg-gray-100 rounded mx-auto animate-pulse" />
        </div>

        {/* 评分卡片骨架 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="text-center">
            <div className="h-16 w-20 bg-gray-200 rounded-xl mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-64 bg-gray-100 rounded mx-auto mb-6 animate-pulse" />
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* 内容区骨架 */}
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}

        {/* 加载提示 */}
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">正在生成评估报告...</p>
          <p className="text-sm text-gray-400 mt-1">AI 正在综合分析你的项目，请稍候</p>
        </div>
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

  useEffect(() => {
    async function generateReport() {
      try {
        const response = await fetch(`/api/conversation/${conversationId}/report`, {
          method: 'POST',
        })

        if (!response.ok) throw new Error('生成报告失败')

        const data = await response.json()
        setReport(data.report)
        // 默认选中推荐方案
        if (data.report?.product_approaches?.recommended_id) {
          setSelectedApproach(data.report.product_approaches.recommended_id)
        }
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

  // 获取当前选中的产品方案
  const getSelectedApproachData = (): ProductApproach | undefined => {
    if (!report?.product_approaches?.approaches || !selectedApproach) return undefined
    return report.product_approaches.approaches.find(a => a.id === selectedApproach)
  }

  if (isLoading) {
    return <ReportSkeleton />
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
          'rounded-2xl border p-8 mb-6 text-center shadow-sm bg-white',
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-6">
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

        {/* Product Approach Selection - NEW V2.1 */}
        {report.product_approaches && report.product_approaches.approaches.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-6">
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

                    {/* Workflow Steps */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 flex-wrap">
                      {approach.workflow.map((step, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          <span className="bg-gray-100 px-2 py-1 rounded">{step.action}</span>
                          {idx < approach.workflow.length - 1 && <span>→</span>}
                        </span>
                      ))}
                    </div>

                    {/* Pros/Cons Preview */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-green-600">✓ {approach.pros[0]}</div>
                      <div className="text-amber-600">⚠ {approach.cons[0]}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Recommendation Reason */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
              <span className="font-medium">💡 建议：</span>
              {report.product_approaches.recommendation_reason}
            </div>

            {/* Selected Approach Details */}
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
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>⚙️</span> 技术方案选择
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option A */}
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

            {/* Option B */}
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
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🚀</span> 最快上手路径
          </h3>
          <div className="space-y-4">
            {report.fastest_path.map((step, i) => (
              <div key={i} className="relative pl-10">
                <div className="absolute left-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="font-bold text-gray-900 mb-1">{step.title}</div>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                  {step.copy_text && (
                    <div
                      className="bg-white border border-gray-200 p-3 rounded-lg text-xs font-mono text-gray-600 mb-3 cursor-pointer hover:bg-gray-50 transition-colors group"
                      onClick={() => navigator.clipboard.writeText(step.copy_text!)}
                      title="点击复制"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] uppercase text-gray-400">可复制的提示词</span>
                        <span className="text-[10px] text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">点击复制</span>
                      </div>
                      {step.copy_text}
                    </div>
                  )}
                  {step.action_url && (
                    <a
                      href={step.action_url}
                      target="_blank"
                      className="inline-block px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>💰</span> 成本预估
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">时间投入</div>
                <div className="font-medium text-gray-700">{report.cost_estimate.time_breakdown}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">金钱投入</div>
                <div className="font-medium text-gray-700">{report.cost_estimate.money_breakdown}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>💣</span> 避坑指南
            </h3>
            <ul className="space-y-2">
              {report.pitfalls.map((pit, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  {pit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Learning */}
        <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-sm mb-6">
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
