'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslation } from '@/lib/i18n'

export function Navigation() {
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()
  const { t } = useTranslation()
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Logo - hidden on very small screens */}
          <Link href="/" className="hidden sm:flex items-center">
            <span className="text-base font-semibold text-gray-900">justart.today</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4 sm:gap-6 flex-1 sm:flex-none justify-center sm:justify-start sm:ml-8">
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

          {/* Language Switcher - Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors py-1"
            >
              <span>{language === 'zh' ? '中文' : 'EN'}</span>
              <svg className={cn("w-3 h-3 transition-transform", showLangDropdown && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-sm py-1 min-w-[60px] z-50">
                <button
                  onClick={() => { setLanguage('zh'); setShowLangDropdown(false) }}
                  className={cn(
                    'w-full px-3 py-1.5 text-sm text-left hover:bg-gray-50',
                    language === 'zh' ? 'text-indigo-600 font-medium' : 'text-gray-600'
                  )}
                >
                  中文
                </button>
                <button
                  onClick={() => { setLanguage('en'); setShowLangDropdown(false) }}
                  className={cn(
                    'w-full px-3 py-1.5 text-sm text-left hover:bg-gray-50',
                    language === 'en' ? 'text-indigo-600 font-medium' : 'text-gray-600'
                  )}
                >
                  EN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
