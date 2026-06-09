import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function GET() {
  const now = new Date()
  const hh  = String(now.getUTCHours()).padStart(2,'0')
  const mm  = String(now.getUTCMinutes()).padStart(2,'0')
  const time = `${hh}:${mm}`
  const days: string[] = ['dom','seg','ter','qua','qui','sex','sab']
  const dayKey = days[now.getUTCDay()]

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Busca atividades com notificação ativa no horário de agora
  const { data: settings } = await supabase
    .from('notification_settings')
    .select('user_id, minutes_before, activities(time, name, day_key)')
    .eq('enabled', true)

  if (!settings) return NextResponse.json({ ok: true, time })

  for (const s of settings) {
    const act = (s as any).activities
    if (!act || act.day_key !== dayKey) continue

    const [ah, am] = act.time.split(':').map(Number)
    const notifyMin = ah * 60 + am - (s.minutes_before ?? 5)
    const nowMin = parseInt(hh) * 60 + parseInt(mm)
    if (notifyMin !== nowMin) continue

    // Busca subscriptions do usuário
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', s.user_id)
      .eq('active', true)

    const msg = s.minutes_before === 0
      ? `🔔 Hora: ${act.name}`
      : `⏰ Em ${s.minutes_before} min: ${act.name}`

    await Promise.allSettled(
      (subs ?? []).map(({ subscription }) =>
        webpush.sendNotification(subscription as any, JSON.stringify({ title: 'Rotina', body: msg }))
      )
    )
  }

  return NextResponse.json({ ok: true, checked: time })
}
