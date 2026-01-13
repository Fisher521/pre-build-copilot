/**
 * 市场分析卡片（中国市场版）
 * 包含需求信号、用户声音、竞品分析
 */

'use client'

import { useState } from 'react'
import type { DemandSignal, UserVoice, EnhancedCompetitor, DataSource } from '@/lib/types'

interface MarketAnalysisProps {
  demandSignals?: DemandSignal[]
  userVoices?: UserVoice[]
  competitors: EnhancedCompetitor[]
  opportunity: string
  searchTrends?: DataSource
  verificationGuide?: string
}

export function MarketAnalysisCard({
  demandSignals,
  userVoices,
  competitors,
  opportunity,
  searchTrends,
  verificationGuide
}: MarketAnalysisProps) {
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">市场分析</h2>
        <p className="text-gray-600">基于中国市场的真实数据</p>
      </div>

      {/* 需求信号 */}
      {demandSignals && demandSignals.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 需求信号</h3>
          <div className="space-y-3">
            {demandSignals.map((signal, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{signal.platform}</span>
                      <span className="text-sm text-gray-500">·</span>
                      <span className="text-sm text-gray-600">{signal.keyword}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{signal.description}</p>
                    {signal.url && (
                      <a
                        href={signal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1"
                      >
                        查看数据 →
                      </a>
                    )}
                  </div>
                  {!signal.verified && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      建议验证
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {searchTrends && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
              <p className="text-sm text-gray-700">{searchTrends.value}</p>
              {searchTrends.source && (
                <div className="mt-2 text-xs text-gray-500">
                  数据来源：{searchTrends.source}
                  {searchTrends.source_url && (
                    <a
                      href={searchTrends.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary-600 hover:underline"
                    >
                      查看 →
                    </a>
                  )}
                </div>
              )}
              {searchTrends.note && (
                <div className="mt-1 text-xs text-yellow-600">
                  💡 {searchTrends.note}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 用户真实声音 */}
      {userVoices && userVoices.length > 0 && (
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📣 用户真实声音</h3>
          <div className="space-y-3">
            {userVoices.map((voice, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="text-sm text-gray-500 mb-2">{voice.platform}</div>
                <blockquote className="text-gray-800 border-l-4 border-purple-300 pl-4 italic">
                  "{voice.quote}"
                </blockquote>
                {voice.insight && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                    <div className="text-xs text-purple-700 font-medium mb-1">💡 洞察</div>
                    <p className="text-sm text-gray-700">{voice.insight}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 竞品分析 */}
      {competitors.length > 0 && (
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 已经有人在做的</h3>
          <div className="space-y-4">
            {competitors.map((competitor, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-orange-100 overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedCompetitor(expandedCompetitor === competitor.name ? null : competitor.name)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{competitor.name}</h4>
                        {competitor.download_rank && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                            {competitor.download_rank}
                          </span>
                        )}
                      </div>
                      {competitor.description && (
                        <p className="text-sm text-gray-600">{competitor.description}</p>
                      )}
                    </div>
                    <span className="text-gray-400">
                      {expandedCompetitor === competitor.name ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {expandedCompetitor === competitor.name && (
                  <div className="px-4 pb-4 space-y-3 border-t border-orange-100 pt-4">
                    {/* 优点 */}
                    {competitor.pros.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-green-700 mb-1">✓ 做得好：</div>
                        <ul className="space-y-1">
                          {competitor.pros.map((pro, i) => (
                            <li key={i} className="text-sm text-gray-700 pl-4">• {pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 缺点 */}
                    {competitor.cons.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-red-700 mb-1">✗ 用户抱怨：</div>
                        <ul className="space-y-1">
                          {competitor.cons.map((con, i) => (
                            <li key={i} className="text-sm text-gray-700 pl-4">• {con}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 机会点 */}
                    {competitor.opportunity && (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="text-xs font-medium text-yellow-800 mb-1">✗ 你的机会：</div>
                        <p className="text-sm text-gray-800">{competitor.opportunity}</p>
                      </div>
                    )}

                    {/* 链接 */}
                    <div className="flex flex-wrap gap-2">
                      {competitor.urls.official && (
                        <a
                          href={competitor.urls.official}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          官网 →
                        </a>
                      )}
                      {competitor.urls.app_store && (
                        <a
                          href={competitor.urls.app_store}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          App Store →
                        </a>
                      )}
                      {competitor.urls.android_store && (
                        <a
                          href={competitor.urls.android_store}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          应用宝 →
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 差异化机会 */}
      <div className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl p-6 border border-primary-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 你的差异化空间</h3>
        <p className="text-gray-800 leading-relaxed">{opportunity}</p>
      </div>

      {/* 验证指南 */}
      {verificationGuide && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🔍 建议你自己去看看</h3>
          <div className="prose prose-sm text-gray-700 whitespace-pre-line">
            {verificationGuide}
          </div>
          <div className="mt-4 text-xs text-gray-500">
            ⚠️ 花30分钟自己调研，比看报告更有用
          </div>
        </div>
      )}
    </div>
  )
}
