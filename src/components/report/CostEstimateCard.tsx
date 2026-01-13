/**
 * 成本估算表格
 * 时间成本 + 金钱成本
 */

export interface CostEstimateCardProps {
  timeBreakdown: string
  moneyBreakdown: string
}

export function CostEstimateCard({ timeBreakdown, moneyBreakdown }: CostEstimateCardProps) {
  // 解析时间成本（假设格式："最简版：2-3天；标准版：1周"）
  const parseTimeBreakdown = (text: string) => {
    const parts = text.split(/[；;]/).filter(Boolean)
    return parts.map(part => {
      const match = part.match(/(.+?)[:：](.+)/)
      if (match) {
        return { label: match[1].trim(), value: match[2].trim() }
      }
      return { label: '', value: part.trim() }
    })
  }

  // 解析金钱成本
  const parseMoneyBreakdown = (text: string) => {
    const parts = text.split(/\n/).filter(Boolean)
    return parts
  }

  const timeItems = parseTimeBreakdown(timeBreakdown)
  const moneyItems = parseMoneyBreakdown(moneyBreakdown)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">💰 成本估算</h3>
      <p className="text-sm text-gray-600 mb-6">做这个项目要花多少时间和钱</p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 时间成本 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⏱️</span>
            <h4 className="font-semibold text-gray-900">时间成本</h4>
          </div>

          <div className="space-y-3">
            {timeItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
              >
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm font-bold text-primary-700">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 text-xs text-gray-500">
            💡 建议从最简版开始，有人用了再加功能
          </div>
        </div>

        {/* 金钱成本 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💵</span>
            <h4 className="font-semibold text-gray-900">金钱成本</h4>
          </div>

          <div className="space-y-2">
            {moneyItems.map((item, idx) => {
              const isHeader = item.includes('开发期间') || item.includes('上线后')
              const isTotal = item.includes('总计') || item.includes('月度')

              if (isHeader) {
                return (
                  <div key={idx} className="font-semibold text-gray-900 mt-3 first:mt-0">
                    {item}
                  </div>
                )
              }

              if (isTotal) {
                return (
                  <div
                    key={idx}
                    className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 font-semibold text-green-800"
                  >
                    {item}
                  </div>
                )
              }

              return (
                <div key={idx} className="text-sm text-gray-700 pl-4">
                  {item}
                </div>
              )
            })}
          </div>

          <div className="mt-3 text-xs text-gray-500">
            💡 省钱建议：先用免费额度，等有用户了再考虑付费
          </div>
        </div>
      </div>

      {/* 总结提示 */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
        <div className="flex items-start gap-2">
          <span className="text-yellow-600 mt-0.5">💡</span>
          <div className="flex-1 text-sm text-yellow-800">
            <strong>重要：</strong>不要花太多时间在完美上。能用就上线，有人用了再优化。
            大多数项目失败不是因为功能不够，而是因为没人用。
          </div>
        </div>
      </div>
    </div>
  )
}
