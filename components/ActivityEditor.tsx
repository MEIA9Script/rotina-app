'use client'
import { useState } from 'react'
import { Activity, DayKey, BlockType } from '@/types'
import { createActivity, updateActivity, deleteActivity } from '@/lib/activities'

const TYPES: { key: BlockType; label: string }[] = [
  { key:'morning', label:'☀️ Manhã' },{ key:'work', label:'📞 Trabalho' },
  { key:'nexsite', label:'💻 Nexsite' },{ key:'train', label:'💪 Treino' },
  { key:'ball', label:'🏀 Basquete' },{ key:'meal', label:'🍽️ Refeição' },
  { key:'person', label:'❤️ Pessoal' },{ key:'college', label:'🎓 Faculdade' },
  { key:'wind', label:'🌙 Wind-down' },{ key:'sleep', label:'💤 Sono' },
]
const DAYS: { key: DayKey; label: string }[] = [
  { key:'seg', label:'Segunda' },{ key:'ter', label:'Terça' },{ key:'qua', label:'Quarta' },
  { key:'qui', label:'Quinta' },{ key:'sex', label:'Sexta' },{ key:'sab', label:'Sábado' },{ key:'dom', label:'Domingo' },
]

interface Props {
  activity: Activity | null
  defaultDay: DayKey
  onSave: () => void
  onDelete: () => void
  onClose: () => void
}

const I: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 12px', color:'#dce8f0', fontSize:13, outline:'none', marginBottom:10 }
const LB: React.CSSProperties = { display:'block', fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'rgba(220,232,240,0.4)', marginBottom:5 }

export default function ActivityEditor({ activity, defaultDay, onSave, onDelete, onClose }: Props) {
  const [form, setForm] = useState({
    day_key: activity?.day_key ?? defaultDay,
    time: activity?.time ?? '08:00',
    name: activity?.name ?? '',
    type: (activity?.type ?? 'morning') as BlockType,
    icon: activity?.icon ?? '📌',
    tag: activity?.tag ?? '',
    detail: activity?.detail ?? '',
  })
  const [tasks, setTasks] = useState<string[]>(
    activity?.activity_tasks?.sort((a,b)=>a.sort_order-b.sort_order).map(t=>t.text) ?? []
  )
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.name.trim()) return
    setLoading(true)
    if (activity) { await updateActivity(activity.id, { ...form, tasks }) }
    else { await createActivity({ ...form, tasks }) }
    setLoading(false)
    onSave()
  }

  const remove = async () => {
    if (!activity) return
    if (!confirm('Remover essa atividade?')) return
    await deleteActivity(activity.id)
    onDelete()
  }

  const addTask = () => {
    if (newTask.trim()) { setTasks(t => [...t, newTask.trim()]); setNewTask('') }
  }

  const s: Record<string,React.CSSProperties> = {
    overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'flex-end', justifyContent:'center' },
    modal: { width:'100%', maxWidth:520, background:'#0d1018', borderRadius:'20px 20px 0 0', padding:'20px 20px 40px', maxHeight:'90vh', overflowY:'auto' },
    handle: { width:40, height:4, background:'rgba(255,255,255,0.1)', borderRadius:2, margin:'0 auto 20px' },
    title: { fontFamily:"'Exo 2',sans-serif", fontSize:18, fontWeight:800, color:'#f0f6ff', marginBottom:18 },
    row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
    taskRow: { display:'flex', alignItems:'center', gap:8, marginBottom:6 },
    taskText: { flex:1, fontSize:13, color:'rgba(220,232,240,0.7)' },
    taskDel: { background:'none', border:'none', color:'rgba(255,80,80,0.6)', fontSize:16, padding:'0 4px' },
    addRow: { display:'flex', gap:8, marginBottom:10 },
    addInput: { ...I, marginBottom:0, flex:1 },
    addBtn: { background:'rgba(48,194,106,0.15)', border:'1px solid rgba(48,194,106,0.3)', borderRadius:8, color:'#30c26a', fontWeight:700, padding:'0 14px', whiteSpace:'nowrap' as const },
    actions: { display:'flex', gap:8, marginTop:20 },
    btnSave: { flex:1, padding:'13px 0', background:'#30c26a', border:'none', borderRadius:10, fontFamily:"'Exo 2',sans-serif", fontWeight:800, fontSize:14, color:'#fff', letterSpacing:0.5 },
    btnDel: { padding:'13px 16px', background:'rgba(255,80,80,0.1)', border:'1px solid rgba(255,80,80,0.2)', borderRadius:10, color:'rgba(255,120,120,0.8)', fontWeight:700 },
    btnCancel: { padding:'13px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'rgba(220,232,240,0.5)' },
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.handle} />
        <div style={s.title}>{activity ? '✏️ Editar atividade' : '➕ Nova atividade'}</div>

        <div style={s.row}>
          <div>
            <label style={LB}>Dia</label>
            <select style={I} value={form.day_key} onChange={e => set('day_key', e.target.value)}>
              {DAYS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label style={LB}>Horário</label>
            <input style={I} type="time" value={form.time} onChange={e => set('time', e.target.value)} />
          </div>
        </div>

        <label style={LB}>Nome</label>
        <input style={I} placeholder="Ex: Treino de salto" value={form.name} onChange={e => set('name', e.target.value)} />

        <div style={s.row}>
          <div>
            <label style={LB}>Tipo</label>
            <select style={I} value={form.type} onChange={e => set('type', e.target.value)}>
              {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={LB}>Ícone (emoji)</label>
            <input style={I} value={form.icon} onChange={e => set('icon', e.target.value)} maxLength={4} />
          </div>
        </div>

        <label style={LB}>Tag</label>
        <input style={I} placeholder="Ex: Treino" value={form.tag} onChange={e => set('tag', e.target.value)} />

        <label style={LB}>Descrição</label>
        <textarea style={{...I, resize:'none', height:70}} placeholder="Detalhes da atividade..."
          value={form.detail} onChange={e => set('detail', e.target.value)} />

        <label style={LB}>Tarefas / checklist</label>
        {tasks.map((t, i) => (
          <div key={i} style={s.taskRow}>
            <span style={{...s.taskText}}>• {t}</span>
            <button style={s.taskDel} onClick={() => setTasks(ts => ts.filter((_,j) => j !== i))}>✕</button>
          </div>
        ))}
        <div style={s.addRow}>
          <input style={s.addInput} placeholder="Nova tarefa..." value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()} />
          <button style={s.addBtn} onClick={addTask}>+ Add</button>
        </div>

        <div style={s.actions}>
          <button style={s.btnSave} onClick={save} disabled={loading}>
            {loading ? '...' : '💾 Salvar'}
          </button>
          {activity && <button style={s.btnDel} onClick={remove}>🗑️</button>}
          <button style={s.btnCancel} onClick={onClose}>✕</button>
        </div>
      </div>
    </div>
  )
}
