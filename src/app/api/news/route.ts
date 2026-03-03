import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const NEWS_API_KEY = process.env.NEWS_API_KEY!
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines'

export async function POST() {
  try {
    const supabase = await createClient()

    // Fetch from NewsAPI
    const res = await fetch(
      `${NEWS_API_URL}?category=technology&language=en&pageSize=20&apiKey=${NEWS_API_KEY}`
    )
    const data = await res.json()

    if (data.status !== 'ok') {
      return NextResponse.json({ error: 'NewsAPI fetch failed', detail: data }, { status: 500 })
    }

    const articles = data.articles ?? []
    let saved = 0
    let skipped = 0

    for (const article of articles) {
      // Skip articles without title or url
      if (!article.title || !article.url) {
        skipped++
        continue
      }

      // Upsert to avoid duplicates
      const { error } = await supabase
        .from('articles')
        .upsert(
          {
            title: article.title,
            original_url: article.url,
            source_name: article.source?.name ?? 'Unknown',
            summary_short: article.description ?? '',
            published_at: article.publishedAt ?? new Date().toISOString(),
            category: 'technology',
            ai_processed: false,
          },
          { onConflict: 'original_url' }
        )

      if (error) {
        console.error('Supabase upsert error:', error.message)
        skipped++
      } else {
        saved++
      }
    }

    return NextResponse.json({
      success: true,
      total: articles.length,
      saved,
      skipped,
    })
  } catch (error) {
    console.error('News fetch error:', error)
    return NextResponse.json({ error: 'News fetch failed' }, { status: 500 })
  }
}

// GET method for easy browser testing
export async function GET() {
  return POST()
}
