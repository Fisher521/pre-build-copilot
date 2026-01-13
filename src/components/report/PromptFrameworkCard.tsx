/**
 * 提示词教学交互组件
 * 教方法而非给固定模板
 */

'use client'

import { useState } from 'react'

interface PromptFrameworkCardProps {
  framework?: {
    structure: string
    tips: string[]
    project_specific_guide: string
  }
}

export function PromptFrameworkCard({ framework }: PromptFrameworkCardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userPrompt, setUserPrompt] = useState('')

  if (!framework) return null

  const steps = [
    {
      title: '第一步：理解提示词结构',
      content: framework.structure,
      example: '【角色】你是一个小学语文老师\n【任务】帮我检查学生的作业\n【上下文】这是三年级的作业，共10道题\n【约束】用家长能理解的话\n【输出格式】完成情况、可能的错误、鼓励'
    },
    {
      title: '第二步：进阶技巧',
      content: '让提示词越来越好的方法',
      tips: framework.tips
    },
    {
      title: '第三步：针对你的项目',
      content: framework.project_specific_guide,
      interactive: true
    }
  ]

  const currentStepData = steps[currentStep]

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📝 提示词教学（教方法，不给答案）
        </h3>
        <p className="text-sm text-gray-600">
          每个人的项目细节不同，给固定模板反而会限制你。学会方法，以后做任何项目都用得上。
        </p>
      </div>

      {/* 步骤指示器 */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentStep(idx)}
            className={`flex-1 h-2 rounded-full transition-all ${
              idx === currentStep
                ? 'bg-purple-500'
                : idx < currentStep
                ? 'bg-purple-300'
                : 'bg-purple-100'
            }`}
          />
        ))}
      </div>

      {/* 当前步骤内容 */}
      <div className="bg-white rounded-lg border border-purple-200 p-6 min-h-[300px]">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          {currentStepData.title}
        </h4>

        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="font-medium text-purple-900 mb-2">框架：</div>
              <div className="text-sm text-gray-800 whitespace-pre-line">
                {currentStepData.content}
              </div>
            </div>

            {currentStepData.example && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-2">示例：</div>
                <div className="text-sm text-gray-700 whitespace-pre-line font-mono">
                  {currentStepData.example}
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && currentStepData.tips && (
          <div className="space-y-3">
            {currentStepData.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-medium">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 leading-relaxed">{tip}</p>
                </div>
              </div>
            ))}

            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm font-medium text-purple-900 mb-2">
                💡 记住：好的提示词是改出来的，不是一次写好的
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="prose prose-sm text-gray-700 whitespace-pre-line">
              {currentStepData.content}
            </div>

            {currentStepData.interactive && (
              <div className="mt-6">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  💬 试着写一个提示词：
                </div>
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="根据上面的框架，试着写一个针对你项目的提示词..."
                  className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="mt-2 text-xs text-gray-500">
                  💡 建议：在 Cursor 里写代码时，把这些要点告诉 AI，让它帮你写具体的提示词
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 导航按钮 */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← 上一步
        </button>

        <div className="text-sm text-gray-500">
          {currentStep + 1} / {steps.length}
        </div>

        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          下一步 →
        </button>
      </div>
    </div>
  )
}
