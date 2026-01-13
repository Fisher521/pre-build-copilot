/**
 * 术语翻译浮层
 * 鼠标悬停或点击显示术语的人话解释
 */

'use client'

import { useState } from 'react'
import type { TermTranslation } from '@/lib/types'

interface TermGlossaryProps {
  term: string
  children: React.ReactNode
  translations: TermTranslation[]
}

export function TermGlossary({ term, children, translations }: TermGlossaryProps) {
  const [isOpen, setIsOpen] = useState(false)

  const translation = translations.find(t => t.term === term)

  if (!translation) {
    return <>{children}</>
  }

  return (
    <span className="relative inline-block">
      <button
        className="underline decoration-dotted decoration-primary-400 cursor-help text-primary-700 hover:text-primary-800"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg">
            <div className="font-medium mb-1">{translation.term}</div>
            <div className="text-gray-200 mb-2">{translation.plain_text}</div>
            {translation.example && (
              <div className="text-xs text-gray-300 border-t border-gray-700 pt-2">
                例如：{translation.example}
              </div>
            )}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        </div>
      )}
    </span>
  )
}

/**
 * 术语翻译表展示组件
 */
interface TermTableProps {
  translations: TermTranslation[]
}

export function TermTranslationTable({ translations }: TermTableProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📖 术语翻译表</h3>
      <p className="text-sm text-gray-600 mb-4">遇到不懂的词？这里有人话解释：</p>

      <div className="space-y-2">
        {translations.map((translation, idx) => (
          <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-20 font-mono text-sm font-medium text-primary-700">
                {translation.term}
              </div>
              <div className="flex-1">
                <div className="text-gray-800 mb-1">{translation.plain_text}</div>
                {translation.example && (
                  <div className="text-xs text-gray-500">
                    例如：{translation.example}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
