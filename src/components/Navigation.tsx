'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslation } from '@/lib/i18n'

export function Navigation() {
  const pathname = usePathname()
  const [showLangTooltip, setShowLangTooltip] = useState(false)
  const { language, setLanguage, isEnglishEnabled } = useLanguage()
  const { t } = useTranslation()

  const navItems = [
    { href: '/', label: t('nav.vibeChecker'), icon: '🎯' },
    { href: '/ai-pulse', label: t('nav.aiPulse'), icon: '📡' },
  ]

  // 判断是否在首页相关路径
  const isHome = pathname === '/' || pathname.startsWith('/review') || pathname.startsWith('/report')
  const isAIPulse = pathname.startsWith('/ai-pulse')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-sm"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)' }}
            >
              <span className="text-white">💡</span>
            </div>
            <span className="font-bold text-gray-900">justart.today</span>
          </Link>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive =
                (item.href === '/' && isHome) ||
                (item.href === '/ai-pulse' && isAIPulse)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  )}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Language Switcher */}
          <div className="relative flex items-center gap-1 bg-gray-100 rounded-full p-1">
            {/* Chinese */}
            <button
              onClick={() => setLanguage('zh')}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-all',
                language === 'zh'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              中文
            </button>

            {/* English - Coming Soon (or active if enabled) */}
            <div className="relative">
              <button
                onClick={() => isEnglishEnabled && setLanguage('en')}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all',
                  !isEnglishEnabled && 'cursor-not-allowed',
                  language === 'en' && isEnglishEnabled
                    ? 'bg-white text-gray-900 shadow-sm'
                    : isEnglishEnabled
                    ? 'text-gray-500 hover:text-gray-700'
                    : 'text-gray-400'
                )}
                onMouseEnter={() => !isEnglishEnabled && setShowLangTooltip(true)}
                onMouseLeave={() => setShowLangTooltip(false)}
              >
                EN
              </button>

              {/* Tooltip - Only show when English is not enabled */}
              {showLangTooltip && !isEnglishEnabled && (
                <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
                  Coming Soon
                  <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
