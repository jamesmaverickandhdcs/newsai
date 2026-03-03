import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SOURCE_TIERS: Record<string, number> = {
  'reuters.com': 1, 'bbc.com': 1, 'apnews.com': 1, 'bloomberg.com': 1,
  'cnn.com': 2, 'theguardian.com': 2, 'nytimes.com': 2, 'aljazeera.com': 2,
}

function getSourceTier(url: string): number {
  for (const [domain, tier] of Object.entries(SOURCE_TIERS)) {
    if (url.includes(domain)) return tier
  }
  return 3
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'technology'
  try {
    const supabase = await createClient()
    const res = await fetch(
      'https://newsapi.org/v2/top-headlines?category=' + category + '&language=en&pageSize=20&apiKey=' + process.env.NEWS_API_KEY
    )
    const data = await res.json()
    const articles = data.articles || []
    const saved = []
    for (const article of articles) {
      if (!article.url || !article.title) continue
      const { data: row, error } = await supabase
        .from('articles')
        .upsert({
          title: article.title,
          original_url: article.url,
          source_name: article.source?.name || 'Unknown',
          source_tier: getSourceTier(article.url),
          category,
          published_at: article.publishedAt,
          summary_short: article.description,
        }, { onConflict: 'original_url', ignoreDuplicates: true })
        .select()
      if (!error) saved.push(row)
    }
    return NextResponse.json({ success: true, fetched: articles.length, saved: saved.length })
  } catch (error) {
    console.error('News fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
