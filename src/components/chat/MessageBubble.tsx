/**
 * MessageBubble Component
 * Displays individual chat messages with different styles for AI and user
 */

'use client'

import { cn } from '@/lib/utils'
import type { MessageBubbleProps } from '@/lib/types'
import { ChoiceButtons } from './ChoiceButtons'

export function MessageBubble({ message, isLast }: MessageBubbleProps & { onChoiceSelect?: (id: string) => void }) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const hasChoices = message.metadata?.type === 'choices' && message.metadata?.choices

  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] px-4 py-3 text-base leading-relaxed',
          isUser
            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl rounded-br-sm shadow-sm'
            : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm shadow-sm'
        )}
      >
        {/* Message Content */}
        <div className="whitespace-pre-wrap">{message.content}</div>

        {/* Choice Buttons (for AI messages with choices) */}
        {isAssistant && hasChoices && isLast && (
          <div className="mt-4">
            <ChoiceButtons
              choices={message.metadata!.choices!}
              onSelect={() => {}}
              disabled={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}
