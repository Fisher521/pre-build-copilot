'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function ScoreRing({ score, size = 140, strokeWidth = 10, className }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  // Animation effect
  useEffect(() => {
    const duration = 1000
    const start = Date.now()

    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(score * eased))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [score])

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  const getScoreColor = (s: number) => {
    if (s >= 80) return { stroke: '#10B981', bg: 'from-green-500 to-emerald-500', text: 'text-green-600' }
    if (s >= 60) return { stroke: '#6366F1', bg: 'from-indigo-500 to-purple-500', text: 'text-indigo-600' }
    if (s >= 40) return { stroke: '#F59E0B', bg: 'from-amber-500 to-orange-500', text: 'text-amber-600' }
    return { stroke: '#EF4444', bg: 'from-red-500 to-rose-500', text: 'text-red-600' }
  }

  const colors = getScoreColor(score)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.stroke} />
            <stop offset="100%" stopColor={colors.stroke} stopOpacity={0.6} />
          </linearGradient>
        </defs>
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-4xl font-bold', colors.text)}>
          {animatedScore}
        </span>
        <span className="text-sm text-gray-400">/100</span>
      </div>
    </div>
  )
}
