'use client'

export default function AIPulsePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/40 via-transparent to-transparent" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Icon */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 blur-xl opacity-40 animate-pulse" />
          <div
            className="relative w-full h-full rounded-2xl flex items-center justify-center text-5xl shadow-xl"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #4F46E5 100%)' }}
          >
            <span className="text-white drop-shadow-sm">📡</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">AI Pulse</h1>
        <p className="text-gray-500 text-lg mb-8">探索 AI 世界的最新动态</p>

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
          </span>
          <span className="text-gray-700 font-medium">即将上线，敬请期待</span>
        </div>

        {/* Feature Preview */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🔥', title: 'AI 热点', desc: '实时追踪 AI 领域热门话题' },
            { icon: '📊', title: '趋势分析', desc: '深度解读 AI 发展趋势' },
            { icon: '💡', title: '灵感库', desc: '发现最具潜力的 AI 项目' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100"
            >
              <span className="text-2xl mb-2 block">{feature.icon}</span>
              <span className="font-medium text-gray-900 block text-sm">{feature.title}</span>
              <span className="text-xs text-gray-500">{feature.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
