import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

async function sendMessage(chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  })
}

export async function POST(req: Request) {
  const { articleIds } = await req.json()

  if (!articleIds?.length) {
    return NextResponse.json({ error: 'No article IDs' }, { status: 400 })
  }

  // Get subscribers
  const { data: subscribers } = await supabaseAdmin
    .from('telegram_subscribers')
    .select('chat_id')
    .eq('subscribed', true)

  if (!subscribers?.length) {
    return NextResponse.json({ success: true, sent: 0 })
  }

  // Get articles
  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('id, title, ai_summary_mm, original_url, source_name')
    .in('id', articleIds)
    .not('ai_summary_mm', 'is', null)

  if (!articles?.length) {
    return NextResponse.json({ success: true, sent: 0 })
  }

  // Build message
  let msg = '📰 <b>သတင်းအသစ်များ</b>\n\n'
  for (const a of articles.slice(0, 5)) {
    msg += `• <b>${a.ai_summary_mm}</b>\n`
    msg += `  <a href="${a.original_url}">${a.source_name}</a>\n\n`
  }

  // Send to all subscribers
  let sent = 0
  for (const sub of subscribers) {
    await sendMessage(sub.chat_id, msg)
    sent++
  }

  return NextResponse.json({ success: true, sent })
}
