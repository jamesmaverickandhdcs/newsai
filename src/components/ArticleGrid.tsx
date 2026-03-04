import ArticleCard from './ArticleCard'

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

export default function ArticleGrid({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '4rem 0',
        color: 'var(--text-muted)',
      }}>
        <p style={{ fontSize: '1.25rem' }}>📭 သတင်းများ မရှိသေးပါ</p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.25rem',
    }}>
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
