/**
 * ChoiceButtons Component
 * Renders selection choices for AI questions
 */

'use client'

import { cn } from '@/lib/utils'
import type { ChoiceButtonsProps } from '@/lib/types'

export function ChoiceButtons({ choices, onSelect, disabled }: ChoiceButtonsProps) {
  return (
    <div className="flex flex-col gap-3 mt-2">
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => onSelect(choice.id)}
          disabled={disabled}
          className={cn(
            'w-full text-left px-4 py-3 rounded-xl text-base',
            'bg-white border-2 border-gray-200',
            'transition-all duration-200',
            'hover:border-primary-500 hover:bg-primary-50 hover:-translate-y-0.5 hover:shadow-md',
            'active:translate-y-0',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:border-gray-200 disabled:hover:bg-white'
          )}
        >
          {choice.text}
        </button>
      ))}
    </div>
  )
}
