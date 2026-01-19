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

// 可折叠区块组件 - 仅移动端可折叠
function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  className = '',
}: {
  title: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between sm:cursor-default"
      >
        <span>{title}</span>
        <svg
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform sm:hidden',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={cn(
        'overflow-hidden transition-all duration-300',
        isOpen ? 'max-h-[2000px] opacity-100 mt-3 sm:mt-4' : 'max-h-0 opacity-0 sm:max-h-[2000px] sm:opacity-100 sm:mt-4'
      )}>
        {children}
      </div>
    </div>
  )
}

// 进度加载组件
function LoadingProgress({
  currentStep,
  progress,
  estimatedTime,
  loadingSteps,
  waitingTips,
  t,
  lang,
  apiProgress,
}: {
  currentStep: number
  progress: number
  estimatedTime: number
  loadingSteps: readonly { id: string; label: { zh: string; en: string } }[]
  waitingTips: readonly { zh: string; en: string }[]
  t: (key: string, params?: Record<string, string | number>) => string
  lang: 'zh' | 'en'
  apiProgress?: number // 真实 API 进度
}) {
  const [tipIndex, setTipIndex] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [dotCount, setDotCount] = useState(1)

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

  // 动态省略号动画
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev % 3) + 1)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // 计算显示进度：结合模拟进度和真实 API 进度
  // 当进度 > 80% 时放慢速度，让用户感觉更真实
  let displayProgress = progress
  if (apiProgress !== undefined && apiProgress > 0) {
    // 使用 API 进度，但确保不会倒退
    displayProgress = Math.max(progress, apiProgress)
  }
  // 在最后阶段（>85%）缓慢增长，避免卡在99%
  if (displayProgress >= 85 && displayProgress < 100) {
    const slowFactor = 0.3 // 放慢速度
    displayProgress = 85 + (displayProgress - 85) * slowFactor
  }

  const remainingTime = Math.max(0, estimatedTime - elapsedTime)
  const isLastStep = currentStep >= loadingSteps.length - 1
  const dots = '.'.repeat(dotCount)

  // 最后阶段的子状态提示
  const lastStepSubStatus = lang === 'zh'
    ? ['正在分析市场数据', '正在生成技术方案', '正在整合建议', '即将完成']
    : ['Analyzing market data', 'Generating tech options', 'Compiling recommendations', 'Almost there']
  const subStatusIndex = Math.min(Math.floor(elapsedTime / 5) % lastStepSubStatus.length, lastStepSubStatus.length - 1)

  return (
    <div className="min-h-screen pt-14 sm:pt-16 pb-8 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-lg mx-auto">
        {/* 标题 */}
        <div className="text-center mb-6 sm:mb-8 mt-4">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{t('report.generating')}</h1>
          <p className="text-sm text-gray-500">
            {isLastStep
              ? (lang === 'zh' ? '报告生成中，请稍候' : 'Generating report, please wait')
              : (remainingTime > 0 ? t('report.estimatedTime', { time: remainingTime }) : t('report.almostDone'))
            }
          </p>
        </div>

        {/* 进度条 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">{t('report.overallProgress')}</span>
              <span className="text-indigo-600 font-medium">{Math.round(displayProgress)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>

          {/* 步骤列表 */}
          <div className="space-y-2">
            {loadingSteps.map((step, idx) => {
              const isCompleted = idx < currentStep
              const isCurrent = idx === currentStep
              const isPending = idx > currentStep
              const isLast = idx === loadingSteps.length - 1

              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center gap-3 py-2 px-3 rounded-md transition-all duration-300',
                    isCompleted && 'bg-gray-50',
                    isCurrent && 'bg-indigo-50',
                    isPending && 'opacity-40'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-all flex-shrink-0',
                    isCompleted && 'bg-indigo-600 text-white',
                    isCurrent && 'bg-indigo-500 text-white',
                    isCurrent && isLast && 'animate-pulse',
                    isPending && 'bg-gray-200 text-gray-500'
                  )}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      'text-sm',
                      isCompleted && 'text-gray-700',
                      isCurrent && 'text-indigo-700 font-medium',
                      isPending && 'text-gray-500'
                    )}>
                      {step.label[lang]}
                      {isCurrent && !isLast && <span className="ml-2 text-indigo-500 hidden sm:inline">{t('report.processing')}</span>}
                    </span>
                    {/* 最后一步显示子状态 */}
                    {isCurrent && isLast && (
                      <div className="text-xs text-indigo-500 mt-0.5 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                        {lastStepSubStatus[subStatusIndex]}{dots}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 提示语卡片 - 合并所有提示到一个区域 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-gray-600 text-sm">
            💡 {waitingTips[tipIndex][lang]}
          </p>
        </div>
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
  const [apiProgress, setApiProgress] = useState(0) // 真实 API 进度
  const startTimeRef = useRef(Date.now())

  // 渐进式展示状态：控制各模块依次显示
  // 0: 全隐藏, 1: 评分, 2: 优势/风险, 3: 市场, 4: 方案, 5: 技术栈, 6: 路径/成本, 7: 反馈
  const [revealStep, setRevealStep] = useState(0)
  const revealStartedRef = useRef(false)
  const REVEAL_DELAY = 200 // 每批间隔时间(ms)
  const TOTAL_REVEAL_STEPS = 7

  // 当前活动的导航区块
  const [activeSection, setActiveSection] = useState('score')

  // 模拟进度推进 - 只增不减
  useEffect(() => {
    if (!isLoading) return

    const totalDuration = LOADING_STEPS_DURATION.reduce((sum, d) => sum + d, 0)
    let elapsed = 0

    const interval = setInterval(() => {
      elapsed += 200

      // 计算当前步骤 - 只增不减
      let cumulative = 0
      for (let i = 0; i < LOADING_STEPS_DURATION.length; i++) {
        cumulative += LOADING_STEPS_DURATION[i]
        if (elapsed < cumulative) {
          setCurrentStep(prev => Math.max(prev, i))
          break
        }
      }

      // 计算进度（最多到95%，剩下的等API返回）- 只增不减
      const rawProgress = (elapsed / totalDuration) * 100
      setProgress(prev => Math.max(prev, Math.min(rawProgress, 95)))

    }, 200)

    return () => clearInterval(interval)
  }, [isLoading])

  // 渐进式展示动画：报告加载完成后，依次显示各模块
  useEffect(() => {
    if (isLoading || !report) {
      // 重置状态
      setRevealStep(0)
      revealStartedRef.current = false
      return
    }

    // 防止重复触发
    if (revealStartedRef.current) return
    revealStartedRef.current = true

    // 稍微延迟开始，让页面先渲染
    const startTimer = setTimeout(() => {
      setRevealStep(1)
    }, 50)

    const timers: NodeJS.Timeout[] = [startTimer]
    for (let i = 2; i <= TOTAL_REVEAL_STEPS; i++) {
      timers.push(setTimeout(() => {
        setRevealStep(i)
      }, 50 + (i - 1) * REVEAL_DELAY))
    }

    return () => timers.forEach(t => clearTimeout(t))
  }, [isLoading, report])

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
                // 基于实际内容长度估算进度（完整报告约3000-5000字符）
                const estimatedProgress = Math.min((data.length / 4000) * 100, 95)
                setApiProgress(prev => Math.max(prev, estimatedProgress))
                // 当 API 进度超过模拟进度时，同步更新
                setProgress(prev => Math.max(prev, estimatedProgress * 0.9))
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

  const getScoreBg = () => {
    return 'bg-gray-50 border-gray-200'
  }

  const getComplexityLabel = (complexity: string) => {
    const labels = translations.report.complexity
    switch (complexity) {
      case 'low': return { text: labels.low[lang], color: 'text-gray-500' }
      case 'medium': return { text: labels.medium[lang], color: 'text-gray-500' }
      case 'high': return { text: labels.high[lang], color: 'text-gray-500' }
      default: return { text: labels.unknown[lang], color: 'text-gray-500' }
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
        apiProgress={apiProgress}
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
                className="px-5 py-2.5 bg-white text-gray-600 text-sm font-medium rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
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

  // 渐进式展示动画样式
  const getRevealClass = (step: number) => cn(
    'transition-all duration-300 ease-out',
    revealStep >= step
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-6'
  )

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
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // 滚动监听 - 检测当前可见区块
  useEffect(() => {
    if (isLoading) return

    const sectionIds = ['score', 'analysis', 'market', 'approach', 'tech', 'path', 'cost']

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150 // 偏移量，考虑固定导航

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i])
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // 初始化

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLoading])

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
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 text-center">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{t('report.title')}</h1>
          </div>

          {/* Tab导航 - 吸顶 */}
          <div className="sticky top-14 z-20 bg-white border-b border-gray-200 shadow-sm overflow-x-auto scrollbar-hide">
            <div className="px-3 sm:px-8 py-2.5 sm:py-3 flex gap-1.5 sm:gap-2 sm:justify-center">
              {navSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "px-3 sm:px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all flex-shrink-0 border cursor-pointer",
                    activeSection === section.id
                      ? "text-indigo-600 bg-indigo-50 border-indigo-200 font-medium"
                      : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 border-transparent hover:border-indigo-200"
                  )}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* 报告内容区域 */}
          <div className="px-3 sm:px-6 py-4 sm:py-6">
        {/* Score Card - 批次1 */}
        <div
          id="score"
          className={cn(
            'rounded-lg border p-4 sm:p-6 mb-4 sm:mb-6 scroll-mt-24 sm:scroll-mt-32',
            getScoreBg(),
            getRevealClass(1)
          )}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Score Ring */}
            <div className="flex-shrink-0">
              <ScoreRing score={report.score.feasibility} size={100} strokeWidth={8} />
            </div>

            {/* Score Details */}
            <div className="flex-1 text-left w-full min-w-0">
              <div className="text-sm text-gray-500 mb-1">{t('report.feasibilityScore')}</div>
              <div className="bg-white/80 rounded-md p-3 sm:p-4 border border-gray-100 mb-4">
                <p className="text-base font-medium text-gray-800 break-words leading-relaxed">{report.one_liner_conclusion}</p>
              </div>

              {/* Score Breakdown - 移动端单列，桌面端双列 */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[
                  { label: translations.report.scoreBreakdown.tech[lang], value: report.score.breakdown.tech },
                  { label: translations.report.scoreBreakdown.market[lang], value: report.score.breakdown.market },
                  { label: translations.report.scoreBreakdown.onboarding[lang], value: report.score.breakdown.onboarding },
                  { label: translations.report.scoreBreakdown.userMatch[lang], value: report.score.breakdown.user_match },
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded-md p-2.5 sm:p-3 min-w-0 border border-gray-100">
                    <div className="flex justify-between items-center mb-1.5 gap-1">
                      <span className="text-gray-500 text-sm truncate">{item.label}</span>
                      <span className="font-medium text-gray-900 text-sm flex-shrink-0">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 bg-indigo-500"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Risks - 批次2 */}
        <div id="analysis" className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-6 scroll-mt-24 sm:scroll-mt-32", getRevealClass(2))}>
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              {t('report.whyWorthIt')}
            </h3>
            <ul className="space-y-3">
              {report.why_worth_it.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="text-gray-400 mt-0.5 flex-shrink-0">+</span>
                  <span className="text-sm leading-relaxed break-words">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              {t('report.risks')}
            </h3>
            <ul className="space-y-3">
              {report.risks.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="text-gray-400 mt-0.5 flex-shrink-0">-</span>
                  <span className="text-sm leading-relaxed break-words">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Market Analysis */}
        {/* Market Analysis - 批次3 */}
        <div id="market" className={cn("rounded-lg border border-gray-200 bg-white p-4 sm:p-6 mb-4 sm:mb-6 scroll-mt-24 sm:scroll-mt-32", getRevealClass(3))}>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-5">
            {t('report.marketAnalysis')}
          </h3>
          <div className="space-y-4 sm:space-y-5">
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-500 mb-2">{t('report.opportunity')}</div>
              <p className="text-sm text-gray-700 leading-relaxed">{report.market_analysis.opportunity}</p>
            </div>

            {report.market_analysis.search_trends && (
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500 mb-2">{t('report.searchTrends')}</div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {report.market_analysis.search_trends}
                </div>
              </div>
            )}

            {report.market_analysis.competitors.length > 0 && (
              <CollapsibleSection
                title={<span className="text-sm text-gray-500">{t('report.competitors')} ({report.market_analysis.competitors.length})</span>}
                defaultOpen={false}
              >
                <div className="grid gap-3 sm:gap-4">
                  {report.market_analysis.competitors.map((comp, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium text-base text-gray-900">{comp.name}</div>
                        {comp.url && (
                          <a href={comp.url} target="_blank" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
                            {t('report.view')} →
                          </a>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                        <div className="text-gray-600">+ {comp.pros}</div>
                        <div className="text-gray-500">- {comp.cons}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}
          </div>
        </div>

        {/* Product Approach Selection */}
        {report.product_approaches && report.product_approaches.approaches.length > 0 && (
          <div id="approach" className={cn("rounded-lg border border-gray-200 bg-white p-4 sm:p-6 mb-4 sm:mb-6 scroll-mt-24 sm:scroll-mt-32", getRevealClass(4))}>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
              {t('report.productApproach')}
            </h3>
            <p className="text-sm text-gray-500 mb-4 sm:mb-5">{t('report.approachDesc')}</p>

            <div className="grid gap-4 mb-4 sm:mb-5">
              {report.product_approaches.approaches.map((approach) => {
                const isSelected = selectedApproach === approach.id
                const isRecommended = approach.id === report.product_approaches.recommended_id
                const complexity = getComplexityLabel(approach.complexity)

                return (
                  <button
                    key={approach.id}
                    onClick={() => setSelectedApproach(approach.id)}
                    className={cn(
                      'text-left p-4 sm:p-5 rounded-md border transition-all',
                      isSelected
                        ? 'border-indigo-500 bg-gray-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-base text-gray-900">{approach.name}</span>
                        {isRecommended && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{t('report.recommended')}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {complexity.text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{approach.description}</p>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 flex-wrap">
                      {approach.workflow.slice(0, 3).map((step, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          <span className="bg-gray-100 px-2 py-1 rounded text-sm">{step.action}</span>
                          {idx < Math.min(approach.workflow.length, 3) - 1 && <span className="text-gray-400">→</span>}
                        </span>
                      ))}
                      {approach.workflow.length > 3 && <span className="text-gray-400">...</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                      <div className="text-gray-600">+ {approach.pros[0]}</div>
                      <div className="text-gray-500">- {approach.cons[0]}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="p-4 bg-gray-50 rounded-md text-sm text-gray-600 leading-relaxed">
              <span className="text-gray-500">{t('report.suggestion')}</span>
              {report.product_approaches.recommendation_reason}
            </div>

            {selectedApproachData && (
              <CollapsibleSection
                title={<h4 className="font-medium text-base text-gray-900">{t('report.detailFlow')}</h4>}
                defaultOpen={false}
                className="mt-4 sm:mt-5 p-4 sm:p-5 bg-gray-50 rounded-md"
              >
                <div className="space-y-4 sm:space-y-5">
                  {selectedApproachData.workflow.map((step) => (
                    <div key={step.step} className="flex items-start gap-4">
                      <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {step.step}
                      </div>
                      <div>
                        <div className="font-medium text-base text-gray-900">{step.action}</div>
                        <div className="text-sm text-gray-600 mt-1 leading-relaxed">{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-3">{t('report.pros')}</div>
                    <ul className="space-y-3">
                      {selectedApproachData.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2 leading-relaxed">
                          <span className="text-gray-400 flex-shrink-0">+</span> {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-3">{t('report.cons')}</div>
                    <ul className="space-y-3">
                      {selectedApproachData.cons.map((con, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2 leading-relaxed">
                          <span className="text-gray-400 flex-shrink-0">-</span> {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 text-sm text-gray-500">
                  <span>{t('report.bestFor')}</span>{selectedApproachData.best_for}
                </div>
              </CollapsibleSection>
            )}
          </div>
        )}

        {/* Tech Stack */}
        {/* Tech Stack - 批次5 */}
        <div id="tech" className={cn("rounded-lg border border-gray-200 bg-white p-4 sm:p-6 mb-4 sm:mb-6 scroll-mt-24 sm:scroll-mt-32", getRevealClass(5))}>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-5">
            {t('report.techOptions')}
          </h3>

          <div className="space-y-4 sm:space-y-5">
            {/* Option A - China Stack */}
            <CollapsibleSection
              title={
                <div className="flex items-start justify-between w-full pr-6 gap-4">
                  <div>
                    <div className="font-medium text-base text-gray-900">{report.tech_options.option_a.name}</div>
                    <div className="text-sm text-gray-500 mt-2">{report.tech_options.option_a.fit_for}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-gray-900 font-medium text-base">{report.tech_options.option_a.cost}</div>
                    <div className="text-sm text-gray-500 mt-1">{report.tech_options.option_a.dev_time}</div>
                  </div>
                </div>
              }
              defaultOpen={false}
              className="border border-gray-200 rounded-md p-4 sm:p-6"
            >
              {/* Tools with purposes */}
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-3">{t('report.techStack')}</div>
                <div className="space-y-2">
                  {(Array.isArray(report.tech_options.option_a.tools) ? report.tech_options.option_a.tools : []).map((tool: string | { name: string; purpose: string }, i: number) => (
                    <div key={i} className="border border-gray-200 rounded px-3 py-2.5 text-sm">
                      {typeof tool === 'string' ? (
                        <span className="text-gray-700">{tool}</span>
                      ) : (
                        <>
                          <span className="font-medium text-gray-900">{tool.name}</span>
                          <span className="text-gray-300 mx-2">·</span>
                          <span className="text-gray-500">{tool.purpose}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-600 leading-relaxed">
                <span className="text-gray-500">{t('report.capability')}</span>{report.tech_options.option_a.capability}
              </div>
            </CollapsibleSection>

            {/* Option B - Global Stack */}
            <CollapsibleSection
              title={
                <div className="flex items-start justify-between w-full pr-6 gap-4">
                  <div>
                    <div className="font-medium text-base text-gray-900">{report.tech_options.option_b.name}</div>
                    <div className="text-sm text-gray-500 mt-2">{report.tech_options.option_b.fit_for}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-gray-900 font-medium text-base">{report.tech_options.option_b.cost}</div>
                    <div className="text-sm text-gray-500 mt-1">{report.tech_options.option_b.dev_time}</div>
                  </div>
                </div>
              }
              defaultOpen={false}
              className="border border-gray-200 rounded-md p-4 sm:p-6"
            >
              {/* Tools with purposes */}
              <div className="mb-5">
                <div className="text-sm text-gray-500 mb-3">{t('report.techStack')}</div>
                <div className="space-y-2">
                  {(Array.isArray(report.tech_options.option_b.tools) ? report.tech_options.option_b.tools : []).map((tool: string | { name: string; purpose: string }, i: number) => (
                    <div key={i} className="border border-gray-200 rounded px-3 py-2.5 text-sm">
                      {typeof tool === 'string' ? (
                        <span className="text-gray-700">{tool}</span>
                      ) : (
                        <>
                          <span className="font-medium text-gray-900">{tool.name}</span>
                          <span className="text-gray-300 mx-2">·</span>
                          <span className="text-gray-500">{tool.purpose}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-600 leading-relaxed">
                <span className="text-gray-500">{t('report.capability')}</span>{report.tech_options.option_b.capability}
              </div>
            </CollapsibleSection>

            {/* Option C - Vibe Coder Stack */}
            {report.tech_options.option_c && (
              <div className="border border-gray-200 rounded-md p-4 sm:p-6 relative">
                <div className="absolute top-3 right-3 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                  {t('report.recommended')}
                </div>
                <div className="flex items-start justify-between mb-6 pr-16 sm:pr-20 gap-4">
                  <div>
                    <div className="font-medium text-base text-gray-900">
                      {report.tech_options.option_c.name}
                    </div>
                    <div className="text-sm text-indigo-600 mt-2">{report.tech_options.option_c.fit_for}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-indigo-600 font-medium text-base">{report.tech_options.option_c.cost}</div>
                    <div className="text-sm text-gray-500 mt-1">{report.tech_options.option_c.dev_time}</div>
                  </div>
                </div>

                {/* Tools with purposes */}
                <div className="mb-5">
                  <div className="text-sm text-gray-500 mb-3">{t('report.vibeToolchain')}</div>
                  <div className="space-y-2">
                    {(Array.isArray(report.tech_options.option_c.tools) ? report.tech_options.option_c.tools : []).map((tool: string | { name: string; purpose: string }, i: number) => (
                      <div key={i} className="border border-gray-200 rounded px-3 py-2.5 text-sm">
                        {typeof tool === 'string' ? (
                          <span className="text-gray-700">{tool}</span>
                        ) : (
                          <>
                            <span className="font-medium text-gray-900">{tool.name}</span>
                            <span className="text-gray-300 mx-2">·</span>
                            <span className="text-gray-500">{tool.purpose}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-600 leading-relaxed">
                  <span className="text-gray-500">{t('report.capability')}</span>{report.tech_options.option_c.capability}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 p-4 bg-gray-50 rounded-md text-sm text-gray-600 leading-relaxed">
            <span className="text-gray-500">{t('report.suggestion')}</span>
            {report.tech_options.advice}
          </div>
        </div>

        {/* Fastest Path */}
        {/* Fastest Path - 批次6 */}
        <div id="path" className={cn("rounded-lg border border-gray-200 bg-white p-4 sm:p-6 mb-4 sm:mb-6 scroll-mt-24 sm:scroll-mt-32", getRevealClass(6))}>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-5">
            {t('report.fastestPath')}
          </h3>
          <div className="space-y-4 sm:space-y-5">
            {report.fastest_path.map((step, i) => (
              <div key={i} className="relative pl-10 sm:pl-12">
                <div className="absolute left-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-medium text-sm">
                  {i + 1}
                </div>
                <div className="bg-gray-50 rounded-md p-4 sm:p-5">
                  <div className="font-medium text-base text-gray-900 mb-2">{step.title}</div>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-4">{step.description}</p>
                  {step.copy_text && (
                    <div
                      className="bg-white border border-gray-200 p-4 rounded text-sm text-gray-700 mb-4 cursor-pointer hover:bg-gray-100 transition-colors group leading-relaxed whitespace-pre-line"
                      onClick={() => navigator.clipboard.writeText(step.copy_text!)}
                      title={t('report.clickToCopy')}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">{t('report.copyablePrompt')}</span>
                        <span className="text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{t('report.clickToCopy')}</span>
                      </div>
                      {step.copy_text}
                    </div>
                  )}
                  {step.action_url && (
                    <a
                      href={step.action_url}
                      target="_blank"
                      className="inline-block px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
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
        {/* Cost & Pitfalls - 批次6 */}
        <div id="cost" className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-6 scroll-mt-24 sm:scroll-mt-32", getRevealClass(6))}>
          {/* Cost Estimate */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-5">
              {t('report.costEstimate')}
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500 mb-2">{t('report.timeInvestment')}</div>
                <div className="text-sm text-gray-900 leading-relaxed">{report.cost_estimate.time_breakdown}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500 mb-2">{t('report.moneyInvestment')}</div>
                <div className="text-sm text-gray-900 leading-relaxed">{report.cost_estimate.money_breakdown}</div>
              </div>
            </div>
          </div>

          {/* Pitfall Guide */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-5">
              {t('report.pitfallGuide')}
            </h3>
            <ul className="space-y-3">
              {report.pitfalls.map((pit, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 leading-relaxed">{pit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>


        {/* Feedback - 批次7 */}
        <div className={cn("mb-6 sm:mb-8 text-center p-4 sm:p-6 bg-white rounded-lg border border-gray-200", getRevealClass(7))}>
          {feedbackSubmitted ? (
            <div className="py-2">
              <h3 className="text-base text-gray-700 font-medium">{t('report.feedback.thanks')}</h3>
              <p className="text-sm text-gray-400 mt-1">{t('report.feedback.thanksDesc')}</p>
            </div>
          ) : (
            <>
              <h3 className="text-base text-gray-700 font-medium mb-4">{t('report.feedback.title')}</h3>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setFeedbackRating('helpful')
                    setFeedbackModalOpen(true)
                  }}
                  className="px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-all text-gray-700 text-base"
                >
                  {t('report.feedback.helpful')}
                </button>
                <button
                  onClick={() => {
                    setFeedbackRating('not_helpful')
                    setFeedbackModalOpen(true)
                  }}
                  className="px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-all text-gray-700 text-base"
                >
                  {t('report.feedback.notHelpful')}
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-4">
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
          lang={lang}
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
                ? 'bg-indigo-500 text-white'
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
