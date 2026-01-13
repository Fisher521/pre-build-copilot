/**
 * 劝退页面组件
 * 当项目有硬性障碍时显示
 */

'use client'

import { useRouter } from 'next/navigation'
import type { DissuasionAssessment } from '@/lib/types'

interface DissuasionViewProps {
  dissuasion: DissuasionAssessment
  score: number
}

export function DissuasionView({ dissuasion, score }: DissuasionViewProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-2xl mx-auto">
        {/* 评分展示 */}
        <div className="text-center mb-8">
          <div className="inline-block p-8 bg-white rounded-2xl border-2 border-orange-200 shadow-sm">
            <div className="text-6xl font-bold text-orange-600 mb-2">{score}</div>
            <div className="text-gray-500 text-sm">可行性评分</div>
          </div>
        </div>

        {/* 主标题 */}
        <div className="bg-white rounded-2xl border border-orange-100 p-8 shadow-sm mb-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              这个项目有较大的硬性障碍
            </h1>
            <p className="text-gray-600">
              建议考虑替代方案，或者准备好应对这些挑战
            </p>
          </div>

          {/* 硬性障碍 */}
          {dissuasion.hard_blockers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">❌ 硬性障碍</h3>
              <div className="space-y-2">
                {dissuasion.hard_blockers.map((blocker, idx) => (
                  <div key={idx} className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <div className="font-medium text-red-900 mb-1">
                      {blocker === 'needs_offline_operations' && '需要线下运营'}
                      {blocker === 'needs_license' && '需要金融/医疗牌照'}
                      {blocker === 'needs_custom_ai_model' && '需要训练自己的AI模型'}
                      {!['needs_offline_operations', 'needs_license', 'needs_custom_ai_model'].includes(blocker) && blocker}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 具体原因 */}
          {dissuasion.reasons.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🤔 为什么这样说</h3>
              <ul className="space-y-2">
                {dissuasion.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 替代建议 */}
          {dissuasion.alternatives && dissuasion.alternatives.length > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 可以试试这些替代方案</h3>
              <div className="space-y-4">
                {dissuasion.alternatives.map((alt, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{alt.title}</h4>
                    <p className="text-sm text-gray-700 mb-2">{alt.description}</p>
                    <div className="text-xs text-green-700 bg-green-50 px-3 py-1 rounded inline-block">
                      ✓ {alt.why_easier}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 行动选项 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">😅 看完觉得有点复杂？</h3>
          <p className="text-gray-600 mb-4">没关系，你有几个选择：</p>

          <div className="space-y-2 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg text-gray-700">
              • 收藏这份报告，以后有空再做
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-gray-700">
              • 换一个更简单的想法试试
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-gray-700">
              • 找一个会写代码的朋友一起做
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-gray-700">
              • 直接把这份报告发给开发者，让他帮你做
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              换个想法重新评估
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              保存报告
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-gray-400">
          知道一个想法值不值得做，本身就是收获 💪
        </div>
      </div>
    </div>
  )
}
