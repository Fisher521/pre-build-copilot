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

    // Convert audio to base64
    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')

    // Try Qwen3-ASR-Flash (DashScope International)
    const qwenKey = process.env.QWEN_API_KEY

    if (qwenKey) {
      try {
        // Use DashScope International API with qwen3-asr-flash model
        const response = await fetch('https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${qwenKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'qwen3-asr-flash',
            input: {
              messages: [
                {
                  role: 'system',
                  content: [{ text: '' }],
                },
                {
                  role: 'user',
                  content: [
                    {
                      audio: `data:audio/webm;base64,${base64Audio}`,
                    },
                  ],
                },
              ],
            },
            parameters: {
              asr_options: {
                enable_itn: true,
              },
            },
          }),
        })

        if (response.ok) {
          const result = await response.json()
          // DashScope returns: output.choices[0].message.content[0].text
          const content = result.output?.choices?.[0]?.message?.content
          let text = ''
          if (Array.isArray(content)) {
            text = content.find((c: { text?: string }) => c.text)?.text || ''
          } else if (typeof content === 'string') {
            text = content
          }

          // Clean up the response
          const cleanText = text
            .replace(/^["']|["']$/g, '')
            .trim()

          if (cleanText) {
            return NextResponse.json({
              text: cleanText,
              success: true,
            })
          }
        } else {
          const errorText = await response.text()
          console.error('Qwen3-ASR error:', errorText)
        }
      } catch (qwenError) {
        console.error('Qwen3-ASR request failed:', qwenError)
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


