import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pre-build Copilot - 开发前决策助手',
  description: '帮助独立开发者在写代码前理清思路，减少技术方案反复横跳，输出可执行的行动方案。',
  keywords: ['开发决策', '独立开发者', 'Indie Hacker', 'MVP', '技术方案'],
  authors: [{ name: 'Pre-build Copilot' }],
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
