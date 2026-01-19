'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Language } from '@/lib/i18n/translations'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  rating: 'helpful' | 'not_helpful'
  conversationId: string
  reportScore?: number
  onSubmitSuccess?: () => void
  lang?: Language
}

// Predefined reasons based on rating with i18n support
const HELPFUL_REASONS = [
  { id: 'accurate_analysis', label: { zh: '分析准确', en: 'Accurate analysis' } },
  { id: 'useful_tools', label: { zh: '工具推荐有用', en: 'Useful tool recommendations' } },
  { id: 'clear_steps', label: { zh: '步骤清晰', en: 'Clear steps' } },
  { id: 'cost_estimate', label: { zh: '成本估算合理', en: 'Reasonable cost estimate' } },
  { id: 'risk_warning', label: { zh: '风险提示到位', en: 'Good risk warnings' } },
  { id: 'saved_time', label: { zh: '节省了我的时间', en: 'Saved my time' } },
]

const NOT_HELPFUL_REASONS = [
  { id: 'inaccurate', label: { zh: '分析不准确', en: 'Inaccurate analysis' } },
  { id: 'wrong_tools', label: { zh: '工具推荐不合适', en: 'Wrong tool recommendations' } },
  { id: 'too_generic', label: { zh: '建议太笼统', en: 'Too generic suggestions' } },
  { id: 'missing_info', label: { zh: '缺少关键信息', en: 'Missing key information' } },
  { id: 'wrong_cost', label: { zh: '成本估算偏差大', en: 'Inaccurate cost estimate' } },
  { id: 'not_practical', label: { zh: '方案不可行', en: 'Impractical approach' } },
]

// Modal text translations
const modalText = {
  header: {
    helpful: { zh: '很高兴对你有帮助！', en: 'Glad it was helpful!' },
    notHelpful: { zh: '抱歉没能帮到你', en: "Sorry it wasn't helpful" },
  },
  subheader: {
    helpful: { zh: '告诉我们哪里做得好', en: 'Tell us what we did well' },
    notHelpful: { zh: '告诉我们哪里需要改进', en: 'Tell us how to improve' },
  },
  selectReason: { zh: '选择原因（可多选）', en: 'Select reasons (multiple allowed)' },
  additionalComment: { zh: '补充说明（可选）', en: 'Additional comments (optional)' },
  placeholderHelpful: { zh: '还有什么特别喜欢的地方？', en: 'What else did you like?' },
  placeholderNotHelpful: { zh: '具体哪里可以改进？你期望看到什么？', en: 'What could be improved? What did you expect?' },
  privacyNote: {
    zh: '你的反馈完全匿名，不会关联到你的项目想法。我们只统计改进方向，不记录具体内容。',
    en: 'Your feedback is completely anonymous and not linked to your project. We only track improvement areas.'
  },
  errorRequired: { zh: '请至少选择一个原因或填写反馈', en: 'Please select at least one reason or provide feedback' },
  errorSubmit: { zh: '提交失败，请重试', en: 'Submission failed, please try again' },
  cancel: { zh: '取消', en: 'Cancel' },
  submitting: { zh: '提交中...', en: 'Submitting...' },
  submit: { zh: '提交反馈', en: 'Submit Feedback' },
  successTitle: { zh: '感谢你的反馈！', en: 'Thanks for your feedback!' },
  successDesc: { zh: '你的意见将帮助我们改进产品', en: 'Your input helps us improve the product' },
}

export function FeedbackModal({
  isOpen,
  onClose,
  rating,
  conversationId,
  reportScore,
  onSubmitSuccess,
  lang = 'zh',
}: FeedbackModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reasons = rating === 'helpful' ? HELPFUL_REASONS : NOT_HELPFUL_REASONS
  const txt = (key: keyof typeof modalText) => modalText[key][lang]

  const toggleReason = (reasonId: string) => {
    setSelectedReasons(prev =>
      prev.includes(reasonId)
        ? prev.filter(r => r !== reasonId)
        : [...prev, reasonId]
    )
  }

  const handleSubmit = async () => {
    if (selectedReasons.length === 0 && !comment.trim()) {
      setError(txt('errorRequired'))
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          rating,
          reasons: selectedReasons,
          comment: comment.trim() || undefined,
          report_score: reportScore,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMsg = result.error || '提交失败'
        const hint = result.hint ? `\n${result.hint}` : ''
        throw new Error(errorMsg + hint)
      }

      setSubmitted(true)
      onSubmitSuccess?.()

      // Auto close after success
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : txt('errorSubmit'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        {submitted ? (
          // Success state
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-3xl">🎉</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{txt('successTitle')}</h3>
            <p className="text-gray-500">{txt('successDesc')}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-xl',
                  rating === 'helpful' ? 'bg-green-100' : 'bg-orange-100'
                )}>
                  {rating === 'helpful' ? '👍' : '👎'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {rating === 'helpful' ? modalText.header.helpful[lang] : modalText.header.notHelpful[lang]}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {rating === 'helpful' ? modalText.subheader.helpful[lang] : modalText.subheader.notHelpful[lang]}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Reason selection */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">{txt('selectReason')}</p>
              <div className="flex flex-wrap gap-2">
                {reasons.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => toggleReason(reason.id)}
                    className={cn(
                      'px-3 py-2 text-sm rounded-lg border transition-all',
                      selectedReasons.includes(reason.id)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {reason.label[lang]}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {txt('additionalComment')}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={rating === 'helpful'
                  ? txt('placeholderHelpful')
                  : txt('placeholderNotHelpful')
                }
                rows={3}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
              />
            </div>

            {/* Privacy note */}
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 flex items-start gap-2">
                <span className="flex-shrink-0">🔒</span>
                <span>{txt('privacyNote')}</span>
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                {txt('cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  'flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors',
                  rating === 'helpful'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-primary-500 hover:bg-primary-600',
                  'disabled:opacity-50'
                )}
              >
                {isSubmitting ? txt('submitting') : txt('submit')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
