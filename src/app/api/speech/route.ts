/**
 * Speech Recognition API Route
 * POST /api/speech - Transcribe audio using Alibaba Cloud Paraformer ASR
 */

import { NextRequest, NextResponse } from 'next/server'

// Dashscope ASR endpoint
const ASR_ENDPOINT = 'https://dashscope.aliyuncs.com/api/v1/services/audio/asr/transcription'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as Blob | null

    if (!audioFile) {
      return NextResponse.json(
        { error: '未找到音频文件' },
        { status: 400 }
      )
    }

    const apiKey = process.env.QWEN_API_KEY

    if (!apiKey) {
      console.error('QWEN_API_KEY not configured')
      return NextResponse.json(
        { error: 'API 密钥未配置' },
        { status: 500 }
      )
    }

    // Convert Blob to base64
    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')

    // Call Dashscope Paraformer ASR API
    const response = await fetch(ASR_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'paraformer-realtime-v2',
        input: {
          audio: base64Audio,
          format: 'webm',  // Browser MediaRecorder default format
          sample_rate: 16000,
        },
        parameters: {
          language_hints: ['zh', 'en'],  // Support Chinese and English mixed
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Dashscope ASR error:', errorText)
      
      // Fallback: return empty if ASR fails
      return NextResponse.json({
        text: '',
        error: 'ASR 服务暂时不可用',
      })
    }

    const result = await response.json()
    
    // Extract transcription text from response
    const text = result.output?.text || result.output?.sentence || ''

    return NextResponse.json({
      text,
      success: true,
    })
  } catch (error) {
    console.error('Speech API error:', error)
    return NextResponse.json(
      { 
        error: '语音识别失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
