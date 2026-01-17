import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'JustArt - 项目可行性评估',
  description: '帮助 vibe coder 在写代码前快速评估项目的可行性、成本和风险。',
  keywords: ['vibe coding', '项目评估', 'Indie Hacker', 'MVP', '可行性分析', 'JustArt'],
  authors: [{ name: 'JustArt' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <Navigation />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  )
}
