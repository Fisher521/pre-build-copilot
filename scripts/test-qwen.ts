/**
 * Test script for Qwen API connection
 * Run with: npx tsx scripts/test-qwen.ts
 */

import OpenAI from 'openai'

// Load environment variables from .env.local
import { config } from 'dotenv'
config({ path: '.env.local' })

const client = new OpenAI({
  apiKey: process.env.QWEN_API_KEY!,
  baseURL: process.env.QWEN_API_BASE || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
})

const MODEL = process.env.QWEN_MODEL || 'qwen-plus'

async function testBasicConnection() {
  console.log('🔌 测试 Qwen API 连接...\n')
  console.log(`API Base: ${process.env.QWEN_API_BASE}`)
  console.log(`Model: ${MODEL}`)
  console.log(`API Key: ${process.env.QWEN_API_KEY?.slice(0, 10)}...`)
  console.log('')

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: '你是一个友好的助手' },
        { role: 'user', content: '你好，请用一句话介绍自己' },
      ],
      max_tokens: 100,
    })

    const content = response.choices[0]?.message?.content
    console.log('✅ 连接成功！')
    console.log(`AI 回复: ${content}\n`)
    return true
  } catch (error) {
    console.error('❌ 连接失败:', error)
    return false
  }
}

async function testCopilotPrompt() {
  console.log('🤖 测试 Pre-build Copilot Prompt...\n')

  const systemPrompt = `你是一个温和、不评判的开发决策助手。

核心原则：
1. 用温和的语气引导用户
2. 提供选择题时包含"不确定"选项
3. 每次总结后再提问

当前处于 Layer 1（随便聊聊）。请用友好的方式回复用户。`

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: '我想做一个任务管理工具' },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const content = response.choices[0]?.message?.content
    console.log('✅ Prompt 测试成功！')
    console.log('---')
    console.log(content)
    console.log('---\n')
    return true
  } catch (error) {
    console.error('❌ Prompt 测试失败:', error)
    return false
  }
}

async function testChoicesFormat() {
  console.log('📝 测试选择题格式...\n')

  const systemPrompt = `你是一个开发决策助手。

当需要提供选择题时，请在回复内容之后加上以下格式：

---CHOICES---
{"choices": [{"id": "1", "text": "选项1"}, {"id": "2", "text": "选项2"}]}

现在请问用户一个选择题。`

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: '我想做一个记账app' },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const content = response.choices[0]?.message?.content || ''
    console.log('AI 回复:')
    console.log('---')
    console.log(content)
    console.log('---\n')

    // Check if choices format is present
    if (content.includes('---CHOICES---')) {
      console.log('✅ 选择题格式正确！')

      // Try to parse
      const marker = '---CHOICES---'
      const jsonStr = content.split(marker)[1]?.trim()
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr)
        console.log('解析结果:', JSON.stringify(parsed, null, 2))
      }
    } else {
      console.log('⚠️ 回复中没有选择题格式（可能是普通对话）')
    }

    return true
  } catch (error) {
    console.error('❌ 选择题测试失败:', error)
    return false
  }
}

async function main() {
  console.log('='.repeat(50))
  console.log('  Pre-build Copilot - Qwen API 测试')
  console.log('='.repeat(50))
  console.log('')

  const results = {
    connection: await testBasicConnection(),
    prompt: await testCopilotPrompt(),
    choices: await testChoicesFormat(),
  }

  console.log('='.repeat(50))
  console.log('  测试结果汇总')
  console.log('='.repeat(50))
  console.log(`基础连接: ${results.connection ? '✅ 通过' : '❌ 失败'}`)
  console.log(`Prompt 测试: ${results.prompt ? '✅ 通过' : '❌ 失败'}`)
  console.log(`选择题格式: ${results.choices ? '✅ 通过' : '❌ 失败'}`)

  const allPassed = Object.values(results).every(Boolean)
  console.log('')
  console.log(allPassed ? '🎉 所有测试通过！' : '⚠️ 部分测试失败，请检查配置')

  process.exit(allPassed ? 0 : 1)
}

main()
