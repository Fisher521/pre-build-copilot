/**
 * 产品方案引导式提问
 * 帮助用户选择最适合的产品方案
 */

'use client'

import { useState } from 'react'
import type { GuidedQuestion } from '@/lib/types'

interface ProductApproachGuidanceProps {
  questions: GuidedQuestion[]
  onComplete: (selectedApproachId: string) => void
}

export function ProductApproachGuidance({ questions, onComplete }: ProductApproachGuidanceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})

  if (questions.length === 0) return null

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const handleAnswer = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestionIndex]: optionId })

    // 获取这个选项推荐的方案
    const selectedOption = currentQuestion.options.find(opt => opt.id === optionId)

    if (isLastQuestion && selectedOption) {
      // 最后一题，完成引导
      onComplete(selectedOption.leads_to)
    } else {
      // 继续下一题
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }, 300)
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🤔 选之前，先回答几个问题
        </h3>
        <p className="text-sm text-gray-600">
          {currentQuestion.purpose}
        </p>
      </div>

      {/* 进度指示 */}
      <div className="flex items-center gap-2 mb-6">
        {questions.map((_, idx) => (
          <div
            key={idx}
            className={`flex-1 h-2 rounded-full transition-all ${
              idx < currentQuestionIndex
                ? 'bg-indigo-500'
                : idx === currentQuestionIndex
                ? 'bg-indigo-300'
                : 'bg-indigo-100'
            }`}
          />
        ))}
      </div>

      {/* 当前问题 */}
      <div className="bg-white rounded-lg border border-indigo-200 p-6">
        <div className="mb-6">
          <div className="text-sm text-indigo-600 font-medium mb-2">
            问题 {currentQuestionIndex + 1} / {questions.length}
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {currentQuestion.question}
          </div>
        </div>

        {/* 选项 */}
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestionIndex] === option.id

            return (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-full h-full text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="flex-1 text-gray-800">{option.text}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* 导航 */}
        {currentQuestionIndex > 0 && (
          <button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            className="mt-4 text-sm text-indigo-600 hover:underline"
          >
            ← 返回上一题
          </button>
        )}
      </div>

      {/* 提示 */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        回答这些问题可以帮你找到最适合的产品方案
      </div>
    </div>
  )
}
