'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getActivities } from '@/lib/activities'
import { Activity, DayKey } from '@/types'
import Routine from '@/components/Routine'
import ActivityEditor from '@/components/ActivityEditor'

const DAY_KEYS: DayKey[] = ['dom','seg','ter','qua','qui','sex','sab']
const TODAY = DAY_KEYS[new Date().getDay()]

export default function Dashboard() {
  const [dayKey, setDayKey]       = useState<DayKey>(TODAY)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState<Activity | 'new' | null>(null)
  const router = useRouter()

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getActivities(dayKey)
    setActivities(data)
    setLoading(false)
  }, [dayKey])

  useEffect(() => { load() }, [load])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <Routine
        activities={activities}
        dayKey={dayKey}
        loading={loading}
        onDayChange={k => { setDayKey(k); setEditing(null) }}
        onEditActivity={a => setEditing(a)}
        onAddActivity={() => setEditing('new')}
        onLogout={handleLogout}
      />
      {editing !== null && (
        <ActivityEditor
          activity={editing === 'new' ? null : editing}
          defaultDay={dayKey}
          onSave={() => { setEditing(null); load() }}
          onDelete={() => { setEditing(null); load() }}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
