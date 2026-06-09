import { supabase } from './supabase'
import { Activity, DayKey } from '@/types'

export async function getActivities(dayKey: DayKey): Promise<Activity[]> {
  const { data } = await supabase
    .from('activities')
    .select('*, activity_tasks(*)')
    .eq('day_key', dayKey)
    .eq('active', true)
    .order('time')
  return (data ?? []) as Activity[]
}

export async function createActivity(fields: Partial<Activity> & { tasks?: string[] }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'not logged in' }
  const { tasks, activity_tasks, ...rest } = fields as any
  const { data, error } = await supabase.from('activities')
    .insert({ ...rest, user_id: user.id }).select().single()
  if (error || !data) return { error }
  if (tasks?.length) {
    await supabase.from('activity_tasks').insert(
      tasks.map((text: string, i: number) => ({ activity_id: data.id, text, sort_order: i }))
    )
  }
  return { data }
}

export async function updateActivity(id: string, fields: Partial<Activity> & { tasks?: string[] }) {
  const { tasks, activity_tasks, ...rest } = fields as any
  await supabase.from('activities').update(rest).eq('id', id)
  if (tasks !== undefined) {
    await supabase.from('activity_tasks').delete().eq('activity_id', id)
    if (tasks.length > 0) {
      await supabase.from('activity_tasks').insert(
        tasks.map((text: string, i: number) => ({ activity_id: id, text, sort_order: i }))
      )
    }
  }
  return { data: true }
}

export async function deleteActivity(id: string) {
  return supabase.from('activities').update({ active: false }).eq('id', id)
}
