/**
 * ChatInput Component
 * Fixed bottom input with auto-resize, send button, and voice input
 */

'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import type { ChatInputProps } from '@/lib/types'
import { VoiceButton } from './VoiceButton'

export function ChatInput({ onSend, disabled, placeholder = '告诉我你的想法...' }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [value])

  const handleSend = () => {
    const trimmed = value.trim()
    if (trimmed && !disabled) {
      onSend(trimmed)
      setValue('')
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    setValue((prev) => prev + transcript)
    // Focus the textarea after voice input
    textareaRef.current?.focus()
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200"
      style={{
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={3}
            className={cn(
              'flex-1 resize-none rounded-2xl px-4 py-3 text-base leading-relaxed',
              'bg-gray-100 border-2 border-transparent',
              'focus:border-primary-500 focus:bg-white focus:outline-none',
              'transition-all duration-200',
              'disabled:opacity-50',
              'min-h-[80px]'
            )}
            style={{ maxHeight: '160px' }}
          />
          {/* Voice Button */}
          <VoiceButton
            onTranscript={handleVoiceTranscript}
            disabled={disabled}
          />
          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center',
              'bg-primary-500 text-white',
              'transition-all duration-200',
              'hover:bg-primary-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

