import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { HtmlLangUpdater } from '@/components/HtmlLangUpdater'
import { LanguageProvider } from '@/contexts/LanguageContext'

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const lang = cookieStore.get('preferred-lang')?.value || 'zh'

  const isEnglish = lang === 'en'

  return {
    title: isEnglish
      ? 'justart.today - Project Feasibility Checker'
      : 'justart.today - 项目可行性评估',
    description: isEnglish
      ? 'Help vibe coders quickly evaluate project feasibility, cost, and risks before coding. Just Start Today!'
      : '帮助 vibe coder 在写代码前快速评估项目的可行性、成本和风险。Just Start Today!',
    keywords: isEnglish
      ? ['vibe coding', 'project evaluation', 'Indie Hacker', 'MVP', 'feasibility analysis', 'justart.today', 'just start today']
      : ['vibe coding', '项目评估', 'Indie Hacker', 'MVP', '可行性分析', 'justart.today', 'just start today'],
    authors: [{ name: 'justart.today' }],
  }
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
          <HtmlLangUpdater />
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
