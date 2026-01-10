/**
 * OptionButton Component
 * Selectable button for time/audience options
 */

'use client'

import { cn } from '@/lib/utils'

interface OptionButtonProps {
  id: string
  icon: string
  label: string
  selected?: boolean
  onClick: (id: string) => void
}

export function OptionButton({
  id,
  icon,
  label,
  selected,
  onClick,
}: OptionButtonProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        'flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
        'border-2 transition-all duration-200',
        'hover:-translate-y-0.5',
        'active:translate-y-0',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        selected
          ? 'border-primary-500 bg-primary-50 text-primary-700'
          : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
      )}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  )
}
