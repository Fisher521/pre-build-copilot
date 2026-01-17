/**
 * Generate Report API
 * POST /api/conversation/[id]/report - Generate V2.0 evaluation report (Streaming)
 */

import { NextRequest } from 'next/server'
import { getConversation, updateConversation } from '@/lib/db/conversations'
import { searchCompetitors } from '@/lib/ai/search'
import OpenAI from 'openai'

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
      setTimeout(() => reject(new Error('Search timeout')), 3000)
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

工具库（优先推荐国内可直接访问的）：
- AI编程：Cursor、Windsurf、通义灵码
- 前端生成：v0.dev、Lovable、Bolt.new
- 全栈：Lovable、Bolt.new
- 后端/数据库：Supabase、腾讯云开发、阿里云Serverless、LeanCloud
- 部署：Vercel、腾讯云、阿里云、Railway
- AI接口：通义千问API、DeepSeek API、月之暗面Kimi API、智谱GLM
- 支付：微信支付、支付宝
- 小程序：微信小程序云开发、uni-app

货币单位：所有成本必须用人民币(¥)标注，例如"¥0"、"¥50/月"

输出JSON(2-3个产品方案,每个3-4步workflow)：
{"one_liner_conclusion":"一句话结论","score":{"feasibility":0-100,"breakdown":{"tech":0-100,"market":0-100,"onboarding":0-100,"user_match":0-100}},"why_worth_it":["理由1","理由2","理由3"],"risks":["风险1","风险2"],"market_analysis":{"opportunity":"机会","search_trends":"趋势","competitors":[{"name":"名称","url":"链接","pros":"优点","cons":"缺点"}]},"product_approaches":{"approaches":[{"id":"a","name":"方案名","description":"描述","workflow":[{"step":1,"action":"动作","detail":"详情"}],"pros":["优势"],"cons":["劣势"],"best_for":"适合场景","complexity":"low|medium|high"}],"recommended_id":"推荐id","recommendation_reason":"理由"},"tech_options":{"option_a":{"name":"极简方案","tools":["工具"],"fit_for":"场景","capability":"能力","dev_time":"时间","cost":"成本"},"option_b":{"name":"进阶方案","tools":["工具"],"fit_for":"场景","capability":"能力","dev_time":"时间","cost":"成本"},"advice":"建议"},"fastest_path":[{"title":"标题","description":"描述","copy_text":"提示词","action_label":"按钮文字","action_url":"链接"}],"cost_estimate":{"time_breakdown":"时间","money_breakdown":"金钱"},"pitfalls":["避坑1","避坑2"],"learning_takeaways":["收获1","收获2"],"next_steps":{"today":["今天"],"this_week":["本周"],"later":["以后"]}}`

  const client = getClient()

  // 创建流式响应
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 发送开始信号
        controller.enqueue(encoder.encode(`data: {"type":"start"}\n\n`))

        const response = await client.chat.completions.create({
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
        })

        let fullContent = ''
        let chunkCount = 0

        for await (const chunk of response) {
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

        // 解析完整JSON
        let report
        try {
          report = JSON.parse(fullContent)
        } catch (parseError) {
          console.error('JSON parse error:', parseError, 'Content:', fullContent.slice(0, 500))
          controller.enqueue(encoder.encode(`data: {"type":"error","message":"解析失败"}\n\n`))
          controller.close()
          return
        }

        // 保存到数据库
        await updateConversation(id, {
          metadata: {
            ...conversation.metadata,
            v2_report: report
          }
        })

        // 发送完整报告
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete', report })}\n\n`))
        controller.close()

      } catch (error) {
        console.error('Stream error:', error)
        controller.enqueue(encoder.encode(`data: {"type":"error","message":"生成失败"}\n\n`))
        controller.close()
      }
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
