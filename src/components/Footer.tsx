'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export function Footer() {
  const { language } = useLanguage()

  return (
    <footer className="border-t border-gray-100 bg-gray-50 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>justart.today</span>
            <span className="text-gray-300">·</span>
            <span>{language === 'zh' ? '开始你的 Vibe Coding 之旅' : 'Start your Vibe Coding journey'}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
