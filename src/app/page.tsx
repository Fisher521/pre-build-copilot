'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { WizardContainer, type WizardData } from '@/components/wizard'

export default function HomePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleWizardComplete = async (data: WizardData) => {
    setError(null)
    
    try {
      // Create conversation with wizard data
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wizardData: data,
        }),
      })

      if (!response.ok) {
        throw new Error('创建对话失败')
      }

      const result = await response.json()
      
      // Navigate to chat page with wizard context
      router.push(`/chat/${result.conversationId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生错误')
    }
  }

  return (
    <>
      <WizardContainer onComplete={handleWizardComplete} />
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </>
  )
}
