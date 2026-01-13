/**
 * 下一步建议模块
 * 分为：立刻做、本周做、有人用了再做
 */

'use client'

interface NextStepsCardProps {
  today: string[]
  thisWeek: string[]
  later: string[]
}

interface StepsSectionProps {
  title: string
  items: string[]
  icon: string
  color: 'blue' | 'green' | 'gray'
  timeframe: string
}

function StepsSection({ title, items, icon, color, timeframe }: StepsSectionProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-900',
      badge: 'bg-blue-100 text-blue-700'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-900',
      badge: 'bg-green-100 text-green-700'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'text-gray-600',
      text: 'text-gray-900',
      badge: 'bg-gray-100 text-gray-700'
    }
  }

  const colors = colorClasses[color]

  return (
    <div className={`${colors.bg} rounded-lg border ${colors.border} p-5`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-2xl ${colors.icon}`}>{icon}</span>
          <h4 className={`font-semibold ${colors.text}`}>{title}</h4>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full ${colors.badge}`}>
          {timeframe}
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100"
          >
            <span className={`flex-shrink-0 w-5 h-5 rounded-full ${colors.bg} ${colors.icon} flex items-center justify-center text-xs font-medium mt-0.5`}>
              {idx + 1}
            </span>
            <span className="text-sm text-gray-800 leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function NextStepsCard({ today, thisWeek, later }: NextStepsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 下一步建议</h3>
        <p className="text-sm text-gray-600">
          不要一次想太多，按这个节奏来：
        </p>
      </div>

      <div className="space-y-4">
        {/* 立刻可以做（今天） */}
        {today.length > 0 && (
          <StepsSection
            title="立刻可以做"
            items={today}
            icon="🚀"
            color="blue"
            timeframe="今天"
          />
        )}

        {/* 这周可以做 */}
        {thisWeek.length > 0 && (
          <StepsSection
            title="这周可以做"
            items={thisWeek}
            icon="📅"
            color="green"
            timeframe="7天内"
          />
        )}

        {/* 有人用了再考虑 */}
        {later.length > 0 && (
          <StepsSection
            title="有人用了再考虑"
            items={later}
            icon="🔮"
            color="gray"
            timeframe="不着急"
          />
        )}
      </div>

      {/* 执行建议 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
        <div className="flex items-start gap-2">
          <span className="text-yellow-600 mt-0.5">💡</span>
          <div className="flex-1 text-sm">
            <div className="font-medium text-yellow-900 mb-1">执行建议：</div>
            <ul className="text-yellow-800 space-y-1">
              <li>• 先完成「立刻可以做」的事情，看到第一版</li>
              <li>• 发给朋友试用，收集真实反馈</li>
              <li>• 根据反馈决定是否继续做「这周」的任务</li>
              <li>• 不要提前做「有人用了再考虑」的功能</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
