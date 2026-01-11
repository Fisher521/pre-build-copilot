/**
 * VoiceButton Component
 * Voice input button with MediaRecorder + Dashscope ASR
 * Falls back to Web Speech API if backend ASR fails
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  className?: string
}

export function VoiceButton({ onTranscript, disabled, className }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

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
    }
  }, [])

  const startRecording = useCallback(async () => {
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
      
      // Try to use webm format, fallback to whatever is available
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
        // Stop all tracks
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
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      
    } catch (err) {
      console.error('Failed to start recording:', err)
      setError('无法访问麦克风')
    }
  }, [disabled, isProcessing])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
      setIsRecording(false)
    }
  }, [isRecording])

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
      {/* Recording/Processing time display */}
      {(isRecording || isProcessing) && (
        <span className={cn(
          "absolute right-14 text-sm font-medium whitespace-nowrap",
          isProcessing ? "text-blue-500" : "text-red-500 animate-pulse"
        )}>
          {isProcessing ? '识别中...' : formatTime(recordingTime)}
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
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-primary-600',
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
