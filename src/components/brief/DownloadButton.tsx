/**
 * DownloadButton Component
 * Downloads markdown content as a file
 */

'use client'

import { cn } from '@/lib/utils'

interface DownloadButtonProps {
  markdown: string
  filename: string
  className?: string
}

export function DownloadButton({ markdown, filename, className }: DownloadButtonProps) {
  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-xl',
        'bg-primary-500 text-white font-medium',
        'hover:bg-primary-600 transition-colors',
        className
      )}
    >
      📥 下载 Markdown
    </button>
  )
}
