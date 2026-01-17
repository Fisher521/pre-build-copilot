'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { t, translations, type Language } from './translations'

/**
 * Hook to use translations in components
 */
export function useTranslation() {
  const { language } = useLanguage()

  return {
    t: (path: string, params?: Record<string, string | number>) => t(path, language, params),
    lang: language,
    translations,
  }
}

/**
 * Get translation for a specific language (for use outside React components)
 */
export function getTranslation(lang: Language) {
  return {
    t: (path: string, params?: Record<string, string | number>) => t(path, lang, params),
    lang,
    translations,
  }
}

export { type Language } from './translations'
