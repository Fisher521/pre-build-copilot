'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

export function Navigation() {
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false)
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

  // 报告页在移动端隐藏全局导航（报告页有自己的导航）
  const isReportPage = pathname.startsWith('/report')

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200",
      isReportPage && "hidden sm:block" // 移动端报告页隐藏
    )}>
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

          {/* Language Switcher - Dropdown */}
          <div className="ml-auto relative" ref={langMenuRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>{language === 'zh' ? '中文' : 'EN'}</span>
              <svg className={cn("w-3 h-3 transition-transform", showLangMenu && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showLangMenu && (
              <div className="absolute top-full right-0 mt-1 w-28 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => {
                    setLanguage('zh')
                    setShowLangMenu(false)
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between',
                    language === 'zh' ? 'text-indigo-600 font-medium' : 'text-gray-700'
                  )}
                >
                  中文
                  {language === 'zh' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => {
                    setLanguage('en')
                    setShowLangMenu(false)
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between',
                    language === 'en' ? 'text-indigo-600 font-medium' : 'text-gray-700'
                  )}
                >
                  English
                  {language === 'en' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
