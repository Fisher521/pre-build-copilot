/**
 * Speech Recognition API Route
 * POST /api/speech - Transcribe audio using Qwen2-Audio or OpenAI Whisper
 * Supports Chinese-English mixed speech recognition
 * Includes AI optimization to clean up recognition results
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

/**
 * Use AI to optimize and clean up voice recognition text
 * - Fix punctuation and formatting
 * - Correct common recognition errors
 * - Make the text more coherent
 */
async function optimizeTranscript(rawText: string, language: string = 'zh'): Promise<string> {
  const qwenKey = process.env.QWEN_API_KEY
  if (!qwenKey || !rawText.trim()) return rawText

  try {
    const client = new OpenAI({
      apiKey: qwenKey,
      baseURL: process.env.QWEN_API_BASE || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    })

    // Language-specific prompts
    const systemPrompt = language === 'en'
      ? `You are a voice-to-text optimization assistant. The user's input is raw speech recognition output that may have issues:
1. Missing punctuation
2. Colloquial expressions
3. Repeated or redundant words
4. Speech recognition errors

Please optimize the text while preserving the original meaning. Output ONLY the optimized text in English, no explanations. If the original is already good, return it as is. IMPORTANT: Output must be in English only, no Chinese characters.`
      : `你是一个语音转文字优化助手。用户的输入是语音识别的原始结果，可能有以下问题：
1. 缺少标点符号
2. 存在口语化表达
3. 有重复或冗余的词
4. 语音识别的错字

请优化文本，但保持原意不变。只输出优化后的文本，不要加任何解释。如果原文已经很好，直接返回原文。重要：输出必须是中文，尽量避免英文。`

    const response = await client.chat.completions.create({
      model: 'qwen-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: rawText
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const optimized = response.choices[0]?.message?.content?.trim()
    return optimized || rawText
  } catch (error) {
    console.error('Voice optimization error:', error)
    return rawText
  }
}

export async function POST(request: NextRequest) {
  let language = 'zh' // Default language, defined outside try for catch block access

  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as Blob | null
    const skipOptimize = formData.get('skipOptimize') === 'true'
    language = (formData.get('language') as string) || 'zh'

    if (!audioFile) {
      return NextResponse.json(
        { error: language === 'en' ? 'No audio file found' : '未找到音频文件' },
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
            // AI optimization for better accuracy with language preference
            const optimizedText = skipOptimize ? cleanText : await optimizeTranscript(cleanText, language)
            return NextResponse.json({
              text: optimizedText,
              rawText: cleanText,
              optimized: !skipOptimize && optimizedText !== cleanText,
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
        // Use language preference: zh for Chinese, en for English
        whisperFormData.append('language', language === 'en' ? 'en' : 'zh')

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
          },
          body: whisperFormData,
        })

        if (response.ok) {
          const result = await response.json()
          const rawText = result.text || ''
          // AI optimization for better accuracy with language preference
          const optimizedText = skipOptimize ? rawText : await optimizeTranscript(rawText, language)
          return NextResponse.json({
            text: optimizedText,
            rawText: rawText,
            optimized: !skipOptimize && optimizedText !== rawText,
            success: true,
          })
        }
      } catch (whisperError) {
        console.error('Whisper API failed:', whisperError)
      }
    }

    return NextResponse.json({
      text: '',
      error: language === 'en' ? 'Speech recognition service unavailable' : '语音识别服务不可用，请检查 API 配置',
    })
  } catch (error) {
    console.error('Speech API error:', error)
    return NextResponse.json(
      {
        error: language === 'en' ? 'Speech recognition failed' : '语音识别失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


