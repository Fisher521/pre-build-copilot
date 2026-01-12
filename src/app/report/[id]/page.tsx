'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StepCard } from '@/components/wizard'
import { cn } from '@/lib/utils'
import type { VibeReport } from '@/lib/types'

export default function ReportPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [report, setReport] = useState<VibeReport | null>(null)
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

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-100 text-green-700'
    if (difficulty <= 4) return 'bg-yellow-100 text-yellow-700'
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
    <div className="min-h-screen py-12 px-6 bg-[#0a0a0a] text-gray-100 font-sans selection:bg-primary-500 selection:text-white">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 tracking-tight">VIBE REPORT 2.0</h1>
          <p className="text-gray-500 mt-2 font-mono text-sm">EVALUATION COMPLETE // SYSTEM READY</p>
        </div>

        {/* Score Card */}
        <div className={cn(
          'rounded-2xl border p-8 mb-6 text-center shadow-2xl backdrop-blur-sm relative overflow-hidden',
          'bg-gray-900/50 border-white/10'
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-purple-500/10 opacity-50" />
          <div className="relative z-10">
          <div className={cn('text-7xl font-black mb-2 tracking-tighter', getScoreColor(report.score.feasibility))}>
            {report.score.feasibility}
          </div>
          <div className="text-gray-400 text-sm mb-6 uppercase tracking-widest">Feasibility Score</div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 backdrop-blur-md">
             <p className="text-lg font-medium text-gray-200">{report.one_liner_conclusion}</p>
          </div>

          <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 border-t border-white/10 pt-4">
             <div>
               <div className="font-bold text-gray-200 text-lg">{report.score.breakdown.tech}</div>
               <div>技术可行</div>
             </div>
             <div>
               <div className="font-bold text-gray-200 text-lg">{report.score.breakdown.market}</div>
               <div>市场机会</div>
             </div>
             <div>
               <div className="font-bold text-gray-200 text-lg">{report.score.breakdown.onboarding}</div>
               <div>上手难度</div>
             </div>
             <div>
               <div className="font-bold text-gray-200 text-lg">{report.score.breakdown.user_match}</div>
               <div>用户匹配</div>
             </div>
          </div>
          </div>
        </div>

        {/* Strengths & Challenges - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl border bg-gray-900/40 border-white/10 backdrop-blur-md p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <span>💪</span> 为什么值得试
            </h3>
            <ul className="space-y-3">
              {report.why_worth_it.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-gray-900/40 border-white/10 backdrop-blur-md p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <span>⚠️</span> 容易卡住的地方
            </h3>
            <ul className="space-y-3">
              {report.risks.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="text-amber-400 mt-0.5 flex-shrink-0">!</span>
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Market Analysis */}
        <div className="rounded-2xl border bg-gray-900/40 border-white/10 backdrop-blur-md p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <span>📈</span> 市场分析
          </h3>
          <div className="space-y-6">
            <div className="p-4 bg-primary-900/20 rounded-xl border border-primary-500/20">
              <div className="text-sm font-medium text-primary-300 mb-1">机会洞察</div>
              <p className="text-gray-300 leading-relaxed">{report.market_analysis.opportunity}</p>
            </div>
            
            {report.market_analysis.search_trends && (
              <div>
                <div className="text-sm font-medium text-gray-400 mb-2">搜索趋势</div>
                <div className="text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/10">
                  {report.market_analysis.search_trends}
                </div>
              </div>
            )}

            {report.market_analysis.competitors.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-400 mb-3">现有竞品</div>
                <div className="grid gap-3">
                  {report.market_analysis.competitors.map((comp, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-200">{comp.name}</div>
                        {comp.url && <a href={comp.url} target="_blank" className="text-xs text-primary-400 hover:text-primary-300 hover:underline">查看 →</a>}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-green-400/90">✓ {comp.pros}</div>
                        <div className="text-red-400/90">✗ {comp.cons}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tech Stack Comparison */}
        <div className="rounded-2xl border bg-gray-900/40 border-white/10 backdrop-blur-md p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <span>⚙️</span> 技术方案选择
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Option A */}
             <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                <div className="text-center mb-3">
                  <div className="font-bold text-gray-200">{report.tech_options.option_a.name}</div>
                  <div className="text-xs text-gray-500">{report.tech_options.option_a.fit_for}</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-500">工具</span>
                    <span className="font-medium text-right max-w-[60%] text-gray-300">{report.tech_options.option_a.tools.join(' + ')}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-500">能力</span>
                    <span className="text-gray-300 text-right">{report.tech_options.option_a.capability}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-500">时间</span>
                    <span className="text-gray-300">{report.tech_options.option_a.dev_time}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-gray-500">成本</span>
                    <span className="text-green-400 font-medium">{report.tech_options.option_a.cost}</span>
                  </div>
                </div>
             </div>

             {/* Option B */}
             <div className="border border-primary-500/30 rounded-xl p-4 bg-primary-900/10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary-500/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="text-center mb-3 relative z-10">
                  <div className="font-bold text-white">{report.tech_options.option_b.name}</div>
                  <div className="text-xs text-primary-300">{report.tech_options.option_b.fit_for}</div>
                </div>
                 <div className="space-y-2 text-sm relative z-10">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">工具</span>
                    <span className="font-medium text-right max-w-[60%] text-gray-200">{report.tech_options.option_b.tools.join(' + ')}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">能力</span>
                    <span className="text-gray-200 text-right">{report.tech_options.option_b.capability}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-400">时间</span>
                    <span className="text-gray-200">{report.tech_options.option_b.dev_time}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-gray-400">成本</span>
                    <span className="text-green-400 font-medium">{report.tech_options.option_b.cost}</span>
                  </div>
                </div>
             </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg text-sm text-blue-200">
             <span className="font-bold mr-2 text-blue-400">💡 建议:</span>
             {report.tech_options.advice}
          </div>
        </div>

        {/* Fastest Path */}
        <div className="rounded-2xl border bg-gray-900/40 border-white/10 backdrop-blur-md p-6 mb-4">
           <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <span>🚀</span> 最快上手路径
          </h3>
          <div className="space-y-6 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/10">
             {report.fastest_path.map((step, i) => (
               <div key={i} className="relative pl-12">
                 <div className="absolute left-0 w-8 h-8 rounded-full bg-gray-800 text-primary-400 flex items-center justify-center font-bold border-4 border-[#0a0a0a] z-10">
                   {i + 1}
                 </div>
                 <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                    <div className="font-bold text-gray-200 mb-1">{step.title}</div>
                    <p className="text-sm text-gray-400 mb-3">{step.description}</p>
                    {step.copy_text && (
                      <div className="bg-black/30 border border-white/5 p-3 rounded-lg text-xs font-mono text-gray-400 mb-3 break-all cursor-pointer hover:bg-black/50 hover:text-gray-200 transition-all group"
                           onClick={() => navigator.clipboard.writeText(step.copy_text!)}
                           title="点击复制">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-[10px] uppercase text-gray-600">Prompt</span>
                           <span className="text-[10px] text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">COPY</span>
                        </div>
                        {step.copy_text}
                      </div>
                    )}
                    {step.action_url && (
                       <a href={step.action_url} target="_blank" className="inline-block px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                         {step.action_label || '去执行 →'}
                       </a>
                    )}
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Cost & Pitfalls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="rounded-2xl border bg-gray-900/40 border-white/10 backdrop-blur-md p-6">
               <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <span>💰</span> 成本预估
              </h3>
              <div className="space-y-4">
                 <div>
                   <div className="text-xs text-gray-500 mb-1">时间投入</div>
                   <div className="font-medium text-gray-200">{report.cost_estimate.time_breakdown}</div>
                 </div>
                 <div>
                   <div className="text-xs text-gray-500 mb-1">金钱投入</div>
                   <div className="font-medium text-gray-200">{report.cost_estimate.money_breakdown}</div>
                 </div>
              </div>
            </div>
            
            <div className="rounded-2xl border bg-gray-900/40 border-white/10 backdrop-blur-md p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <span>💣</span> 避坑指南
              </h3>
              <ul className="space-y-2">
                {report.pitfalls.map((pit, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    {pit}
                  </li>
                ))}
              </ul>
            </div>
        </div>

        {/* Learning */}
        <div className="rounded-2xl border mb-8 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-500/30 backdrop-blur-md p-6">
           <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
            <span>🎓</span> 学习收获
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {report.learning_takeaways.map((learn, i) => (
               <li key={i} className="flex items-center gap-2 text-sm text-indigo-200 bg-indigo-900/40 border border-indigo-500/20 p-2 rounded-lg">
                 <span>💡</span> {learn}
               </li>
             ))}
          </ul>
        </div>

        {/* Feedback Widget */}
        <div className="mb-8 text-center p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
           <h3 className="text-gray-200 font-medium mb-4">这份报告对你有帮助吗？</h3>
           <div className="flex items-center justify-center gap-4">
             <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-600 rounded-lg hover:border-gray-400 hover:bg-white/5 transition-all text-gray-300">
               <span>👍</span> Useful
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-600 rounded-lg hover:border-gray-400 hover:bg-white/5 transition-all text-gray-300">
               <span>👎</span> Not really
             </button>
           </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleRestart}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            新项目
          </button>
          <button
            onClick={handleDownload}
            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/20"
          >
            保存报告
          </button>
        </div>
      </div>
    </div>
  )
}
