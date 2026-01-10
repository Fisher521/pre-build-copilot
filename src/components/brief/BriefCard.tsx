/**
 * BriefCard Component
 * Preview card showing brief summary
 */

interface BriefCardProps {
  projectName: string
  markdown: string
}

export function BriefCard({ projectName, markdown }: BriefCardProps) {
  // Extract key sections from markdown
  const sections = extractSections(markdown)

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          📄 {projectName} Pre-build Brief
        </h2>
      </div>

      {/* Summary Sections */}
      <div className="p-6 space-y-4">
        {sections.overview && (
          <div>
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
              📊 项目概览
            </h3>
            <p className="text-gray-600 text-sm">{sections.overview}</p>
          </div>
        )}

        {sections.techStack && (
          <div>
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
              🛠️ 技术方案
            </h3>
            <p className="text-gray-600 text-sm">{sections.techStack}</p>
          </div>
        )}

        {sections.timeline && (
          <div>
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
              ⏱️ 预计时间
            </h3>
            <p className="text-gray-600 text-sm">{sections.timeline}</p>
          </div>
        )}

        {sections.cost && (
          <div>
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
              💰 成本估算
            </h3>
            <p className="text-gray-600 text-sm">{sections.cost}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper to extract key sections from markdown
function extractSections(markdown: string): {
  overview?: string
  techStack?: string
  timeline?: string
  cost?: string
} {
  const sections: Record<string, string> = {}

  // Simple extraction - look for headers and get following content
  const overviewMatch = markdown.match(/核心价值.*?[:：](.+?)(?=\n[#\-]|\n\n)/s)
  if (overviewMatch) {
    sections.overview = overviewMatch[1].trim().slice(0, 150) + '...'
  }

  const techMatch = markdown.match(/技术栈.*?[:：](.+?)(?=\n[#\-]|\n\n)/s)
  if (techMatch) {
    sections.techStack = techMatch[1].trim().slice(0, 100)
  }

  const timeMatch = markdown.match(/开发周期.*?[:：](.+?)(?=\n[#\-]|\n\n)/s)
  if (timeMatch) {
    sections.timeline = timeMatch[1].trim()
  }

  const costMatch = markdown.match(/成本估算.*?[:：](.+?)(?=\n[#\-]|\n\n)/s)
  if (costMatch) {
    sections.cost = costMatch[1].trim()
  }

  return sections
}
