'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslation } from '@/lib/i18n'

export function Navigation() {
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()
  const { t } = useTranslation()

  const navItems = [
    { href: '/', label: t('nav.vibeChecker') },
    { href: '/ai-pulse', label: t('nav.aiPulse') },
  ]

  // 判断是否在首页相关路径
  const isHome = pathname === '/' || pathname.startsWith('/review') || pathname.startsWith('/report') || pathname.startsWith('/questions')
  const isAIPulse = pathname.startsWith('/ai-pulse')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900 tracking-tight">justart.today</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive =
                (item.href === '/' && isHome) ||
                (item.href === '/ai-pulse' && isAIPulse)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm transition-colors relative py-1',
                    isActive
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-gray-900" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Language Switcher - Vertical */}
          <div className="flex flex-col items-end gap-0 text-xs leading-tight">
            <button
              onClick={() => setLanguage('zh')}
              className={cn(
                'transition-colors',
                language === 'zh'
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={cn(
                'transition-colors',
                language === 'en'
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
