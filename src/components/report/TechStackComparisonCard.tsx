/**
 * 技术方案对比表格
 * 展示极简版 vs 进阶版 vs 零成本版
 */

'use client'

import { useState } from 'react'
import type { TechStackOption } from '@/lib/types'

interface TechStackComparisonCardProps {
  optionA: TechStackOption
  optionB: TechStackOption
  zeroCodest?: TechStackOption
  advice: string
}

export function TechStackComparisonCard({
  optionA,
  optionB,
  zeroCost,
  advice
}: TechStackComparisonCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>(optionA.id)

  const options = [optionA, optionB]
  if (zeroCost) options.push(zeroCost)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">⚙️ 技术方案</h3>
      <p className="text-sm text-gray-600 mb-4">选一个适合你的</p>

      {/* 对比表格 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">对比项</th>
              {options.map((option) => (
                <th
                  key={option.id}
                  className={`py-3 px-4 text-sm font-semibold ${
                    selectedOption === option.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-900'
                  }`}
                >
                  <button
                    onClick={() => setSelectedOption(option.id)}
                    className="w-full text-left hover:text-primary-600 transition-colors"
                  >
                    {option.name}
                    {option.id === 'zero_cost' && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        推荐
                      </span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 使用工具 */}
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-sm text-gray-600">使用工具</td>
              {options.map((option) => (
                <td
                  key={option.id}
                  className={`py-3 px-4 text-sm ${
                    selectedOption === option.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="space-y-1">
                    {option.tools.map((tool, idx) => (
                      <div key={idx} className="text-gray-700">{tool}</div>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* 能实现什么 */}
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-sm text-gray-600">能实现什么</td>
              {options.map((option) => (
                <td
                  key={option.id}
                  className={`py-3 px-4 text-sm text-gray-700 ${
                    selectedOption === option.id ? 'bg-primary-50' : ''
                  }`}
                >
                  {option.capability}
                </td>
              ))}
            </tr>

            {/* 上手难度 */}
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-sm text-gray-600">上手难度</td>
              {options.map((option) => (
                <td
                  key={option.id}
                  className={`py-3 px-4 ${
                    selectedOption === option.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < option.difficulty
                            ? 'text-yellow-400'
                            : 'text-gray-200'
                        }
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* 开发时间 */}
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-sm text-gray-600">开发时间</td>
              {options.map((option) => (
                <td
                  key={option.id}
                  className={`py-3 px-4 text-sm text-gray-700 ${
                    selectedOption === option.id ? 'bg-primary-50' : ''
                  }`}
                >
                  {option.dev_time}
                </td>
              ))}
            </tr>

            {/* 每月成本 */}
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-sm text-gray-600">每月成本</td>
              {options.map((option) => (
                <td
                  key={option.id}
                  className={`py-3 px-4 text-sm text-gray-700 ${
                    selectedOption === option.id ? 'bg-primary-50' : ''
                  }`}
                >
                  {option.cost}
                </td>
              ))}
            </tr>

            {/* 适合场景 */}
            <tr>
              <td className="py-3 px-4 text-sm text-gray-600">适合场景</td>
              {options.map((option) => (
                <td
                  key={option.id}
                  className={`py-3 px-4 text-sm text-gray-700 ${
                    selectedOption === option.id ? 'bg-primary-50' : ''
                  }`}
                >
                  {option.fit_for}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 建议 */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="text-sm font-medium text-blue-900 mb-1">📖 怎么选？</div>
        <p className="text-sm text-blue-800">{advice}</p>
      </div>

      {/* 工具名词解释 */}
      {options.find(o => o.id === selectedOption)?.tools_glossary && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-3">💡 名词解释：</div>
          <div className="space-y-2">
            {options
              .find(o => o.id === selectedOption)
              ?.tools_glossary?.map((glossary, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium text-gray-900">{glossary.name}</span>
                  <span className="text-gray-600"> - {glossary.explanation}</span>
                  {glossary.is_domestic && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      国产
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
