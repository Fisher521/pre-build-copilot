import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vibe Checker - 项目可行性评估',
  description: '帮助 vibe coder 在写代码前快速评估项目的可行性、成本和风险。',
  keywords: ['vibe coding', '项目评估', 'Indie Hacker', 'MVP', '可行性分析'],
  authors: [{ name: 'Vibe Checker' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
