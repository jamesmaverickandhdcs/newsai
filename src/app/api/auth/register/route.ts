import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { email, password } = await req.json()

  const { data, error } = await supabaseAdmin.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.log('SignUp error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (!data.user) {
    return NextResponse.json({ error: 'User creation failed' }, { status: 400 })
  }

  await supabaseAdmin.from('profiles').insert({
    id: data.user.id,
    email: data.user.email,
    full_name: '',
    avatar_url: '',
  })

  await supabaseAdmin.from('user_preferences').insert({
    id: data.user.id
  })

  return NextResponse.json({ success: true })
}