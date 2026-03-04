'use client'

import { useRouter } from 'next/navigation'

export default function CategoryFilter({
  categories,
  activeCategory,
}: {
  categories: string[]
  activeCategory: string
}) {
  const router = useRouter()

  const handleClick = (cat: string) => {
    if (cat === 'all') {
      router.push('/')
    } else {
      router.push(`/?category=${cat}`)
    }
  }

  return (
    <div className="flex gap-2 flex-wrap mb-8">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => handleClick(cat)}
          style={{
            padding: '0.4rem 1rem',
            borderRadius: '999px',
            border: '1px solid var(--border)',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: activeCategory === cat ? 'var(--accent)' : 'transparent',
            color: activeCategory === cat ? 'white' : 'var(--text)',
            borderColor: activeCategory === cat ? 'var(--accent)' : 'var(--border)',
            textTransform: 'capitalize',
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
