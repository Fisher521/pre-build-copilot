'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

export function Footer() {
  const { language, setLanguage } = useLanguage()

  return (
    <footer className="border-t border-gray-100 bg-gray-50 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          {/* Language Switcher - Left side */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLanguage('zh')}
              className={cn(
                'px-2 py-1 rounded transition-colors text-sm',
                language === 'zh'
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              中文
            </button>
            <span className="text-gray-300">/</span>
            <button
              onClick={() => setLanguage('en')}
              className={cn(
                'px-2 py-1 rounded transition-colors text-sm',
                language === 'en'
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              EN
            </button>
          </div>

          {/* Center text */}
          <div className="flex items-center gap-2">
            <span>justart.today</span>
            <span className="text-gray-300 hidden sm:inline">·</span>
            <span className="hidden sm:inline">{language === 'zh' ? '开始你的 Vibe Coding 之旅' : 'Start your Vibe Coding journey'}</span>
          </div>

          {/* Spacer for balance - same width as language switcher */}
          <div className="w-[88px]"></div>
        </div>
      </div>
    </footer>
  )
}
