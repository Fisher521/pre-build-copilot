/**
 * Button Component
 * Based on DESIGN_SPEC.md
 */

'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import type { ButtonVariant, ButtonSize } from '@/lib/types'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200'

    const variants = {
      primary: cn(
        'text-white',
        'bg-gradient-to-br from-primary-500 to-primary-600',
        'shadow-[0_4px_12px_rgba(99,102,241,0.3)]',
        'hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(99,102,241,0.4)]',
        'active:translate-y-0',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_12px_rgba(99,102,241,0.3)]'
      ),
      secondary: cn(
        'text-primary-500',
        'bg-white',
        'border-2 border-primary-500',
        'hover:bg-primary-50',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      ),
      text: cn(
        'text-primary-500',
        'bg-transparent',
        'hover:text-primary-600 hover:underline',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      ),
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            加载中...
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
