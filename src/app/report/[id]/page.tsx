'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { ScoreRing } from '@/components/ui'
import { FeedbackModal } from '@/components/feedback'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'
import type { VibeReport, ProductApproach } from '@/lib/types'

// 加载步骤配置 - 使用翻译
const LOADING_STEPS_DURATION = [3000, 5000, 4000, 3000, 3000, 2000]

// 进度加载组件
function LoadingProgress({
  currentStep,
  progress,
  estimatedTime,
  loadingSteps,
  waitingTips,
  t,
  lang,
}: {
  currentStep: number
  progress: number
  estimatedTime: number
  loadingSteps: readonly { id: string; label: { zh: string; en: string } }[]
  waitingTips: readonly { zh: string; en: string }[]
  t: (key: string, params?: Record<string, string | number>) => string
  lang: 'zh' | 'en'
}) {
  const [tipIndex, setTipIndex] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  // 轮换提示语
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % waitingTips.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [waitingTips.length])

  // 计时器
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const remainingTime = Math.max(0, estimatedTime - elapsedTime)

  return (
    <div className="min-h-screen pt-14 sm:pt-16 pb-8 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-lg mx-auto">
        {/* 标题 */}
        <div className="text-center mb-6 sm:mb-8 mt-4">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{t('report.generating')}</h1>
          <p className="text-sm text-gray-500">{remainingTime > 0 ? t('report.estimatedTime', { time: remainingTime }) : t('report.almostDone')}</p>
        </div>

        {/* 进度条 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">{t('report.overallProgress')}</span>
              <span className="text-indigo-600 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 步骤列表 */}
          <div className="space-y-2">
            {loadingSteps.map((step, idx) => {
              const isCompleted = idx < currentStep
              const isCurrent = idx === currentStep
              const isPending = idx > currentStep

              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center gap-3 py-2 px-3 rounded-md transition-all duration-300',
                    isCompleted && 'bg-green-50',
                    isCurrent && 'bg-indigo-50',
                    isPending && 'opacity-40'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-all flex-shrink-0',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent && 'bg-indigo-500 text-white animate-pulse',
                    isPending && 'bg-gray-200 text-gray-500'
                  )}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className={cn(
                    'text-sm',
                    isCompleted && 'text-green-700',
                    isCurrent && 'text-indigo-700 font-medium',
                    isPending && 'text-gray-500'
                  )}>
                    {step.label[lang]}
                    {isCurrent && <span className="ml-2 text-indigo-500 hidden sm:inline">{t('report.processing')}</span>}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 提示语卡片 */}
        <div className="bg-indigo-50 rounded-lg border border-indigo-100 p-4 sm:p-6 text-center">
          <p className="text-indigo-800 text-sm font-medium transition-all duration-500">
            {waitingTips[tipIndex][lang]}
          </p>
        </div>

        {/* 小提示 */}
        <p className="text-center text-xs text-gray-400 mt-4 sm:mt-6">
          {t('report.aiGenerating')}
        </p>
      </div>
    </div>
  )
}

// 骨架屏 - 用于报告加载完成后的渐进显示
function ReportSectionSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 animate-pulse">
      <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
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
  const { t, lang, translations } = useTranslation()

  // 从翻译中获取加载步骤和等待提示
  const loadingSteps = translations.report.loadingSteps
  const waitingTips = translations.report.waitingTips

  const [isLoading, setIsLoading] = useState(true)
  const [report, setReport] = useState<VibeReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedApproach, setSelectedApproach] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // 反馈状态
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState<'helpful' | 'not_helpful'>('helpful')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  // 加载进度状态
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef(Date.now())

  // 模拟进度推进
  useEffect(() => {
    if (!isLoading) return

    const totalDuration = LOADING_STEPS_DURATION.reduce((sum, d) => sum + d, 0)
    let elapsed = 0

    const interval = setInterval(() => {
      elapsed += 200

      // 计算当前步骤
      let cumulative = 0
      for (let i = 0; i < LOADING_STEPS_DURATION.length; i++) {
        cumulative += LOADING_STEPS_DURATION[i]
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
      let receivedComplete = false

      try {
        const response = await fetch(`/api/conversation/${conversationId}/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: lang }),
        })

        if (!response.ok) {
          const errorText = await response.text().catch(() => '')
          throw new Error(errorText || `Server error: ${response.status}`)
        }

        // 处理流式响应
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''

        // 处理 SSE 事件的辅助函数
        const processLine = (line: string) => {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'start') {
                setCurrentStep(0)
              } else if (data.type === 'progress') {
                const estimatedProgress = Math.min((data.length / 3000) * 100, 90)
                setProgress(prev => Math.max(prev, estimatedProgress))
                const stepIndex = Math.floor((estimatedProgress / 100) * LOADING_STEPS_DURATION.length)
                setCurrentStep(prev => Math.max(prev, Math.min(stepIndex, LOADING_STEPS_DURATION.length - 1)))
              } else if (data.type === 'complete') {
                receivedComplete = true
                setProgress(100)
                setCurrentStep(LOADING_STEPS_DURATION.length)
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
              if (!(e instanceof SyntaxError)) throw e
            }
          }
        }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            processLine(line)
          }
        }

        // 处理流结束后 buffer 中剩余的数据
        if (buffer.trim()) {
          processLine(buffer.trim())
        }

        // 如果流结束但没收到complete事件
        if (!receivedComplete) {
          throw new Error('报告生成中断，请重试')
        }
      } catch (err) {
        console.error('Report generation error:', err)
        const errorMessage = err instanceof Error ? err.message : '生成失败'
        // 对常见错误提供更友好的提示
        if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Load failed')) {
          setError('网络连接失败，请检查网络后重试')
        } else {
          setError(errorMessage)
        }
        setIsLoading(false)
      }
    }

    generateReport()
  }, [conversationId, retryCount])

  const handleRestart = () => {
    router.push('/')
  }

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    setProgress(0)
    setCurrentStep(0)
    setRetryCount(prev => prev + 1)
  }

  // Share functionality
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleShare = async (method: 'copy' | 'native' | 'twitter' | 'weibo') => {
    const shareUrl = window.location.href
    const shareTitle = lang === 'zh'
      ? `项目评估报告 - ${report?.one_liner_conclusion || 'JustArt'}`
      : `Project Report - ${report?.one_liner_conclusion || 'JustArt'}`
    const shareText = lang === 'zh'
      ? `我用 justart.today 评估了一个项目想法，可行性评分 ${report?.score.feasibility || 0} 分！`
      : `I evaluated a project idea on justart.today, feasibility score: ${report?.score.feasibility || 0}!`

    switch (method) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl)
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
        } catch (err) {
          console.error('Copy failed:', err)
        }
        break

      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: shareTitle,
              text: shareText,
              url: shareUrl,
            })
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              console.error('Share failed:', err)
            }
          }
        }
        break

      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        )
        break

      case 'weibo':
        window.open(
          `https://service.weibo.com/share/share.php?title=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        )
        break
    }
    setShowShareMenu(false)
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
    const labels = translations.report.complexity
    switch (complexity) {
      case 'low': return { text: labels.low[lang], color: 'bg-green-100 text-green-700' }
      case 'medium': return { text: labels.medium[lang], color: 'bg-amber-100 text-amber-700' }
      case 'high': return { text: labels.high[lang], color: 'bg-red-100 text-red-700' }
      default: return { text: labels.unknown[lang], color: 'bg-gray-100 text-gray-700' }
    }
  }

  const getSelectedApproachData = (): ProductApproach | undefined => {
    if (!report?.product_approaches?.approaches || !selectedApproach) return undefined
    return report.product_approaches.approaches.find(a => a.id === selectedApproach)
  }

  // 显示加载进度
  if (isLoading) {
    const estimatedSeconds = Math.ceil(LOADING_STEPS_DURATION.reduce((sum, d) => sum + d, 0) / 1000)
    return (
      <LoadingProgress
        currentStep={currentStep}
        progress={progress}
        estimatedTime={estimatedSeconds}
        loadingSteps={loadingSteps}
        waitingTips={waitingTips}
        t={t}
        lang={lang}
      />
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-14 sm:pt-16 bg-gray-50">
        <div className="w-full max-w-sm mx-auto p-4 sm:p-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('report.generateFailed')}</h2>
            <p className="text-sm text-gray-500 mb-6">{error || t('report.retryLater')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                {t('report.retry')}
              </button>
              <button
                onClick={handleRestart}
                className="px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                {t('report.restart')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const selectedApproachData = getSelectedApproachData()

  // Navigation sections - simplified without emojis
  const navSectionsData = translations.report.navSections
  const navSections = [
    { id: 'score', label: navSectionsData.score[lang] },
    { id: 'analysis', label: navSectionsData.analysis[lang] },
    { id: 'market', label: navSectionsData.market[lang] },
    { id: 'approach', label: navSectionsData.approach[lang] },
    { id: 'tech', label: navSectionsData.tech[lang] },
    { id: 'path', label: navSectionsData.path[lang] },
    { id: 'cost', label: navSectionsData.cost[lang] },
  ]

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen pt-14 sm:pt-14 bg-gray-50">
      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* 返回按钮 - 卡片外部 */}
        <button
          onClick={handleRestart}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 sm:mb-5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>{t('report.backToHome')}</span>
        </button>

        {/* 报告卡片容器 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* 报告标题 */}
          <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-gray-100 text-center">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{t('report.title')}</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">justart.today</p>
          </div>

          {/* Tab导航 - 吸顶 */}
          <div className="sticky top-14 z-20 bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide">
            <div className="px-4 sm:px-8 py-2 sm:py-3 flex gap-1 sm:gap-2 sm:justify-center">
              {navSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg whitespace-nowrap transition-colors flex-shrink-0"
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* 报告内容区域 */}
          <div className="px-3 sm:px-6 py-4 sm:py-6">
        {/* Score Card */}
        <div
          id="score"
          className={cn(
            'rounded-lg border p-3 sm:p-6 mb-3 sm:mb-6 bg-white scroll-mt-24 sm:scroll-mt-32',
            getScoreBg(report.score.feasibility)
          )}
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            {/* Score Ring */}
            <div className="flex-shrink-0">
              <ScoreRing score={report.score.feasibility} size={100} strokeWidth={8} />
            </div>

            {/* Score Details */}
            <div className="flex-1 text-center sm:text-left w-full min-w-0">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">{t('report.feasibilityScore')}</div>
              <div className="bg-white/80 rounded-md p-2.5 sm:p-4 border border-gray-100 mb-3 sm:mb-4">
                <p className="text-sm sm:text-base font-medium text-gray-800 break-words sm:leading-relaxed">{report.one_liner_conclusion}</p>
              </div>

              {/* Score Breakdown - 移动端单列，桌面端双列 */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-3 text-sm">
                {[
                  { label: translations.report.scoreBreakdown.tech[lang], value: report.score.breakdown.tech, color: 'bg-indigo-500' },
                  { label: translations.report.scoreBreakdown.market[lang], value: report.score.breakdown.market, color: 'bg-purple-500' },
                  { label: translations.report.scoreBreakdown.onboarding[lang], value: report.score.breakdown.onboarding, color: 'bg-pink-500' },
                  { label: translations.report.scoreBreakdown.userMatch[lang], value: report.score.breakdown.user_match, color: 'bg-cyan-500' },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-md p-2 sm:p-3 min-w-0">
                    <div className="flex justify-between items-center mb-1 sm:mb-1.5 gap-1">
                      <span className="text-gray-500 text-xs sm:text-sm truncate">{item.label}</span>
                      <span className="font-bold text-gray-900 text-xs sm:text-sm flex-shrink-0">{item.value}</span>
                    </div>
                    <div className="h-1 sm:h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-1000', item.color)}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Risks */}
        <div id="analysis" className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-3 sm:mb-6 scroll-mt-24 sm:scroll-mt-32">
          <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              {t('report.whyWorthIt')}
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {report.why_worth_it.map((item, i) => (
                <li key={i} className="flex items-start gap-2 sm:gap-3 text-gray-700">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-xs sm:text-sm sm:leading-relaxed break-words">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              {t('report.risks')}
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {report.risks.map((item, i) => (
                <li key={i} className="flex items-start gap-2 sm:gap-3 text-gray-700">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">!</span>
                  <span className="text-xs sm:text-sm sm:leading-relaxed break-words">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Market Analysis */}
        <div id="market" className="rounded-lg border border-gray-200 bg-white p-3 sm:p-6 mb-3 sm:mb-6 scroll-mt-24 sm:scroll-mt-32">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-5">
            {t('report.marketAnalysis')}
          </h3>
          <div className="space-y-3 sm:space-y-5">
            <div className="p-3 sm:p-4 bg-indigo-50 rounded-md border border-indigo-100">
              <div className="text-xs sm:text-sm font-medium text-indigo-700 mb-1 sm:mb-2">{t('report.opportunity')}</div>
              <p className="text-xs sm:text-sm text-gray-700 sm:leading-relaxed">{report.market_analysis.opportunity}</p>
            </div>

            {report.market_analysis.search_trends && (
              <div>
                <div className="text-xs sm:text-sm font-medium text-gray-600 mb-2">{t('report.searchTrends')}</div>
                <div className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-3 sm:p-4 rounded-md border border-gray-100 sm:leading-relaxed">
                  {report.market_analysis.search_trends}
                </div>
              </div>
            )}

            {report.market_analysis.competitors.length > 0 && (
              <div>
                <div className="text-xs sm:text-sm font-medium text-gray-600 mb-2 sm:mb-3">{t('report.competitors')}</div>
                <div className="grid gap-2 sm:gap-4">
                  {report.market_analysis.competitors.map((comp, i) => (
                    <div key={i} className="p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-md">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="font-medium text-sm sm:text-base text-gray-900">{comp.name}</div>
                        {comp.url && (
                          <a href={comp.url} target="_blank" className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 hover:underline">
                            {t('report.view')} →
                          </a>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
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
          <div id="approach" className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 mb-3 sm:mb-6 scroll-mt-24 sm:scroll-mt-32">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1">
              {t('report.productApproach')}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-5">{t('report.approachDesc')}</p>

            <div className="grid gap-3 sm:gap-4 mb-3 sm:mb-5">
              {report.product_approaches.approaches.map((approach) => {
                const isSelected = selectedApproach === approach.id
                const isRecommended = approach.id === report.product_approaches.recommended_id
                const complexity = getComplexityLabel(approach.complexity)

                return (
                  <button
                    key={approach.id}
                    onClick={() => setSelectedApproach(approach.id)}
                    className={cn(
                      'text-left p-3 sm:p-5 rounded-md border-2 transition-all',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-100 bg-white hover:border-indigo-200'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm sm:text-base text-gray-900">{approach.name}</span>
                        {isRecommended && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{t('report.recommended')}</span>
                        )}
                      </div>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full flex-shrink-0', complexity.color)}>
                        {complexity.text}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 sm:leading-relaxed">{approach.description}</p>

                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 flex-wrap">
                      {approach.workflow.slice(0, 3).map((step, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          <span className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">{step.action}</span>
                          {idx < Math.min(approach.workflow.length, 3) - 1 && <span>→</span>}
                        </span>
                      ))}
                      {approach.workflow.length > 3 && <span className="text-gray-400">...</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div className="text-green-600">✓ {approach.pros[0]}</div>
                      <div className="text-amber-600">⚠ {approach.cons[0]}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="p-2.5 sm:p-4 bg-blue-50 border border-blue-100 rounded-md text-xs sm:text-sm text-blue-800 sm:leading-relaxed">
              <span className="font-medium">{t('report.suggestion')}</span>
              {report.product_approaches.recommendation_reason}
            </div>

            {selectedApproachData && (
              <div className="mt-3 sm:mt-5 p-3 sm:p-5 bg-gray-50 rounded-md border border-gray-100">
                <h4 className="font-medium text-sm sm:text-base text-gray-900 mb-3 sm:mb-5">{t('report.detailFlow')}</h4>
                <div className="space-y-4 sm:space-y-5">
                  {selectedApproachData.workflow.map((step) => (
                    <div key={step.step} className="flex items-start gap-3 sm:gap-4">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0">
                        {step.step}
                      </div>
                      <div>
                        <div className="font-medium text-sm sm:text-base text-gray-900">{step.action}</div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 sm:leading-relaxed">{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-green-700 mb-2 sm:mb-3">{t('report.pros')}</div>
                    <ul className="space-y-2 sm:space-y-3">
                      {selectedApproachData.pros.map((pro, i) => (
                        <li key={i} className="text-xs sm:text-sm text-gray-600 flex items-start gap-1.5 sm:gap-2 leading-relaxed">
                          <span className="text-green-500 flex-shrink-0">✓</span> {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-amber-700 mb-2 sm:mb-3">{t('report.cons')}</div>
                    <ul className="space-y-2 sm:space-y-3">
                      {selectedApproachData.cons.map((con, i) => (
                        <li key={i} className="text-xs sm:text-sm text-gray-600 flex items-start gap-1.5 sm:gap-2 leading-relaxed">
                          <span className="text-amber-500 flex-shrink-0">⚠</span> {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 sm:mt-5 text-xs sm:text-sm text-gray-500">
                  <span className="font-medium">{t('report.bestFor')}</span>{selectedApproachData.best_for}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tech Stack */}
        <div id="tech" className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 mb-3 sm:mb-6 scroll-mt-24 sm:scroll-mt-32">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-5">
            {t('report.techOptions')}
          </h3>

          <div className="space-y-4 sm:space-y-5">
            {/* Option A - China Stack */}
            <div className="border border-gray-200 rounded-md p-4 sm:p-5 bg-gray-50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-medium text-sm sm:text-base text-gray-900">
                    {report.tech_options.option_a.name}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1">{report.tech_options.option_a.fit_for}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-green-600 font-medium text-sm sm:text-base">{report.tech_options.option_a.cost}</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-0.5">{report.tech_options.option_a.dev_time}</div>
                </div>
              </div>

              {/* Tools with purposes */}
              <div className="mb-4">
                <div className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3">{t('report.techStack')}</div>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(report.tech_options.option_a.tools) ? report.tech_options.option_a.tools : []).map((tool: string | { name: string; purpose: string }, i: number) => (
                    <div key={i} className="bg-white border border-gray-200 rounded px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
                      {typeof tool === 'string' ? (
                        <span className="font-medium text-gray-700">{tool}</span>
                      ) : (
                        <>
                          <span className="font-medium text-gray-900">{tool.name}</span>
                          <span className="text-gray-400 mx-1">·</span>
                          <span className="text-gray-500">{tool.purpose}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs sm:text-sm text-gray-600 bg-white rounded p-2.5 sm:p-3 border border-gray-100 sm:leading-relaxed">
                <span className="font-medium text-gray-700">{t('report.capability')}</span>{report.tech_options.option_a.capability}
              </div>
            </div>

            {/* Option B - Global Stack */}
            <div className="border border-blue-200 rounded-md p-4 sm:p-5 bg-blue-50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-medium text-sm sm:text-base text-gray-900">
                    {report.tech_options.option_b.name}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-600 mt-1">{report.tech_options.option_b.fit_for}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-green-600 font-medium text-sm sm:text-base">{report.tech_options.option_b.cost}</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-0.5">{report.tech_options.option_b.dev_time}</div>
                </div>
              </div>

              {/* Tools with purposes */}
              <div className="mb-4">
                <div className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3">{t('report.techStack')}</div>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(report.tech_options.option_b.tools) ? report.tech_options.option_b.tools : []).map((tool: string | { name: string; purpose: string }, i: number) => (
                    <div key={i} className="bg-white border border-blue-200 rounded px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
                      {typeof tool === 'string' ? (
                        <span className="font-medium text-gray-700">{tool}</span>
                      ) : (
                        <>
                          <span className="font-medium text-gray-900">{tool.name}</span>
                          <span className="text-gray-400 mx-1">·</span>
                          <span className="text-gray-500">{tool.purpose}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs sm:text-sm text-gray-600 bg-white rounded p-2.5 sm:p-3 border border-blue-100 sm:leading-relaxed">
                <span className="font-medium text-gray-700">{t('report.capability')}</span>{report.tech_options.option_b.capability}
              </div>
            </div>

            {/* Option C - Vibe Coder Stack */}
            {report.tech_options.option_c && (
              <div className="border-2 border-indigo-300 rounded-md p-4 sm:p-5 bg-indigo-50 relative">
                <div className="absolute top-2 right-2 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded">
                  {t('report.recommended')}
                </div>
                <div className="flex items-start justify-between mb-4 pr-20 sm:pr-24">
                  <div>
                    <div className="font-medium text-sm sm:text-base text-gray-900">
                      {report.tech_options.option_c.name}
                    </div>
                    <div className="text-xs sm:text-sm text-indigo-600 mt-1">{report.tech_options.option_c.fit_for}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-green-600 font-medium text-sm sm:text-base">{report.tech_options.option_c.cost}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-0.5">{report.tech_options.option_c.dev_time}</div>
                  </div>
                </div>

                {/* Tools with purposes - highlighted */}
                <div className="mb-4">
                  <div className="text-xs sm:text-sm font-medium text-indigo-600 mb-2 sm:mb-3">{t('report.vibeToolchain')}</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {(Array.isArray(report.tech_options.option_c.tools) ? report.tech_options.option_c.tools : []).map((tool: string | { name: string; purpose: string }, i: number) => (
                      <div key={i} className="bg-white border border-indigo-200 rounded p-2.5 sm:p-3 text-center">
                        {typeof tool === 'string' ? (
                          <span className="font-medium text-gray-700 text-xs sm:text-sm">{tool}</span>
                        ) : (
                          <>
                            <div className="font-medium text-indigo-700 text-xs sm:text-sm">{tool.name}</div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">{tool.purpose}</div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-gray-600 bg-white/80 rounded p-2.5 sm:p-3 border border-indigo-100 sm:leading-relaxed">
                  <span className="font-medium text-gray-700">{t('report.capability')}</span>{report.tech_options.option_c.capability}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 sm:mt-5 p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-md text-xs sm:text-sm text-blue-800 sm:leading-relaxed">
            <span className="font-medium">{t('report.suggestion')}</span>
            {report.tech_options.advice}
          </div>
        </div>

        {/* Fastest Path */}
        <div id="path" className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 mb-3 sm:mb-6 scroll-mt-24 sm:scroll-mt-32">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-5">
            {t('report.fastestPath')}
          </h3>
          <div className="space-y-3 sm:space-y-5">
            {report.fastest_path.map((step, i) => (
              <div key={i} className="relative pl-8 sm:pl-12">
                <div className="absolute left-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium text-xs sm:text-sm">
                  {i + 1}
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-md p-3 sm:p-5">
                  <div className="font-medium text-sm sm:text-base text-gray-900 mb-1.5 sm:mb-2">{step.title}</div>
                  <p className="text-xs sm:text-sm text-gray-600 sm:leading-relaxed whitespace-pre-line mb-3 sm:mb-4">{step.description}</p>
                  {step.copy_text && (
                    <div
                      className="bg-white border border-gray-200 p-2.5 sm:p-4 rounded text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 cursor-pointer hover:bg-gray-50 transition-colors group sm:leading-relaxed whitespace-pre-line"
                      onClick={() => navigator.clipboard.writeText(step.copy_text!)}
                      title={t('report.clickToCopy')}
                    >
                      <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-500">{t('report.copyablePrompt')}</span>
                        <span className="text-xs sm:text-sm text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">{t('report.clickToCopy')}</span>
                      </div>
                      {step.copy_text}
                    </div>
                  )}
                  {step.action_url && (
                    <a
                      href={step.action_url}
                      target="_blank"
                      className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      {step.action_label || t('report.goExecute')}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost & Pitfalls */}
        <div id="cost" className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-3 sm:mb-6 scroll-mt-24 sm:scroll-mt-32">
          {/* Cost Estimate */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-5">
              {t('report.costEstimate')}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-blue-50 rounded-md border border-blue-100">
                <div className="text-xs sm:text-sm font-medium text-blue-600 mb-1 sm:mb-2">{t('report.timeInvestment')}</div>
                <div className="text-xs sm:text-sm text-gray-800 sm:leading-relaxed">{report.cost_estimate.time_breakdown}</div>
              </div>
              <div className="p-3 sm:p-4 bg-green-50 rounded-md border border-green-100">
                <div className="text-xs sm:text-sm font-medium text-green-600 mb-1 sm:mb-2">{t('report.moneyInvestment')}</div>
                <div className="text-xs sm:text-sm text-gray-800 sm:leading-relaxed">{report.cost_estimate.money_breakdown}</div>
              </div>
            </div>
          </div>

          {/* Pitfall Guide */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-5">
              {t('report.pitfallGuide')}
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {report.pitfalls.map((pit, i) => (
                <li key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-orange-50 rounded-md border border-orange-100">
                  <span className="flex-shrink-0 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-xs sm:text-sm font-medium mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-800 sm:leading-relaxed">{pit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>


        {/* Feedback */}
        <div className="mb-6 sm:mb-8 text-center p-4 sm:p-6 bg-white rounded-lg border border-gray-200">
          {feedbackSubmitted ? (
            <div className="py-2">
              <h3 className="text-sm sm:text-base text-gray-700 font-medium">{t('report.feedback.thanks')}</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">{t('report.feedback.thanksDesc')}</p>
            </div>
          ) : (
            <>
              <h3 className="text-sm sm:text-base text-gray-700 font-medium mb-3 sm:mb-4">{t('report.feedback.title')}</h3>
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    setFeedbackRating('helpful')
                    setFeedbackModalOpen(true)
                  }}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-all text-green-700 text-sm sm:text-base"
                >
                  {t('report.feedback.helpful')}
                </button>
                <button
                  onClick={() => {
                    setFeedbackRating('not_helpful')
                    setFeedbackModalOpen(true)
                  }}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-all text-gray-600 text-sm sm:text-base"
                >
                  {t('report.feedback.notHelpful')}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4">
                {t('report.feedback.privacyNote')}
              </p>
            </>
          )}
        </div>

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          rating={feedbackRating}
          conversationId={conversationId}
          reportScore={report.score.feasibility}
          onSubmitSuccess={() => setFeedbackSubmitted(true)}
        />

        {/* Actions */}
        <div className="flex items-center justify-center pt-4 sm:pt-6 pb-2">
          <button
            onClick={handleRestart}
            className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-md text-sm sm:text-base text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {t('report.evalNewProject')}
          </button>
        </div>
          </div>
          {/* 报告内容区域结束 */}
        </div>
        {/* 报告卡片容器结束 */}
      </div>

      {/* 浮动分享按钮 */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all',
              copySuccess
                ? 'bg-green-500 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl'
            )}
          >
            {copySuccess ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">{t('report.copied')}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="text-sm font-medium">{t('report.share')}</span>
              </>
            )}
          </button>

          {/* 分享菜单 */}
          {showShareMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
              <div className="absolute bottom-full right-0 mb-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {t('report.shareMenu.copyLink')}
                </button>
                {typeof window !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={() => handleShare('native')}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {t('report.shareMenu.systemShare')}
                  </button>
                )}
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => handleShare('weibo')}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <span className="w-4 h-4 flex items-center justify-center text-red-500 text-xs">微</span>
                  {t('report.shareMenu.weibo')}
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <span className="w-4 h-4 flex items-center justify-center text-blue-400 text-xs">𝕏</span>
                  Twitter
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
