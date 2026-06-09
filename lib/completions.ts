import { supabase } from './supabase'

export async function getDayCompletions(date: string) {
  const { data } = await supabase.from('completions')
    .select('activity_id, completed').eq('date', date)
  return data ?? []
}

export async function toggleCompletion(activityId: string, date: string, completed: boolean) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('completions').upsert(
    { user_id: user.id, activity_id: activityId, date, completed, completed_at: completed ? new Date().toISOString() : null },
    { onConflict: 'user_id,activity_id,date' }
  )
}

export async function getDayTaskCompletions(date: string) {
  const { data } = await supabase.from('task_completions')
    .select('task_id, completed').eq('date', date)
  return data ?? []
}

export async function toggleTaskCompletion(taskId: string, date: string, completed: boolean) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('task_completions').upsert(
    { user_id: user.id, task_id: taskId, date, completed },
    { onConflict: 'user_id,task_id,date' }
  )
}
