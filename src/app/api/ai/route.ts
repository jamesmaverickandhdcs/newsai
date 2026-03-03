import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(`${GEMINI_URL}?key=${process.env.GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  })
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  console.log('Groq response:', JSON.stringify(data).slice(0, 300))
  return data.choices?.[0]?.message?.content || ''
}

async function generateWithFallback(prompt: string): Promise<string> {
  try {
    const result = await callGroq(prompt)
    console.log('Groq result length:', result.length)
    if (result) return result
  } catch (e) {
    console.error('Groq error:', e)
  }
  try {
    const result = await callGemini(prompt)
    console.log('Gemini result length:', result.length)
    if (result) return result
  } catch (e) {
    console.error('Gemini error:', e)
  }
  return ''
}

export async function POST(request: Request) {
  try {
    const { articleId } = await request.json()
    const supabase = await createClient()

    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single()

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const baseContext = `ခေါင်းစဉ်: ${article.title}\nရင်းမြစ်: ${article.source_name}\nမူရင်းအကျဉ်းချုပ်: ${article.summary_short || 'မရှိပါ'}`

    const [short, medium, detailed] = await Promise.all([
      generateWithFallback(`သတင်းကို မြန်မာဘာသာဖြင့် ၁ ကြောင်းသာ အနှစ်ချုပ်ပါ (စကားလုံး ၃၀ မကျော်ရ): ${baseContext}`),
      generateWithFallback(`သတင်းကို မြန်မာဘာသာဖြင့် ၃ ပိုဒ်ဖြင့် အဓိကအချက်များ ထည့်သွင်းကာ ရေးသားပါ: ${baseContext}`),
      generateWithFallback(`သတင်းကို မြန်မာဘာသာဖြင့် အသေးစိတ် ခွဲခြမ်းစိတ်ဖြာပြီး အကြောင်းအရာ၊ သက်ရောက်မှုများနှင့် အမြင်အမျိုးမျိုးကို ထည့်သွင်းရေးသားပါ။ အဆုံးတွင် ရင်းမြစ်မှတ်ချက် ထည့်ပါ: ${baseContext}`),
    ])

    const isBreaking = await generateWithFallback(
      `ဤသတင်းသည် ချက်ချင်းသိရှိရမည့် အရေးပေါ်သတင်းဖြစ်သလား? "true" သို့မဟုတ် "false" သာ ဖြေပါ: ${article.title}`
    )

    await supabase
      .from('articles')
      .update({
        summary_short: short,
        summary_medium: medium,
        summary_detailed: detailed,
        is_breaking: isBreaking.trim().toLowerCase() === 'true',
        ai_processed: true,
      })
      .eq('id', articleId)

    return NextResponse.json({ success: true, articleId })
  } catch (error) {
    console.error('AI processing error:', error)
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 })
  }
}