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
    const newArticleIds: string[] = []

    for (const article of articles) {
      if (!article.title || !article.url) { skipped++; continue }

      const { data: upserted, error } = await supabase
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
        .select('id, ai_processed')
        .single()

      if (error) {
        skipped++
      } else {
        saved++
        // Only process new articles
        if (!upserted.ai_processed) {
          newArticleIds.push(upserted.id)
        }
      }
    }

    // Auto-publish: AI process + Telegram send
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    for (const id of newArticleIds) {
      await fetch(`${baseUrl}/api/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: id }),
      })
    }

    // Send to Telegram subscribers
    if (newArticleIds.length > 0) {
      await fetch(`${baseUrl}/api/telegram/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleIds: newArticleIds }),
      })
    }

    return NextResponse.json({ success: true, total: articles.length, saved, skipped, autoPublished: newArticleIds.length })
  } catch (error) {
    console.error('News fetch error:', error)
    return NextResponse.json({ error: 'News fetch failed' }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}