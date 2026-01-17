/**
 * Generate Report API
 * POST /api/conversation/[id]/report - Generate V2.0 evaluation report (Streaming)
 */

import { NextRequest } from 'next/server'
import { getConversation, updateConversation } from '@/lib/db/conversations'
import { searchCompetitors } from '@/lib/ai/search'
import { withRetry, parseAIError, StreamTimeoutWrapper } from '@/lib/ai/utils'
import OpenAI from 'openai'

// 配置常量
const AI_REQUEST_TIMEOUT = 60000 // 60秒总超时
const STREAM_CHUNK_TIMEOUT = 15000 // 15秒无数据则超时
const SEARCH_TIMEOUT = 5000 // 搜索超时5秒
const MAX_RETRIES = 2 // 最大重试次数

// 根据经验等级调整语气
const TONE_GUIDES = {
  'never': "语气：极度鼓励，用最简单的词。把用户当作聪明但不懂技术的朋友。",
  'tutorial': "语气：鼓励但有教育意义。解释*为什么*某些工具能省时间。",
  'small_project': "语气：平等交流，务实。强调速度，警惕过度工程化。",
  'veteran': "语气：尊重，简洁，高层次。重点是消除摩擦。"
}

// Initialize Qwen client
function getClient(): OpenAI {
  const apiKey = process.env.QWEN_API_KEY
  if (!apiKey) {
    throw new Error('QWEN_API_KEY not configured')
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.QWEN_API_BASE || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const conversation = await getConversation(id)
  if (!conversation) {
    return new Response(JSON.stringify({ error: '对话不存在' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const schema = conversation.schema_data

  // 优化: 搜索设置超时，不阻塞主流程
  let searchContext = '暂无市场数据'
  try {
    const searchPromise = searchCompetitors(schema.idea.one_liner)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Search timeout')), SEARCH_TIMEOUT)
    )
    const searchResult = await Promise.race([searchPromise, timeoutPromise])
    searchContext = JSON.stringify(searchResult)
  } catch (e) {
    console.warn('Search skipped:', e)
  }

  // Determine Tone
  const expLevel = (schema.user.experience_level || 'small_project') as keyof typeof TONE_GUIDES
  const toneInstruction = TONE_GUIDES[expLevel] || TONE_GUIDES['small_project']

  // 精简的 prompt
  const prompt = `为以下项目生成评估报告。

【项目】${schema.idea.one_liner}
【用户】${schema.user.primary_user}
【功能】${schema.mvp.first_job || '未指定'}
【经验】${schema.user.experience_level}
【问卷】${JSON.stringify(conversation.metadata?.answers || {})}
【市场】${searchContext}

${toneInstruction}

工具库（请根据用户场景推荐3个方案：纯国内、海外、Vibe Coder）：

【纯国内方案 - 适合微信生态、国内用户、需备案】
- AI编程IDE：Cursor、Trae(字节)、通义灵码、MarsCode
- 全栈生成：Lovable（需翻墙）、Bolt.new（需翻墙）
- 部署托管：腾讯云开发、微信小程序云开发、阿里云函数计算、LeanCloud、字节轻服务
- 数据库：腾讯云数据库、阿里云PolarDB、LeanCloud、字节云数据库
- 大模型API：通义千问(Qwen)、DeepSeek、智谱GLM、月之暗面Kimi、百川、字节豆包
- 语音API：阿里云语音(Qwen-ASR)、腾讯云ASR/TTS、讯飞语音
- 图像API：通义万相、百度文心一格、智谱CogView、Kolors
- 支付：微信支付、支付宝
- 小程序/App：微信小程序、uni-app、Taro
- 自动化：飞书多维表格、简道云、腾讯文档

【海外方案 - 适合全球用户、无需备案、英文产品】
- AI编程IDE：Cursor、Windsurf、GitHub Copilot、Aider
- 全栈生成：Lovable、Bolt.new、v0.dev、Replit Agent
- 部署托管：Vercel、Cloudflare Pages/Workers、Netlify、Railway、Render、Fly.io
- 数据库：Supabase、PlanetScale、Neon、Firebase、Turso
- 大模型API：OpenAI GPT-4o、Anthropic Claude、Google Gemini
- 语音API：OpenAI Whisper、ElevenLabs、Azure Speech、AssemblyAI
- 图像API：DALL-E 3、Midjourney API、Stable Diffusion、Flux
- 支付：Stripe、Paddle、LemonSqueezy
- 身份验证：Clerk、Auth0、NextAuth、Supabase Auth
- 自动化：n8n、Make、Zapier

【Vibe Coder 方案 - 适合个人工具、效率提升、快速原型】
核心理念：用 AI 编程助手 + 现代全栈工具，快速实现个人想法
- AI编程：Claude Code（终端AI编程）、Cursor（AI IDE）、GitHub Copilot
- 特色：Claude Code 支持 Skills（自定义命令）、MCP（Model Context Protocol）
- 代码托管：GitHub（免费私有仓库）
- 数据库：Supabase（免费额度大，带 Auth）
- 部署：Vercel（免费部署 Next.js）、Cloudflare Pages
- 框架：Next.js、Remix、Astro
- UI：shadcn/ui、Tailwind CSS、Radix
- 工作流：Claude Code + GitHub + Supabase + Vercel 一键部署
- 适合场景：个人效率工具、内部工具、快速验证想法、学习项目
- 成本：基本免费（在免费额度内）

货币单位：所有成本必须用人民币(¥)标注，例如"¥0"、"¥50/月"
方案命名规则：
- option_a: "纯国内方案" - 完全使用国内服务，无需翻墙
- option_b: "海外方案" - 使用国际主流服务，全球可用
- option_c: "Vibe Coder 方案" - Claude Code/Cursor + GitHub + Supabase + Vercel，适合个人开发者快速实现想法

输出JSON(2-3个产品方案,每个3-4步workflow)：
{"one_liner_conclusion":"一句话结论","score":{"feasibility":0-100,"breakdown":{"tech":0-100,"market":0-100,"onboarding":0-100,"user_match":0-100}},"why_worth_it":["理由1","理由2","理由3"],"risks":["风险1","风险2"],"market_analysis":{"opportunity":"机会","search_trends":"趋势","competitors":[{"name":"名称","url":"链接","pros":"优点","cons":"缺点"}]},"product_approaches":{"approaches":[{"id":"a","name":"方案名","description":"描述","workflow":[{"step":1,"action":"动作","detail":"详情"}],"pros":["优势"],"cons":["劣势"],"best_for":"适合场景","complexity":"low|medium|high"}],"recommended_id":"推荐id","recommendation_reason":"理由"},"tech_options":{"option_a":{"name":"纯国内方案","tools":[{"name":"工具名","purpose":"用途/要做的事"}],"fit_for":"微信生态/国内用户","capability":"能力","dev_time":"时间","cost":"成本"},"option_b":{"name":"海外方案","tools":[{"name":"工具名","purpose":"用途/要做的事"}],"fit_for":"全球用户/无需备案","capability":"能力","dev_time":"时间","cost":"成本"},"option_c":{"name":"Vibe Coder 方案","tools":[{"name":"Claude Code","purpose":"AI终端编程"},{"name":"GitHub","purpose":"代码托管"},{"name":"Supabase","purpose":"数据库+认证"},{"name":"Vercel","purpose":"一键部署"}],"fit_for":"个人工具/快速原型","capability":"能力","dev_time":"时间","cost":"成本"},"advice":"建议"},"fastest_path":[{"title":"标题","description":"描述","copy_text":"提示词","action_label":"按钮文字","action_url":"链接"}],"cost_estimate":{"time_breakdown":"时间","money_breakdown":"金钱"},"pitfalls":["避坑1","避坑2"],"learning_takeaways":["收获1","收获2"],"next_steps":{"today":["今天"],"this_week":["本周"],"later":["以后"]}}`

  const client = getClient()

  // 创建流式响应
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let retryCount = 0
      let lastError: Error | null = null

      // 重试循环
      while (retryCount <= MAX_RETRIES) {
        try {
          // 发送开始信号
          controller.enqueue(encoder.encode(`data: {"type":"start","retry":${retryCount}}\n\n`))

          // 创建带超时的 AbortController
          const abortController = new AbortController()
          const timeoutId = setTimeout(() => {
            abortController.abort()
          }, AI_REQUEST_TIMEOUT)

          let response
          try {
            response = await client.chat.completions.create({
              model: process.env.QWEN_MODEL || 'qwen-plus',
              messages: [
                {
                  role: 'system',
                  content: '你是务实的独立开发顾问。只输出有效JSON，中文内容。',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.7,
              response_format: { type: 'json_object' },
              stream: true,
            }, {
              signal: abortController.signal
            })
          } catch (initError) {
            clearTimeout(timeoutId)
            throw initError
          }

          let fullContent = ''
          let chunkCount = 0
          let chunkTimeoutId: NodeJS.Timeout | null = null
          let streamAborted = false

          // 设置流超时检测函数
          const resetChunkTimeout = () => {
            if (chunkTimeoutId) clearTimeout(chunkTimeoutId)
            chunkTimeoutId = setTimeout(() => {
              console.warn('Stream chunk timeout - no data received for', STREAM_CHUNK_TIMEOUT, 'ms')
              streamAborted = true
              abortController.abort()
            }, STREAM_CHUNK_TIMEOUT)
          }

          try {
            resetChunkTimeout() // 开始计时

            for await (const chunk of response) {
              if (streamAborted) break

              resetChunkTimeout() // 每次收到数据重置计时

              const content = chunk.choices[0]?.delta?.content || ''
              if (content) {
                fullContent += content
                chunkCount++

                // 每5个chunk发送一次进度更新
                if (chunkCount % 5 === 0) {
                  const progressData = {
                    type: 'progress',
                    length: fullContent.length,
                    preview: fullContent.slice(0, 100),
                  }
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`))
                }
              }
            }

            // 清理超时
            if (chunkTimeoutId) clearTimeout(chunkTimeoutId)
            clearTimeout(timeoutId)

            if (streamAborted) {
              throw new Error('Stream timeout - 流式响应超时')
            }

            // 检查是否有内容
            if (!fullContent || fullContent.length < 100) {
              throw new Error('Empty response - AI返回内容为空')
            }

            // 解析完整JSON
            let report
            try {
              report = JSON.parse(fullContent)
            } catch (parseError) {
              console.error('JSON parse error:', parseError, 'Content:', fullContent.slice(0, 500))
              throw new Error('JSON解析失败 - AI返回格式错误')
            }

            // 保存到数据库
            try {
              await updateConversation(id, {
                metadata: {
                  ...conversation.metadata,
                  v2_report: report
                }
              })
            } catch (dbError) {
              console.error('Database save error:', dbError)
              // 继续，不影响返回报告
            }

            // 发送完整报告
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete', report })}\n\n`))
            controller.close()
            return // 成功，退出重试循环

          } catch (streamError) {
            if (chunkTimeoutId) clearTimeout(chunkTimeoutId)
            clearTimeout(timeoutId)
            throw streamError
          }

        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))
          console.error(`Report generation attempt ${retryCount + 1}/${MAX_RETRIES + 1} failed:`, lastError.message)

          retryCount++

          // 如果还有重试机会，等待后重试
          if (retryCount <= MAX_RETRIES) {
            const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000) // 1s, 2s, 4s...
            console.log(`Retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
        }
      }

      // 所有重试都失败了
      const errorMessage = parseAIError(lastError)
      console.error('All retries failed:', errorMessage)
      controller.enqueue(encoder.encode(`data: {"type":"error","message":"${errorMessage}"}\n\n`))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
