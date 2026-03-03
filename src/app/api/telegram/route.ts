import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

// Send message helper
async function sendMessage(chat_id: number | string, text: string, parse_mode = 'HTML') {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, parse_mode }),
  })
}

// Webhook handler — Telegram sends updates here
export async function POST(req: NextRequest) {
  const body = await req.json()
  const message = body?.message
  if (!message) return NextResponse.json({ ok: true })

  const chat_id = message.chat.id
  const text = message.text?.trim() ?? ''
  const supabase = await createClient()

  // /start command
  if (text === '/start') {
    await sendMessage(
      chat_id,
      `👋 <b>NewsAI Myanmar မှ ကြိုဆိုပါတယ်!</b>\n\n` +
      `နောက်ဆုံးရ သတင်းများကို Myanmar ဘာသာဖြင့် ဖတ်ရှုနိုင်ပါသည်။\n\n` +
      `📌 Commands:\n` +
      `/subscribe — သတင်းများ subscribe လုပ်ရန်\n` +
      `/unsubscribe — unsubscribe လုပ်ရန်\n` +
      `/news — နောက်ဆုံးရ သတင်း ၅ ခု ကြည့်ရန်`
    )
    return NextResponse.json({ ok: true })
  }

  // /subscribe command
  if (text === '/subscribe') {
    const { error } = await supabase
      .from('telegram_subscribers')
      .upsert({ chat_id: String(chat_id), subscribed: true }, { onConflict: 'chat_id' })

    if (error) {
      await sendMessage(chat_id, '❌ Subscribe မအောင်မြင်ပါ။ နောက်မှ ထပ်ကြိုးစားပါ။')
    } else {
      await sendMessage(chat_id, '✅ <b>Subscribe အောင်မြင်ပါတယ်!</b>\nသတင်းအသစ်များ ရရှိပါမည်။')
    }
    return NextResponse.json({ ok: true })
  }

  // /unsubscribe command
  if (text === '/unsubscribe') {
    await supabase
      .from('telegram_subscribers')
      .update({ subscribed: false })
      .eq('chat_id', String(chat_id))

    await sendMessage(chat_id, '👋 Unsubscribe လုပ်ပြီးပါပြီ။ ပြန်လာလိုရင် /subscribe ရိုက်ပါ။')
    return NextResponse.json({ ok: true })
  }

  // /news command — fetch latest 5 articles
  if (text === '/news') {
    const { data: articles } = await supabase
      .from('articles')
      .select('title, summary_short, original_url')
      .order('created_at', { ascending: false })
      .limit(5)

    if (!articles || articles.length === 0) {
      await sendMessage(chat_id, '📭 သတင်းများ မရှိသေးပါ။')
      return NextResponse.json({ ok: true })
    }

    for (const article of articles) {
      const summary = article.summary_short || 'Summary မရှိသေးပါ။'
      const msg = '📰 <b>' + article.title + '</b>\n\n' + summary + '\n\n🔗 <a href="' + article.original_url + '">ဆက်ဖတ်ရန်</a>'
      await sendMessage(chat_id, msg)
    }

    return NextResponse.json({ ok: true })
  }

  // Default fallback
  await sendMessage(chat_id, '❓ Command မသိပါ။ /start ရိုက်ပြီး commands ကြည့်ပါ။')
  return NextResponse.json({ ok: true })
}
