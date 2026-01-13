/**
 * 快速验证方法卡片
 * 展示3种快速验证想法的方法
 */

'use client'

import { useState } from 'react'
import type { ValidationMethod } from '@/lib/types'

interface ValidationMethodsCardProps {
  methods: ValidationMethod[]
}

export function ValidationMethodsCard({ methods }: ValidationMethodsCardProps) {
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 如何验证想法</h3>
      <p className="text-sm text-gray-600 mb-4">做之前先验证，比做完再发现没人用强：</p>

      <div className="space-y-3">
        {methods.map((method) => (
          <div
            key={method.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 transition-colors"
          >
            <button
              onClick={() => setExpandedMethod(expandedMethod === method.id ? null : method.id)}
              className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{method.name}</div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-full whitespace-nowrap">
                    {method.duration}
                  </span>
                  <span className="text-gray-400">
                    {expandedMethod === method.id ? '▼' : '▶'}
                  </span>
                </div>
              </div>
            </button>

            {expandedMethod === method.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-4 bg-gray-50">
                {/* 步骤 */}
                {method.steps && method.steps.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">具体步骤：</div>
                    <ol className="space-y-2">
                      {method.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="flex-1">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* 期望结果 */}
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-xs font-medium text-green-800 mb-1">✓ 期望结果：</div>
                  <p className="text-sm text-gray-800">{method.expected_outcome}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
        <p className="text-sm text-yellow-800">
          💡 验证的目的不是证明想法好，而是尽早发现问题
        </p>
      </div>
    </div>
  )
}
