import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'



function buildEmailHTML(articles: any[]) {
  const articleRows = articles.map(a => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
        <p style="margin:0 0 4px 0; font-size:11px; font-weight:600; color:#dc2626; letter-spacing:0.08em; text-transform:uppercase;">${a.category ?? 'Technology'}</p>
        <a href="${a.original_url}" style="font-size:16px; font-weight:700; color:#1a1a1a; text-decoration:none; line-height:1.4;">${a.title}</a>
        ${a.ai_summary_mm ? `<p style="margin:8px 0 0 0; font-size:14px; color:#6b7280; line-height:1.7;">${a.ai_summary_mm}</p>` : ''}
        <p style="margin:8px 0 0 0; font-size:12px; color:#9ca3af;">${a.source_name}</p>
      </td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0; padding:0; background:#fafaf9; font-family: 'Segoe UI', system-ui, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; border: 1px solid #e5e7eb;">
          <!-- Header -->
          <tr>
            <td style="background:#dc2626; padding: 24px 32px;">
              <h1 style="margin:0; color:white; font-size:24px; font-weight:800; letter-spacing:-0.03em;">
                NewsAI <span style="font-size:12px; font-weight:500; letter-spacing:0.1em; opacity:0.8;">MYANMAR</span>
              </h1>
              <p style="margin:4px 0 0 0; color:rgba(255,255,255,0.8); font-size:13px;">နေ့စဉ် နည်းပညာသတင်းများ မြန်မာဘာသာဖြင့်</p>
            </td>
          </tr>
          <!-- Articles -->
          <tr>
            <td style="padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${articleRows}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background:#f9fafb; border-top: 1px solid #e5e7eb; text-align:center;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                © 2026 NewsAI Myanmar · 
                <a href="#" style="color:#dc2626; text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export async function POST() {
  const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
  // Step 1: Get subscribers
  const { data: subscribers, error: subError } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .eq('email_newsletter', true)

  if (subError || !subscribers?.length) {
    return NextResponse.json({ error: 'No subscribers found' }, { status: 400 })
  }

  // Step 2: Get latest articles
  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('id, title, ai_summary_mm, original_url, source_name, category')
    .not('ai_summary_mm', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!articles?.length) {
    return NextResponse.json({ error: 'No articles found' }, { status: 400 })
  }

  const html = buildEmailHTML(articles)
  const articleIds = articles.map(a => a.id)
  const results = []

  // Step 3: Send to each subscriber
  for (const subscriber of subscribers) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'NewsAI Myanmar <onboarding@resend.dev>',
        to: subscriber.email,
        subject: '📰 နေ့စဉ် နည်းပညာသတင်းများ — NewsAI Myanmar',
        html,
      }),
    })

    const data = await res.json()

    // Step 4: Log to newsletter_logs
    await supabaseAdmin.from('newsletter_logs').insert({
      user_id: subscriber.id,
      article_ids: articleIds,
      status: res.ok ? 'sent' : 'failed',
    })

    results.push({ email: subscriber.email, success: res.ok })
  }

  return NextResponse.json({ success: true, results })
}
