/**
 * Speech Recognition API Route
 * POST /api/speech - Transcribe audio using Qwen2-Audio or OpenAI Whisper
 * Supports Chinese-English mixed speech recognition
 */

import { NextRequest, NextResponse } from 'next/server'

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

    // Convert audio to base64 for Qwen2-Audio
    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')
    const audioDataUrl = `data:audio/webm;base64,${base64Audio}`

    // Try Qwen2-Audio first (uses QWEN_API_KEY)
    const qwenKey = process.env.QWEN_API_KEY
    const qwenBase = process.env.QWEN_API_BASE || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'

    if (qwenKey) {
      try {
        const response = await fetch(`${qwenBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${qwenKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'qwen2-audio-instruct',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'audio_url',
                    audio_url: {
                      url: audioDataUrl,
                    },
                  },
                  {
                    type: 'text',
                    text: '请将这段音频中的语音内容逐字转录为文字，只输出转录结果，不要添加任何解释或格式。如果听不清或无法识别，请输出空字符串。',
                  },
                ],
              },
            ],
            max_tokens: 1000,
            temperature: 0.1,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          const text = result.choices?.[0]?.message?.content || ''
          
          // Clean up the response - remove common AI prefixes
          const cleanText = text
            .replace(/^(转录结果[：:]\s*|音频内容[：:]\s*|语音内容[：:]\s*)/i, '')
            .replace(/^["']|["']$/g, '')
            .trim()

          return NextResponse.json({
            text: cleanText,
            success: true,
          })
        } else {
          const errorText = await response.text()
          console.error('Qwen2-Audio error:', errorText)
        }
      } catch (qwenError) {
        console.error('Qwen2-Audio request failed:', qwenError)
      }
    }

    // Fallback: Try OpenAI Whisper
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
      try {
        const whisperFormData = new FormData()
        const audioBlob = new Blob([arrayBuffer], { type: 'audio/webm' })
        whisperFormData.append('file', audioBlob, 'audio.webm')
        whisperFormData.append('model', 'whisper-1')
        whisperFormData.append('language', 'zh')

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
          },
          body: whisperFormData,
        })

        if (response.ok) {
          const result = await response.json()
          return NextResponse.json({
            text: result.text || '',
            success: true,
          })
        }
      } catch (whisperError) {
        console.error('Whisper API failed:', whisperError)
      }
    }

    return NextResponse.json({
      text: '',
      error: '语音识别服务不可用，请检查 API 配置',
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


