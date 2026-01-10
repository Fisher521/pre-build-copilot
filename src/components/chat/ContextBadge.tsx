/**
 * ContextBadge Component
 * Displays wizard context in chat header
 */

interface ContextBadgeProps {
  projectType: string
  timeBudget: string
  audience: string
}

const TYPE_LABELS: Record<string, string> = {
  app: '📱 App',
  web: '🌐 网站',
  tool: '🔧 工具',
  ai: '🤖 AI 产品',
  other: '💬 其他',
}

const TIME_LABELS: Record<string, string> = {
  weekend: '🚀 这周末',
  month: '📅 一个月',
  flexible: '🐢 慢慢做',
}

const AUDIENCE_LABELS: Record<string, string> = {
  self: '👤 自己用',
  friends: '👥 朋友用',
  public: '🌍 公开发布',
}

export function ContextBadge({ projectType, timeBudget, audience }: ContextBadgeProps) {
  const items = [
    TYPE_LABELS[projectType],
    TIME_LABELS[timeBudget],
    AUDIENCE_LABELS[audience],
  ].filter(Boolean)

  if (items.length === 0) return null

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">
        {items.map((item, i) => (
          <span key={i}>
            {item}
            {i < items.length - 1 && <span className="mx-1 text-gray-300">·</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
