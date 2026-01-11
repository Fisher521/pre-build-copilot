/**
 * StepCard Component
 * Container card for each wizard step
 */

'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface StepCardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export function StepCard({ 
  title, 
  subtitle, 
  children, 
  className,
  maxWidth = 'xl'
}: StepCardProps) {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth]

  return (
    <div className={cn(
      'w-full mx-auto',
      maxWidthClass,
      className
    )}>
      {(title || subtitle) && (
        <div className="text-center mb-6">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-gray-500 mt-2">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
        {children}
      </div>
    </div>
  )
}
