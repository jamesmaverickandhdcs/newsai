import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import BreakingNewsBanner from '@/components/BreakingNewsBanner'
import CategoryFilter from '@/components/CategoryFilter'
import ArticleGrid from '@/components/ArticleGrid'

export const revalidate = 60 // revalidate every 60 seconds

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const supabase = await createClient()

  // Fetch breaking news
  const { data: breakingNews } = await supabase
    .from('articles')
    .select('id, title, ai_summary_mm, original_url, source_name')
    .eq('is_breaking', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch articles with optional category filter
  let query = supabase
    .from('articles')
    .select('id, title, ai_summary_mm, summary_short, original_url, source_name, category, published_at, created_at')
    .not('summary_short', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20)

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data: articles } = await query

  // Fetch unique categories
  const { data: categoryData } = await supabase
    .from('articles')
    .select('category')
    .not('category', 'is', null)

  const categories = ['all', ...new Set(categoryData?.map(a => a.category) ?? [])]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Header />
      {breakingNews && <BreakingNewsBanner article={breakingNews} />}
      <main className="max-w-full px-8 py-8">
        <CategoryFilter categories={categories} activeCategory={category ?? 'all'} />
        <ArticleGrid articles={articles ?? []} />
      </main>
      <footer className="text-center py-8 text-sm opacity-50">
        © 2026 NewsAI Myanmar — သတင်းများကို မြန်မာဘာသာဖြင့်
      </footer>
    </div>
  )
}
