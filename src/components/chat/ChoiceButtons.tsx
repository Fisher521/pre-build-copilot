/**
 * ChoiceButtons Component
 * Renders A/B/C/D selection choices for AI questions
 */

'use client'

import { cn } from '@/lib/utils'
import type { ChoiceButtonsProps } from '@/lib/types'

// Letter labels for options
const CHOICE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

export function ChoiceButtons({ choices, onSelect, disabled }: ChoiceButtonsProps) {
  return (
    <div className="flex flex-col gap-2 mt-2">
      {choices.map((choice, index) => (
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
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:border-gray-200 disabled:hover:bg-white',
            'flex items-center gap-3'
          )}
        >
          {/* Letter Label */}
          <span className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold',
            'bg-gray-100 text-gray-600',
            'group-hover:bg-primary-100 group-hover:text-primary-600'
          )}>
            {CHOICE_LABELS[index] || (index + 1).toString()}
          </span>
          {/* Choice Text */}
          <span className="flex-1">{choice.text}</span>
        </button>
      ))}

      {/* Voice Option */}
      <button
        onClick={() => onSelect('voice')}
        disabled={disabled}
        className={cn(
          'w-full text-left px-4 py-3 rounded-xl text-base',
          'bg-gray-50 border-2 border-dashed border-gray-300',
          'transition-all duration-200',
          'hover:border-primary-400 hover:bg-primary-50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2 text-gray-500'
        )}
      >
        <span className="text-lg">🎤</span>
        <span>用语音说</span>
      </button>

      {/* Hint */}
      <p className="text-center text-xs text-gray-400 mt-1">
        直接回复字母或描述都可以
      </p>
    </div>
  )
}
