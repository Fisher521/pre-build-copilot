/**
 * WizardProgress Component
 * Progress bar showing current step in wizard flow
 */

'use client'

import { cn } from '@/lib/utils'

interface WizardProgressProps {
  currentStep: number
  totalSteps: number
  labels?: string[]
  className?: string
}

export function WizardProgress({ 
  currentStep, 
  totalSteps, 
  labels,
  className 
}: WizardProgressProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between mt-3">
        <span className="text-sm font-medium text-primary-600">
          {currentStep}/{totalSteps}
        </span>
        {labels && labels[currentStep - 1] && (
          <span className="text-sm text-gray-500">
            {labels[currentStep - 1]}
          </span>
        )}
      </div>
    </div>
  )
}
