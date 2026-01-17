import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { LanguageProvider } from '@/contexts/LanguageContext'

export const metadata: Metadata = {
  title: 'justart.today - 项目可行性评估',
  description: '帮助 vibe coder 在写代码前快速评估项目的可行性、成本和风险。Just Start Today!',
  keywords: ['vibe coding', '项目评估', 'Indie Hacker', 'MVP', '可行性分析', 'justart.today', 'just start today'],
  authors: [{ name: 'justart.today' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased flex flex-col">
        <LanguageProvider>
          <Navigation />
          <main className="pt-14 flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
