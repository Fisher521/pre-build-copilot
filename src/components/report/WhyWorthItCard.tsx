/**
 * 为什么值得做 / 需要注意的风险
 * 带可展开的详细解释
 */

'use client'

import { useState } from 'react'

interface WhyWorthItCardProps {
  whyWorthIt: string[]
  risks: string[]
}

interface ExpandableItemProps {
  item: string
  type: 'positive' | 'warning'
}

function ExpandableItem({ item, type }: ExpandableItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // 检查是否有"为什么"解释（暂时用规则判断）
  const hasWhy = item.length > 50 // 简单判断，实际应该从数据结构中获取

  return (
    <li className="flex items-start gap-3">
      <span className={`mt-0.5 flex-shrink-0 ${type === 'positive' ? 'text-green-500' : 'text-amber-500'}`}>
        {type === 'positive' ? '✓' : '!'}
      </span>
      <div className="flex-1">
        <span className="text-sm leading-relaxed text-gray-700">{item}</span>
        {hasWhy && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-xs text-primary-600 hover:underline"
          >
            {isExpanded ? '收起' : '为什么？'}
          </button>
        )}
        {isExpanded && hasWhy && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
            <div className="font-medium text-gray-700 mb-1">💡 详细说明：</div>
            <p>很多人的第一个项目都是"想太多，做太久"。花两周做了完美的用户系统，结果没人注册。更好的做法是先花2小时做一个"能用但丑"的版本，发给5个人试试。</p>
          </div>
        )}
      </div>
    </li>
  )
}

export function WhyWorthItCard({ whyWorthIt, risks }: WhyWorthItCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 为什么值得做 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>💪</span> 为什么值得做
        </h3>
        <ul className="space-y-3">
          {whyWorthIt.map((item, i) => (
            <ExpandableItem key={i} item={item} type="positive" />
          ))}
        </ul>
      </div>

      {/* 需要注意的风险 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>⚠️</span> 需要注意的风险
        </h3>
        <ul className="space-y-3">
          {risks.map((item, i) => (
            <ExpandableItem key={i} item={item} type="warning" />
          ))}
        </ul>
      </div>
    </div>
  )
}
