/**
 * Generate Report API
 * POST /api/conversation/[id]/report - Generate V2.0 evaluation report
 */

import { NextRequest, NextResponse } from 'next/server'
import { getConversation, updateConversation } from '@/lib/db/conversations'
import { searchCompetitors } from '@/lib/ai/search'
import OpenAI from 'openai'
import type { VibeReport } from '@/lib/types'

// Vibe Coding Tool Library - The "Stack" for V2.0
const VIBE_TOOL_LIBRARY = `
RECOMMENDED TOOL LIBRARY (Prioritize these):
1. **Generators (The "Magic" Layer)**:
   - **v0.dev**: BEST for Frontend UI, React components, dashboards. (Free tier good).
   - **Lovable.dev / Bolt.new**: BEST for Full-stack apps/prototypes if user is less technical.
   - **Replit Agent**: Good for Python/Backend heavy scripts.

2. **Smart IDEs**:
   - **Cursor**: The Gold Standard. Mandatory recommendation for all Vibe Coders.
   - **Windsurf**: Alternative if they know it.

3. **Backend/Database**:
   - **Supabase**: The default choice. Auth + DB + Realtime.
   - **Convex**: Good for real-time but slight learning curve.
   - **Firebase**: Legacy but acceptable.

4. **Payments/Ops**:
   - **Lemonsqueezy / Stripe**: Payments.
   - **Clerk**: Auth (if not using Supabase Auth).
   - **Vercel**: Hosting (Default).
`

// Tone Guides based on Experience
const TONE_GUIDES = {
  'never': "Tone: Ultra-encouraging, very simple terms. No jargon. Treat them like a smart non-technical friend. Focus on 'Magic' tools like v0/Lovable.",
  'tutorial': "Tone: Encouraging but educational. Explain *why* certain tools save time. Focus on learning through doing.",
  'junior': "Tone: Peer-to-peer, pragmatic. Focus on speed and avoiding 'tutorial hell'. Warn about over-engineering.",
  'senior': "Tone: Respectful, terse, high-level. Focus on removing friction and leveraging existing skills with new AI tools. 'Don't waste time building auth from scratch'."
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
  try {
    const { id } = await params

    const conversation = await getConversation(id)
    if (!conversation) {
      return NextResponse.json(
        { error: '对话不存在' },
        { status: 404 }
      )
    }

    const schema = conversation.schema_data
    
    // Per V2 spec: Perform search first
    // Simulate finding competitors based on user idea
    let searchContext = ''
    try {
       const searchResult = await searchCompetitors(schema.idea.one_liner)
       searchContext = JSON.stringify(searchResult)
    } catch (e) {
       console.warn('Search failed, proceeding without external info', e)
       searchContext = 'Search unavailable.'
    }

    // Determine Tone
    const expLevel = (schemaStyles => {
        // approximate mapping if exact enum match isn't perfect, or default to junior
        return schema.user.experience_level || 'junior'
    })() as keyof typeof TONE_GUIDES
    
    const toneInstruction = TONE_GUIDES[expLevel] || TONE_GUIDES['junior']

    // Generate report using Qwen
    const client = getClient()
    const prompt = `You are a Vibe Coding Advisor. Generate a structured Vibe Check Report (V2.0) for the user's project.

USER PROJECT:
- Idea: ${schema.idea.one_liner}
- Target: ${schema.user.primary_user}
- MVP Type: ${schema.mvp.type}
- Experience Level: ${schema.user.experience_level}
- User's Answers: ${JSON.stringify(conversation.metadata?.answers || {})}

${VIBE_TOOL_LIBRARY}

${toneInstruction}

MARKET CONTEXT (Simulated Search Results):
${searchContext}

REQUIREMENTS:
1. **Tone**: See above. "Vibe Coder" style (pragmatic, speed-focused).
2. **Structure**: Strictly follow the JSON schema below.
3. **Content**:
   - **Tech Stack**: MUST pick from the VIBE TOOL LIBRARY. Do not recommend "plain HTML" or "Java Spring" unless absolutely necessary.
   - **Analysis**: Be honest relative to their experience level.

JSON OUTPUT FORMAT:
{
  "one_liner_conclusion": "One sentence summary (e.g. 'Great starter project, but watch out for API costs.')",
  "score": {
    "feasibility": 85,
    "breakdown": { "tech": 90, "market": 70, "onboarding": 80, "user_match": 85 }
  },
  "why_worth_it": ["Reason 1", "Reason 2", "Reason 3"],
  "risks": ["Risk 1", "Risk 2"],
  "market_analysis": {
    "opportunity": "Market verdict...",
    "search_trends": "Trend analysis...",
    "competitors": [
      { "name": "Comp A", "url": "...", "pros": "Good X", "cons": "Bad Y" }
    ]
  },
  "tech_options": {
    "option_a": {
      "name": "The 'Vibe' Path (Fastest)",
      "tools": ["v0", "Next.js", "Vercel"],
      "fit_for": "Quick MVP",
      "capability": "Basic",
      "dev_time": "3 days",
      "cost": "Free tier"
    },
    "option_b": {
      "name": "The 'Pro' Path (Scalable)",
      "tools": ["React Native", "Supabase"],
      "fit_for": "Long term",
      "capability": "High",
      "dev_time": "3 weeks",
      "cost": "$20/mo"
    },
    "advice": "Which one to pick and why."
  },
  "fastest_path": [
    {
      "title": "Step 1: xxxx",
      "description": "Details...",
      "copy_text": "Prompt to copy...",
      "action_label": "Go to v0",
      "action_url": "https://v0.dev"
    }
  ],
  "cost_estimate": {
    "time_breakdown": "MVP: 1 week...",
    "money_breakdown": "API: $5/mo...",
    "saving_tips": ["Use free tier...", "Local LLM..."]
  },
  "pitfalls": ["Pitfall 1", "Pitfall 2"],
  "learning_takeaways": ["Skill A", "Concept B"],
  "next_steps": {
    "today": ["Action 1", "Action 2"],
    "this_week": ["Action 3", "Action 4"],
    "later": ["Action 5"]
  }
}
`

    const response = await client.chat.completions.create({
      model: process.env.QWEN_MODEL || 'qwen-plus',
      messages: [
        {
          role: 'system',
          content: 'You are a pragmatic, experienced indie hacker advisor. Output valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content || '{}'
    let report: VibeReport

    try {
      report = JSON.parse(content)
      
      await updateConversation(id, {
        metadata: {
            ...conversation.metadata,
            v2_report: report
        }
      })

    } catch (parseError) {
      console.error('JSON parse error', parseError)
      throw new Error('Failed to parse AI report')
    }

    return NextResponse.json({
      report,
    })
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json(
      { error: '生成报告失败' },
      { status: 500 }
    )
  }
}

