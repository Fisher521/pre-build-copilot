/**
 * Card Component
 * Simple container with white background, shadow, and rounded corners
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-6 shadow-md',
        'md:p-6', // desktop padding
        className
      )}
      style={{
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {children}
    </div>
  )
}
