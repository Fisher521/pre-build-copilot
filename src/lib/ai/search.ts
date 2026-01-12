/**
 * Search Service
 * Simulates web search for market analysis using Qwen LLM
 */

import { getClient } from './qwen'

const MODEL = process.env.QWEN_MODEL || 'qwen-plus'

export interface SearchResult {
  title: string
  url: string
  snippet: string
  source: string
}

export interface SearchResponse {
  results: SearchResult[]
  notes: string
}

/**
 * Simulate a search for competitors
 */
export async function searchCompetitors(query: string): Promise<SearchResponse> {
  // In a real app, this would call Tavily/Serper/Bing API
  // Here we ask Qwen to hallucinate a "Search Result" structure based on its knowledge
  // which is actually better for "Vibe Checking" than raw search sometimes.
  
  const prompt = `Simulate a Google Search result for: "${query}"
Focus on finding 3 real-world similar products/competitors.
Return JSON format:
{
  "results": [
    { "title": "Product Name - One liner", "url": "https://...", "snippet": "Key features and user reviews...", "source": "Product Hunt" }
  ],
  "notes": "Brief summary of market saturation"
}`

  try {
     const client = getClient()

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content || '{}'
    return JSON.parse(content) as SearchResponse
  } catch (e) {
    console.error('Search simulation failed', e)
    return {
      results: [
        { title: 'Similar App A', url: '#', snippet: 'A popular alternative', source: 'Example' }
      ],
      notes: 'Could not perform advanced search.'
    }
  }
}

/**
 * Get simulate search trends
 */
export async function getSearchTrends(keyword: string): Promise<string> {
  // Simulate a trend description
  return `Search volume for "${keyword}" has been stable/growing over the last 12 months.`
}
