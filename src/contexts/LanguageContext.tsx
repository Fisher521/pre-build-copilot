'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'zh' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  isEnglishEnabled: boolean  // 英文是否已启用（目前为 false）
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 从 cookie 读取语言偏好
function getLanguageFromCookie(): Language {
  if (typeof document === 'undefined') return 'zh'
  const match = document.cookie.match(/preferred-lang=(zh|en)/)
  return (match?.[1] as Language) || 'zh'
}

// 设置语言 cookie
function setLanguageCookie(lang: Language) {
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)
  document.cookie = `preferred-lang=${lang}; expires=${expires.toUTCString()}; path=/; samesite=lax`
}

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('zh')
  const [mounted, setMounted] = useState(false)

  // 英文功能已启用
  const isEnglishEnabled = true

  useEffect(() => {
    // 客户端挂载后从 cookie 读取语言
    setLanguageState(getLanguageFromCookie())
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    // 如果英文未启用且尝试切换到英文，忽略
    if (lang === 'en' && !isEnglishEnabled) {
      return
    }
    setLanguageState(lang)
    setLanguageCookie(lang)
  }

  // 避免 hydration 不匹配
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: 'zh', setLanguage, isEnglishEnabled }}>
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isEnglishEnabled }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
