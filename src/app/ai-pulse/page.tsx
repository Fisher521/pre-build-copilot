'use client'

import { useTranslation } from '@/lib/i18n'

export default function AIPulsePage() {
  const { t, lang, translations } = useTranslation()
  const features = translations.aiPulse.features

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t('aiPulse.title')}</h1>
        <p className="text-gray-500 mb-6">{t('aiPulse.subtitle')}</p>

        {/* Coming Soon */}
        <p className="text-sm text-gray-400 mb-10">{t('aiPulse.comingSoon')}</p>

        {/* Feature Preview */}
        <div className="space-y-3">
          {features.map((feature) => (
            <div
              key={feature.title[lang]}
              className="p-4 bg-white border border-gray-200 rounded-lg text-left"
            >
              <span className="font-medium text-gray-900 text-sm">{feature.title[lang]}</span>
              <span className="text-xs text-gray-500 block mt-0.5">{feature.desc[lang]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
