/**
 * ActionButtons Component
 * Navigation buttons for wizard steps
 */

'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ActionButtonsProps {
  onBack?: () => void
  onNext?: () => void
  onSkip?: () => void
  backLabel?: string
  nextLabel?: string
  skipLabel?: string
  nextDisabled?: boolean
  nextLoading?: boolean
  showBack?: boolean
  showSkip?: boolean
  className?: string
}

export function ActionButtons({
  onBack,
  onNext,
  onSkip,
  backLabel = '← 返回',
  nextLabel = '继续 →',
  skipLabel = '跳过',
  nextDisabled = false,
  nextLoading = false,
  showBack = true,
  showSkip = false,
  className,
}: ActionButtonsProps) {
  return (
    <div className={cn('flex items-center justify-between mt-8', className)}>
      {/* Left side - Back button */}
      <div>
        {showBack && onBack && (
          <button
            onClick={onBack}
            className={cn(
              'px-5 py-2.5 rounded-xl text-sm font-medium',
              'text-gray-600 hover:text-gray-900',
              'hover:bg-gray-100 transition-colors'
            )}
          >
            {backLabel}
          </button>
        )}
      </div>

      {/* Right side - Skip and Next buttons */}
      <div className="flex items-center gap-3">
        {showSkip && onSkip && (
          <button
            onClick={onSkip}
            className={cn(
              'px-5 py-2.5 rounded-xl text-sm font-medium',
              'text-gray-500 hover:text-gray-700',
              'hover:bg-gray-100 transition-colors'
            )}
          >
            {skipLabel}
          </button>
        )}
        
        {onNext && (
          <button
            onClick={onNext}
            disabled={nextDisabled || nextLoading}
            className={cn(
              'px-6 py-2.5 rounded-xl text-sm font-medium',
              'bg-primary-500 text-white',
              'hover:bg-primary-600 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-2'
            )}
          >
            {nextLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                处理中...
              </>
            ) : (
              nextLabel
            )}
          </button>
        )}
      </div>
    </div>
  )
}
