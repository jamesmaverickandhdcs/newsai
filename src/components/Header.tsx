'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [email, setEmail] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

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
          }}>NewsAI</span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>Myanmar</span>
        </Link>

        {email ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '999px',
                border: '1px solid var(--border)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text)',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login" style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '999px',
            border: '1px solid var(--border)',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text)',
            textDecoration: 'none',
          }}>
            Login
          </Link>
        )}
      </div>
    </header>
  )
}