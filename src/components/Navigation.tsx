'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

export function Navigation() {
  const pathname = usePathname()
  const { language } = useLanguage()

  const navItems = [
    { href: '/', label: language === 'zh' ? '项目评估' : 'Vibe Checker' },
    { href: '/ai-pulse', label: language === 'zh' ? 'AI 日报' : 'AI Pulse' },
  ]

  // 判断是否在首页相关路径
  const isHome = pathname === '/' || pathname.startsWith('/review') || pathname.startsWith('/report') || pathname.startsWith('/questions')
  const isAIPulse = pathname.startsWith('/ai-pulse')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-12 sm:h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-base font-semibold text-gray-900">justart.today</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6 ml-8">
            {navItems.map((item) => {
              const isActive =
                (item.href === '/' && isHome) ||
                (item.href === '/ai-pulse' && isAIPulse)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm transition-colors relative py-1 whitespace-nowrap',
                    isActive
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-[13px] sm:-bottom-[17px] left-0 right-0 h-[2px] bg-indigo-500" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
