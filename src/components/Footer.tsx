'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

export function Footer() {
  const { language, setLanguage } = useLanguage()

  return (
    <footer className="border-t border-gray-100 bg-gray-50 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          {/* Copyright */}
          <div className="flex items-center gap-2">
            <span>justart.today</span>
            <span className="text-gray-300">·</span>
            <span>{language === 'zh' ? '开始你的 Vibe Coding 之旅' : 'Start your Vibe Coding journey'}</span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setLanguage('zh')}
              className={cn(
                'px-2 py-1 rounded transition-colors',
                language === 'zh'
                  ? 'bg-gray-200 text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
            >
              中文
            </button>
            <span className="text-gray-300">/</span>
            <button
              onClick={() => setLanguage('en')}
              className={cn(
                'px-2 py-1 rounded transition-colors',
                language === 'en'
                  ? 'bg-gray-200 text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
