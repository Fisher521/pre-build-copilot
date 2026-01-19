'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

/**
 * Client component that updates the html lang attribute based on language preference
 */
export function HtmlLangUpdater() {
  const { language } = useLanguage()

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN'
  }, [language])

  return null
}
