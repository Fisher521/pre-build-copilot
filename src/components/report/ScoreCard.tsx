/**
 * 一句话结论评分卡片
 * 显示可行性评分和四维度评分
 */

import type { ReportScore } from '@/lib/types'

interface ScoreCardProps {
  score: ReportScore
  conclusion: string
}

export function ScoreCard({ score, conclusion }: ScoreCardProps) {
  // 根据分数确定颜色
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600'
    if (value >= 60) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getScoreBgColor = (value: number) => {
    if (value >= 80) return 'from-green-500 to-emerald-500'
    if (value >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-orange-500 to-red-500'
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
      {/* 中心评分 */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(score.feasibility)}`}>
                {score.feasibility}
              </div>
              <div className="text-xs text-gray-500 mt-1">可行性评分</div>
            </div>
          </div>
        </div>

        {/* 一句话结论 */}
        <p className="text-lg text-gray-800 mt-6 max-w-2xl mx-auto font-medium">
          {conclusion}
        </p>
      </div>

      {/* 四维度评分 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 技术可行 */}
        <div className="text-center">
          <div className="mb-2">
            <div className={`text-3xl font-bold ${getScoreColor(score.breakdown.tech)}`}>
              {score.breakdown.tech}
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getScoreBgColor(score.breakdown.tech)} rounded-full transition-all duration-500`}
              style={{ width: `${score.breakdown.tech}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-2">技术可行</div>
          <div className="text-xs text-gray-400">一个人能不能做</div>
        </div>

        {/* 市场机会 */}
        <div className="text-center">
          <div className="mb-2">
            <div className={`text-3xl font-bold ${getScoreColor(score.breakdown.market)}`}>
              {score.breakdown.market}
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getScoreBgColor(score.breakdown.market)} rounded-full transition-all duration-500`}
              style={{ width: `${score.breakdown.market}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-2">市场机会</div>
          <div className="text-xs text-gray-400">有没有空间</div>
        </div>

        {/* 上手难度 */}
        <div className="text-center">
          <div className="mb-2">
            <div className={`text-3xl font-bold ${getScoreColor(score.breakdown.onboarding)}`}>
              {score.breakdown.onboarding}
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getScoreBgColor(score.breakdown.onboarding)} rounded-full transition-all duration-500`}
              style={{ width: `${score.breakdown.onboarding}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-2">上手难度</div>
          <div className="text-xs text-gray-400">多快能看到东西</div>
        </div>

        {/* 用户匹配 */}
        <div className="text-center">
          <div className="mb-2">
            <div className={`text-3xl font-bold ${getScoreColor(score.breakdown.user_match)}`}>
              {score.breakdown.user_match}
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getScoreBgColor(score.breakdown.user_match)} rounded-full transition-all duration-500`}
              style={{ width: `${score.breakdown.user_match}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-2">用户匹配</div>
          <div className="text-xs text-gray-400">根据问卷匹配</div>
        </div>
      </div>

      {/* 行动按钮 */}
      <div className="mt-8 flex gap-4 justify-center">
        <button className="px-6 py-2 bg-gradient-to-r from-primary-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all">
          直接开始做 →
        </button>
        <button className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
          展开详细分析
        </button>
      </div>
    </div>
  )
}
