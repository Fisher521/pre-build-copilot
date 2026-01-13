/**
 * 可能踩的坑模块
 * 展示常见问题和解决方法
 */

'use client'

import { useState } from 'react'

interface PitfallsCardProps {
  pitfalls: string[]
}

interface PitfallItemProps {
  pitfall: string
  index: number
}

function PitfallItem({ pitfall, index }: PitfallItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // 解析坑点和解决方法（格式："问题 → 解决方法"）
  const parts = pitfall.split(/[→\->]/)
  const problem = parts[0]?.trim() || pitfall
  const solution = parts[1]?.trim()

  return (
    <div className="border border-orange-100 rounded-lg overflow-hidden hover:border-orange-300 transition-colors">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 hover:bg-orange-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-medium">
            {index + 1}
          </span>
          <div className="flex-1">
            <div className="font-medium text-gray-900 mb-1">{problem}</div>
            {solution && !isExpanded && (
              <div className="text-sm text-orange-600">点击查看解决方法 →</div>
            )}
          </div>
          <span className="text-gray-400 text-sm">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </button>

      {isExpanded && solution && (
        <div className="px-4 pb-4 bg-orange-50 border-t border-orange-100">
          <div className="p-3 bg-white rounded-lg border border-orange-200">
            <div className="text-xs font-medium text-orange-700 mb-2">📖 经验：</div>
            <p className="text-sm text-gray-800 leading-relaxed">{solution}</p>
          </div>

          {/* 额外的建议 */}
          <div className="mt-3 text-xs text-orange-700">
            💡 记住：遇到问题很正常，把错误信息复制给AI，让它帮你看
          </div>
        </div>
      )}
    </div>
  )
}

export function PitfallsCard({ pitfalls }: PitfallsCardProps) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">⚠️</span>
        <h3 className="text-lg font-semibold text-gray-900">可能踩的坑</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">这个项目容易遇到的问题</p>

      <div className="space-y-3">
        {pitfalls.map((pitfall, idx) => (
          <PitfallItem key={idx} pitfall={pitfall} index={idx} />
        ))}
      </div>

      {/* 通用建议 */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-orange-200">
        <div className="flex items-start gap-2">
          <span className="text-orange-600 mt-0.5">💪</span>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900 mb-2">卡住了怎么办？</div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 把错误信息复制给 AI，让它帮你看</li>
              <li>• 不知道下一步做什么 → 回来看这个路径图</li>
              <li>• 觉得太难想放弃 → 休息一下，明天继续</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
