'use client'

import Link from 'next/link'

interface Article {
  id: string
  title: string
  ai_summary_mm: string | null
  summary_short: string | null
  original_url: string
  source_name: string
  category: string
  published_at: string | null
  created_at: string
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return `${diff} စက္ကန့်`
  if (diff < 3600) return `${Math.floor(diff / 60)} မိနစ်`
  if (diff < 86400) return `${Math.floor(diff / 3600)} နာရီ`
  return `${Math.floor(diff / 86400)} ရက်`
}

export default function ArticleCard({ article }: { article: Article }) {
  const summary = article.ai_summary_mm ?? article.summary_short ?? ''
  const time = article.published_at ?? article.created_at

  return (
    <Link
      href={article.original_url}
      target="_blank"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <article style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
      >
        {/* Category badge */}
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
        }}>
          {article.category}
        </span>

        {/* Title */}
        <h2 style={{
          fontSize: '1rem',
          fontWeight: 700,
          lineHeight: 1.4,
          color: 'var(--text)',
          margin: 0,
        }}>
          {article.title}
        </h2>

        {/* Myanmar summary */}
        {summary && (
          <p style={{
            fontSize: '0.875rem',
            lineHeight: 1.7,
            color: 'var(--text-muted)',
            margin: 0,
            flex: 1,
          }}>
            {summary}
          </p>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border)',
          paddingTop: '0.75rem',
          marginTop: 'auto',
        }}>
          <span style={{ fontWeight: 600 }}>{article.source_name}</span>
          <span>{timeAgo(time)} မတိုင်ခင်က</span>
        </div>
      </article>
    </Link>
  )
}
