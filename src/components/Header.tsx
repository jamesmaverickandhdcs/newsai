'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(12px)',
    }}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--accent)',
          }}>
            NewsAI
          </span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Myanmar
          </span>
        </Link>
        <Link href="/login" style={{
          padding: '0.5rem 1.25rem',
          borderRadius: '999px',
          border: '1px solid var(--border)',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text)',
          textDecoration: 'none',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          (e.target as HTMLElement).style.background = 'var(--accent)'
          ;(e.target as HTMLElement).style.color = 'white'
          ;(e.target as HTMLElement).style.borderColor = 'var(--accent)'
        }}
        onMouseLeave={e => {
          (e.target as HTMLElement).style.background = 'transparent'
          ;(e.target as HTMLElement).style.color = 'var(--text)'
          ;(e.target as HTMLElement).style.borderColor = 'var(--border)'
        }}
        >
          Login
        </Link>
      </div>
    </header>
  )
}
