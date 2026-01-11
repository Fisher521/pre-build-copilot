/**
 * MarkdownPreview Component
 * Renders markdown content with proper styling
 */

'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownPreviewProps {
  content: string
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-6 mb-3 first:mt-0 text-gray-900">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold mt-5 mb-2 text-gray-800">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold mt-4 mb-2 text-gray-700">{children}</h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-3 text-gray-600 leading-relaxed">{children}</p>
          ),
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse text-sm border border-gray-200 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr>{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold text-gray-700">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-gray-600">{children}</td>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-5 mb-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-5 mb-3 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-600">{children}</li>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="my-6 border-gray-200" />
          ),
          // Code
          code: ({ className, children }) => {
            const isInline = !className
            return isInline ? (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-primary-600">{children}</code>
            ) : (
              <code className="block bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto my-3">
                {children}
              </code>
            )
          },
          // Strong
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-800">{children}</strong>
          ),
          // Emphasis
          em: ({ children }) => (
            <em className="italic text-gray-600">{children}</em>
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
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary-300 pl-4 py-1 my-3 bg-primary-50 rounded-r-lg">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
