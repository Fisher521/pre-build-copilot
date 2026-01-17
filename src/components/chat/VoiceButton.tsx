/**
 * VoiceButton Component
 * Voice input with Web Speech API for real-time streaming transcription
 * Falls back to MediaRecorder + Backend ASR if Web Speech API not available
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event & { error: string }) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  onInterimTranscript?: (text: string) => void  // 实时显示识别中的文字
  disabled?: boolean
  className?: string
}

export function VoiceButton({ onTranscript, onInterimTranscript, disabled, className }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [interimText, setInterimText] = useState('')
  const [useWebSpeech, setUseWebSpeech] = useState(true)

  // Web Speech API refs
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const startupTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fallback MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Flag to trigger fallback recording
  const [triggerFallback, setTriggerFallback] = useState(false)

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      setUseWebSpeech(false)
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
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (startupTimeoutRef.current) {
        clearTimeout(startupTimeoutRef.current)
      }
    }
  }, [])

  // ========== Web Speech API Methods ==========
  const startWebSpeechRecording = useCallback(() => {
    if (disabled || isProcessing) return

    setError(null)
    setInterimText('')

    try {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognitionAPI) {
        throw new Error('Web Speech API not supported')
      }

      const recognition = new SpeechRecognitionAPI()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'zh-CN'

      let finalTranscript = ''

      // Set timeout for API startup - if it takes too long, fallback to MediaRecorder
      startupTimeoutRef.current = setTimeout(() => {
        console.warn('Web Speech API startup timeout, falling back to MediaRecorder')
        recognition.abort()
        setUseWebSpeech(false)
        setTriggerFallback(true)
      }, 5000)

      recognition.onstart = () => {
        // Clear startup timeout since API started successfully
        if (startupTimeoutRef.current) {
          clearTimeout(startupTimeoutRef.current)
          startupTimeoutRef.current = null
        }
        setIsRecording(true)
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interim += result[0].transcript
          }
        }

        // 更新实时文字
        const currentText = finalTranscript + interim
        setInterimText(currentText)
        onInterimTranscript?.(currentText)
      }

      recognition.onerror = (event) => {
        // Clear startup timeout
        if (startupTimeoutRef.current) {
          clearTimeout(startupTimeoutRef.current)
          startupTimeoutRef.current = null
        }

        console.error('Speech recognition error:', event.error)
        if (event.error === 'not-allowed') {
          setError('麦克风权限被拒绝')
        } else if (event.error === 'no-speech') {
          setError('未检测到语音')
        } else if (event.error === 'network') {
          // Network error - fallback to MediaRecorder silently
          console.warn('Web Speech API network error, falling back to MediaRecorder')
          setUseWebSpeech(false)
          setTriggerFallback(true)
          return // Don't set recording false, will start MediaRecorder via effect
        } else if (event.error === 'aborted') {
          // User aborted, no error needed
        } else if (event.error === 'audio-capture') {
          setError('无法访问麦克风')
        } else if (event.error === 'service-not-allowed') {
          setError('语音服务不可用')
        } else {
          setError('语音识别出错')
        }
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
        // 发送最终识别结果
        if (finalTranscript.trim()) {
          onTranscript(finalTranscript.trim())
        }
        setInterimText('')
      }

      recognitionRef.current = recognition
      recognition.start()

    } catch (err) {
      console.error('Failed to start Web Speech:', err)
      setError('语音识别不可用')
      // Fallback to MediaRecorder
      setUseWebSpeech(false)
    }
  }, [disabled, isProcessing, onTranscript, onInterimTranscript])

  const stopWebSpeechRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
  }, [isRecording])

  // ========== MediaRecorder Fallback Methods ==========
  const startMediaRecording = useCallback(async () => {
    if (disabled || isProcessing) return

    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      })

      streamRef.current = stream
      audioChunksRef.current = []

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null

        if (audioChunksRef.current.length === 0) {
          setIsRecording(false)
          return
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        await processAudio(audioBlob)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000)
      setIsRecording(true)

    } catch (err) {
      console.error('Failed to start recording:', err)
      setError('无法访问麦克风')
    }
  }, [disabled, isProcessing])

  // Effect to trigger fallback recording when Web Speech API fails
  useEffect(() => {
    if (triggerFallback && !useWebSpeech) {
      setTriggerFallback(false)
      startMediaRecording()
    }
  }, [triggerFallback, useWebSpeech, startMediaRecording])

  const stopMediaRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
      setIsRecording(false)
    }
  }, [isRecording])

  // ========== Unified Start/Stop ==========
  const startRecording = useCallback(() => {
    if (useWebSpeech) {
      startWebSpeechRecording()
    } else {
      startMediaRecording()
    }
  }, [useWebSpeech, startWebSpeechRecording, startMediaRecording])

  const stopRecording = useCallback(() => {
    if (useWebSpeech) {
      stopWebSpeechRecording()
    } else {
      stopMediaRecording()
    }
  }, [useWebSpeech, stopWebSpeechRecording, stopMediaRecording])

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // Call backend ASR API
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      
      const response = await fetch('/api/speech', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (result.text && result.text.trim()) {
        onTranscript(result.text)
      } else if (result.error) {
        console.warn('ASR warning:', result.error)
        setError('识别失败，请重试')
      }
    } catch (err) {
      console.error('ASR request failed:', err)
      setError('语音识别服务不可用')
    } finally {
      setIsProcessing(false)
      setRecordingTime(0)
    }
  }

  const handleClick = () => {
    if (isProcessing) return
    
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative flex items-center">
      {/* Real-time transcription display (Web Speech API) */}
      {isRecording && useWebSpeech && interimText && (
        <div className="absolute right-14 max-w-[200px] text-sm text-gray-700 truncate animate-pulse">
          {interimText}
        </div>
      )}

      {/* Recording/Processing time display (fallback mode) */}
      {(isRecording || isProcessing) && !interimText && (
        <span className={cn(
          "absolute right-14 text-sm font-medium whitespace-nowrap",
          isProcessing ? "text-blue-500" : "text-red-500 animate-pulse"
        )}>
          {isProcessing ? '识别中...' : useWebSpeech ? '正在听...' : formatTime(recordingTime)}
        </span>
      )}

      {/* Error tooltip */}
      {error && !isRecording && !isProcessing && (
        <span className="absolute right-14 text-xs text-red-500 whitespace-nowrap">
          {error}
        </span>
      )}
      
      {/* Main button with pulse ring animation */}
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={cn(
          'relative w-11 h-11 rounded-full flex items-center justify-center',
          'transition-all duration-200',
          isProcessing
            ? 'bg-blue-500 text-white cursor-wait'
            : isRecording
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-indigo-600',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        title={isProcessing ? '正在识别...' : isRecording ? '点击停止录音' : '点击开始录音'}
        aria-label={isProcessing ? '正在识别' : isRecording ? '停止录音' : '开始录音'}
      >
        {/* Pulse ring animation when recording */}
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75 pointer-events-none" />
            <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse pointer-events-none" />
          </>
        )}
        
        {/* Spinning animation when processing */}
        {isProcessing && (
          <span className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white animate-spin pointer-events-none" />
        )}
        
        {/* Icon */}
        <span className="relative z-10">
          {isProcessing ? (
            // Processing icon (waves)
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v18M8 6v12M4 9v6M16 6v12M20 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          ) : isRecording ? (
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
