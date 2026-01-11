/**
 * MessageBubble Component
 * Displays individual chat messages with Markdown rendering
 */

'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import type { MessageBubbleProps, Choice } from '@/lib/types'
import { ChoiceButtons } from './ChoiceButtons'

interface ExtendedMessageBubbleProps extends MessageBubbleProps {
  onChoiceSelect?: (choiceId: string) => void
}

export function MessageBubble({ message, isLast, onChoiceSelect }: ExtendedMessageBubbleProps) {
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
        {/* Message Content with Markdown */}
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Headings
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold mt-4 mb-2 first:mt-0">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-bold mt-4 mb-2 first:mt-0">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>
                ),
                // Paragraphs
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                // Tables
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3">
                    <table className="min-w-full border-collapse text-sm">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-200">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody>{children}</tbody>
                ),
                tr: ({ children }) => (
                  <tr className="border-b border-gray-200">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-2 text-left font-semibold">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2">{children}</td>
                ),
                // Lists
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="ml-2">{children}</li>
                ),
                // Horizontal rule
                hr: () => (
                  <hr className="my-4 border-gray-300" />
                ),
                // Code
                code: ({ className, children }) => {
                  const isInline = !className
                  return isInline ? (
                    <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm">{children}</code>
                  ) : (
                    <code className="block bg-gray-200 p-3 rounded-lg text-sm overflow-x-auto my-2">
                      {children}
                    </code>
                  )
                },
                // Strong
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                // Links
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-primary-600 underline hover:text-primary-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Choice Buttons (for AI messages with choices) */}
        {isAssistant && hasChoices && isLast && onChoiceSelect && (
          <div className="mt-4">
            <ChoiceButtons
              choices={message.metadata!.choices as Choice[]}
              onSelect={onChoiceSelect}
              disabled={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}
