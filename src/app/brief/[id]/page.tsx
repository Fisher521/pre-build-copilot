/**
 * Brief Preview Page
 * Dynamic route for viewing generated briefs with Markdown rendering
 */

import { notFound } from 'next/navigation'
import { getBrief } from '@/lib/db/briefs'
import { BriefCard, DownloadButton, MarkdownPreview } from '@/components/brief'
import Link from 'next/link'

interface BriefPageProps {
  params: Promise<{ id: string }>
}

export default async function BriefPage({ params }: BriefPageProps) {
  const { id } = await params

  const brief = await getBrief(id)

  if (!brief) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/chat/${brief.conversation_id}`}
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            ← 返回对话
          </Link>
          <span className="text-green-600 font-medium flex items-center gap-1">
            ✓ 已完成
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900">
            你的 Pre-build Brief 已生成！
          </h1>
        </div>

        {/* Brief Card - Summary */}
        <div className="mb-8">
          <BriefCard
            projectName={brief.project_name}
            markdown={brief.markdown_content}
          />
        </div>

        {/* Full Markdown Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            👀 完整内容预览
          </h2>
          <MarkdownPreview content={brief.markdown_content} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <DownloadButton
            markdown={brief.markdown_content}
            filename={brief.project_name || 'pre-build-brief'}
          />
          <Link
            href={`/chat/${brief.conversation_id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            💬 继续对话
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            🔄 开始新项目
          </Link>
        </div>
      </main>
    </div>
  )
}
