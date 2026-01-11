/**
 * VoiceButton Component
 * Voice input button with enhanced recording state and bilingual support
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  className?: string
}

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

export function VoiceButton({ onTranscript, disabled, className }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [recordingTime, setRecordingTime] = useState(0)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if Web Speech API is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as Window & { 
        SpeechRecognition?: SpeechRecognitionConstructor
        webkitSpeechRecognition?: SpeechRecognitionConstructor 
      }).SpeechRecognition || (window as Window & { 
        SpeechRecognition?: SpeechRecognitionConstructor
        webkitSpeechRecognition?: SpeechRecognitionConstructor 
      }).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setIsSupported(false)
      }
    }
  }, [])

  // Recording timer effect
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setRecordingTime(0)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  const startRecording = useCallback(() => {
    if (disabled || !isSupported) return

    const SpeechRecognition = (window as Window & { 
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor 
    }).SpeechRecognition || (window as Window & { 
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor 
    }).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    // Use cmn-Hans-CN for Mandarin with mixed language support
    // This allows better recognition of Chinese with occasional English words
    recognition.lang = 'cmn-Hans-CN'
    recognition.continuous = true  // Allow continuous recording until user stops
    recognition.interimResults = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Collect all results
      let fullTranscript = ''
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript
      }
      if (fullTranscript) {
        onTranscript(fullTranscript)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      // Only set recording false if we're still supposed to be recording
      // (i.e., user didn't manually stop)
      if (recognitionRef.current) {
        setIsRecording(false)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }, [disabled, isSupported, onTranscript])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      setIsRecording(false)
    }
  }, [])

  const handleClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  if (!isSupported) {
    return null
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative flex items-center">
      {/* Recording time display */}
      {isRecording && (
        <span className="absolute right-14 text-sm font-medium text-red-500 animate-pulse whitespace-nowrap">
          {formatTime(recordingTime)}
        </span>
      )}
      
      {/* Main button with pulse ring animation */}
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'relative w-11 h-11 rounded-full flex items-center justify-center',
          'transition-all duration-200',
          isRecording
            ? 'bg-red-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-primary-600',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        title={isRecording ? '点击停止录音' : '点击开始录音'}
        aria-label={isRecording ? '停止录音' : '开始录音'}
      >
        {/* Pulse ring animation when recording */}
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75 pointer-events-none" />
            <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse pointer-events-none" />
          </>
        )}
        
        {/* Icon */}
        <span className="relative z-10">
          {isRecording ? (
            // Stop icon (square)
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            // Microphone icon
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v4m-4 0h8" />
            </svg>
          )}
        </span>
      </button>
    </div>
  )
}
