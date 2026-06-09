import { supabase } from './supabase'

export async function registerPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return false
  const reg = await navigator.serviceWorker.register('/sw.js')
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  await supabase.from('push_subscriptions').upsert(
    { user_id: user.id, subscription: sub.toJSON(), active: true },
    { onConflict: 'user_id' }
  )
  return true
}

export async function isPushEnabled(): Promise<boolean> {
  if (!('Notification' in window)) return false
  return Notification.permission === 'granted'
}
