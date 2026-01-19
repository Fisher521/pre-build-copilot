'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

export function Footer() {
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

  return (
    <footer className="border-t border-gray-100 bg-gray-50 py-14 mt-auto">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex flex-col items-center gap-8 text-sm text-gray-500">
          {/* Language Switcher - Left side, Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-2 py-1 text-sm text-gray-500 hover:text-gray-700 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>{language === 'zh' ? '中文' : 'English'}</span>
              <svg className={cn("w-3 h-3 transition-transform", showLangMenu && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu - Opens upward */}
            {showLangMenu && (
              <div className="absolute bottom-full left-0 mb-1 w-28 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => {
                    setLanguage('zh')
                    setShowLangMenu(false)
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors',
                    language === 'zh' ? 'text-gray-900 font-medium' : 'text-gray-600'
                  )}
                >
                  中文
                </button>
                <button
                  onClick={() => {
                    setLanguage('en')
                    setShowLangMenu(false)
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors',
                    language === 'en' ? 'text-gray-900 font-medium' : 'text-gray-600'
                  )}
                >
                  English
                </button>
              </div>
            )}
          </div>

          {/* Center text */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>justart.today</span>
            <span className="text-gray-300">·</span>
            <span className="hidden sm:inline">{language === 'zh' ? '开始你的 Vibe Coding 之旅' : 'Start your Vibe Coding journey'}</span>
            <span className="hidden sm:inline text-gray-300">·</span>
            <span>by Fisher Shen</span>
            <span className="text-gray-300">·</span>
            <a href="mailto:hawking520@gmail.com" className="hover:text-gray-600 transition-colors">hawking520@gmail.com</a>
          </div>

          {/* Social Links - Right side */}
          {language === 'zh' ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.49.49 0 01-.009-.097c0-.165.103-.315.177-.387C23.227 18.08 24 16.468 24 14.71c0-3.378-3.074-5.797-7.062-5.852zm-2.07 2.536c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.14 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z"/>
                </svg>
                <span>运营什么东西</span>
              </span>
              <a
                href="https://www.xiaohongshu.com/user/profile/578c9bab6a6a69400dcdf560"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2v-4h2v4zm0-6h-2V9h2v2z"/>
                </svg>
                <span>小红书</span>
              </a>
            </div>
          ) : (
            <a
              href="https://x.com/hawking520"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>X</span>
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
