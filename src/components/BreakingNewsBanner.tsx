'use client'

import Link from 'next/link'

interface Article {
  id: string
  title: string
  ai_summary_mm: string | null
  original_url: string
  source_name: string
}

export default function BreakingNewsBanner({ article }: { article: Article }) {
  return (
    <div style={{
      background: 'var(--accent)',
      color: 'white',
      padding: '0.75rem 1rem',
    }}>
      <div className="max-w-6xl mx-auto flex items-center gap-3">
        <span style={{
          background: 'white',
          color: 'var(--accent)',
          fontSize: '0.65rem',
          fontWeight: 800,
          letterSpacing: '0.12em',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}>
          Breaking
        </span>
        <Link
          href={article.original_url}
          target="_blank"
          style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {article.ai_summary_mm ?? article.title}
        </Link>
      </div>
    </div>
  )
}
