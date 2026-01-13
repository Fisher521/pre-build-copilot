/**
 * 开发路径组件
 * 展示工具选择和服务连接步骤
 */

'use client'

import type { DevelopmentTool, ServiceConnection } from '@/lib/types'

interface DevelopmentPathCardProps {
  recommendedTools: DevelopmentTool[]
  serviceConnections: ServiceConnection[]
  recommendedStack: string
}

export function DevelopmentPathCard({
  recommendedTools,
  serviceConnections,
  recommendedStack
}: DevelopmentPathCardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">开发路径</h2>
        <p className="text-gray-600">选择合适的工具开始你的项目</p>
      </div>

      {/* 主力工具选择 */}
      {recommendedTools.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: 选择你的主力开发工具</h3>

          <div className="grid md:grid-cols-3 gap-4">
            {recommendedTools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white rounded-lg p-4 border border-blue-100 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                  {tool.is_domestic && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      国产
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-500 mb-2">{tool.type}</div>
                <p className="text-sm text-gray-700 mb-3">{tool.best_for}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{tool.cost}</span>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline"
                  >
                    了解 →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-sm font-medium text-gray-700 mb-1">💡 怎么选：</div>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>完全不会代码 → 扣子空间（中文界面，最简单）</li>
              <li>会一点代码，想学习 → Cursor（边做边学）</li>
              <li>有经验，想高效 → Claude Code（最强但需命令行）</li>
            </ul>
          </div>
        </div>
      )}

      {/* 服务连接步骤 */}
      {serviceConnections.length > 0 && (
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 2: 连接必要的服务</h3>
          <p className="text-sm text-gray-600 mb-4">根据项目需要，接入这些服务：</p>

          <div className="space-y-4">
            {serviceConnections.map((category, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-purple-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">{category.category}</h4>

                <div className="space-y-2">
                  {category.services.map((service, sIdx) => (
                    <div
                      key={sIdx}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        service.recommended ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{service.name}</span>
                          {service.is_domestic && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              国产
                            </span>
                          )}
                          {service.recommended && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                              推荐
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                      <a
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 text-sm text-primary-600 hover:underline whitespace-nowrap"
                      >
                        查看 →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-white rounded-lg border border-purple-100">
            <div className="text-sm font-medium text-gray-700 mb-1">💡 建议：</div>
            <p className="text-sm text-gray-600">先用免费版，跑通了再考虑付费</p>
          </div>
        </div>
      )}

      {/* 推荐组合 */}
      {recommendedStack && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            <span className="mr-2">🎯</span>
            针对这个项目的推荐组合
          </h3>
          <div className="prose prose-sm text-gray-700 whitespace-pre-line">
            {recommendedStack}
          </div>
        </div>
      )}
    </div>
  )
}
