'use client'
import { useState, useEffect, useCallback } from 'react'
import { Activity, DayKey } from '@/types'
import { getDayCompletions, toggleCompletion, getDayTaskCompletions, toggleTaskCompletion } from '@/lib/completions'

const tMin = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m }

const DAYS_META: { key: DayKey; short: string; college: boolean; trainName: string | null }[] = [
  { key:'seg', short:'SEG', college:false, trainName:'Força Máxima' },
  { key:'ter', short:'TER', college:true,  trainName:'Pliometria'   },
  { key:'qua', short:'QUA', college:true,  trainName:null           },
  { key:'qui', short:'QUI', college:true,  trainName:'Explosão'     },
  { key:'sex', short:'SEX', college:false, trainName:null           },
  { key:'sab', short:'SAB', college:false, trainName:'Dunk Day'     },
  { key:'dom', short:'DOM', college:false, trainName:null           },
]

const T: Record<string,{a:string,b:string,bc:string,tg:string}> = {
  sleep:   {a:'#5a8fcf',b:'rgba(5,8,20,0.95)',  bc:'rgba(90,143,207,0.15)', tg:'rgba(90,143,207,0.18)'},
  morning: {a:'#7a9ab0',b:'rgba(8,14,22,0.95)',  bc:'rgba(122,154,176,0.1)',tg:'rgba(122,154,176,0.15)'},
  work:    {a:'#38a3d4',b:'rgba(5,16,32,0.95)',  bc:'rgba(56,163,212,0.18)',tg:'rgba(56,163,212,0.2)'},
  nexsite: {a:'#30c26a',b:'rgba(3,16,9,0.95)',   bc:'rgba(48,194,106,0.18)',tg:'rgba(48,194,106,0.2)'},
  train:   {a:'#ff7800',b:'rgba(20,7,0,0.95)',   bc:'rgba(255,120,0,0.2)',  tg:'rgba(255,120,0,0.22)'},
  ball:    {a:'#f5a623',b:'rgba(20,12,0,0.95)',  bc:'rgba(245,166,35,0.18)',tg:'rgba(245,166,35,0.2)'},
  meal:    {a:'#d4980a',b:'rgba(14,10,0,0.95)',  bc:'rgba(212,152,10,0.15)',tg:'rgba(212,152,10,0.18)'},
  person:  {a:'#a07cd0',b:'rgba(12,7,20,0.95)', bc:'rgba(160,124,208,0.15)',tg:'rgba(160,124,208,0.18)'},
  college: {a:'#f472b6',b:'rgba(20,3,12,0.95)', bc:'rgba(244,114,182,0.18)',tg:'rgba(244,114,182,0.2)'},
  wind:    {a:'#4a6a8a',b:'rgba(5,9,17,0.95)',   bc:'rgba(74,106,138,0.12)',tg:'rgba(74,106,138,0.15)'},
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800;900&display=swap');
  .rt-root{max-width:520px;margin:0 auto;padding-bottom:80px;}
  .rt-hdr{padding:22px 18px 16px;background:linear-gradient(180deg,#0b1018,#06090f);border-bottom:1px solid rgba(255,255,255,0.05);}
  .rt-hdr-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;}
  .rt-title{font-family:'Exo 2',sans-serif;font-size:26px;font-weight:900;color:#f0f6ff;line-height:1;}
  .rt-title span{color:#30c26a;}
  .rt-lbl{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(220,232,240,0.3);margin-bottom:4px;}
  .rt-dayname{font-family:'Exo 2',sans-serif;font-size:30px;font-weight:900;color:rgba(255,255,255,0.07);line-height:1;}
  .rt-hdr-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;}
  .rt-badges{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;}
  .rt-badge{display:flex;align-items:center;gap:4px;padding:4px 9px;border-radius:20px;font-size:10.5px;font-weight:600;border:1px solid;}
  .rt-logbtn{font-size:10px;font-weight:600;color:rgba(220,232,240,0.3);background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:6px;padding:3px 9px;cursor:pointer;}
  .rt-bbtoggle{display:flex;align-items:center;justify-content:space-between;padding:9px 13px;background:rgba(245,166,35,0.07);border:1px solid rgba(245,166,35,0.18);border-radius:10px;cursor:pointer;}
  .rt-bblabel{font-size:12.5px;font-weight:600;color:#f5a623;}
  .rt-bbsub{font-size:10px;color:rgba(245,166,35,0.45);margin-top:1px;}
  .sw{width:34px;height:19px;border-radius:10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);position:relative;transition:background 0.2s;flex-shrink:0;}
  .sw.on{background:#f5a623;border-color:#f5a623;}
  .sw-k{position:absolute;top:3px;left:3px;width:11px;height:11px;border-radius:50%;background:#fff;transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.4);}
  .sw.on .sw-k{left:18px;}
  .rt-daysel{display:flex;background:#0b0f18;border-bottom:1px solid rgba(255,255,255,0.05);overflow-x:auto;scrollbar-width:none;}
  .rt-daysel::-webkit-scrollbar{display:none;}
  .rt-daybtn{flex:1;min-width:40px;padding:8px 3px 6px;text-align:center;cursor:pointer;background:none;border:none;border-bottom:2px solid transparent;transition:all 0.15s;}
  .rt-daybtn-n{font-family:'Exo 2',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.5px;color:rgba(220,232,240,0.3);display:block;margin-bottom:2px;}
  .rt-daybtn.active .rt-daybtn-n{color:#f0f6ff;}
  .rt-daybtn.active{border-bottom-color:var(--ac);}
  .rt-dots{display:flex;justify-content:center;gap:2px;margin-top:2px;}
  .rt-dot{width:4px;height:4px;border-radius:50%;}
  .rt-prog{padding:10px 16px 8px;background:rgba(255,255,255,0.015);border-bottom:1px solid rgba(255,255,255,0.04);}
  .rt-prog-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
  .rt-prog-txt{font-size:11px;color:rgba(220,232,240,0.4);}
  .rt-prog-pct{font-family:'Exo 2',sans-serif;font-size:13px;font-weight:800;}
  .rt-prog-bar{height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;}
  .rt-prog-fill{height:100%;border-radius:2px;transition:width 0.4s ease;}
  .rt-sumbar{display:flex;background:rgba(255,255,255,0.015);border-bottom:1px solid rgba(255,255,255,0.04);}
  .rt-sum{flex:1;padding:9px 5px;text-align:center;border-right:1px solid rgba(255,255,255,0.04);}
  .rt-sum:last-child{border-right:none;}
  .rt-sum-v{font-family:'Exo 2',sans-serif;font-size:15px;font-weight:800;line-height:1;margin-bottom:2px;}
  .rt-sum-l{font-size:8px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(220,232,240,0.28);}
  .rt-tl{padding:10px 14px 0;}
  .rt-blk{display:flex;gap:8px;margin-bottom:5px;}
  .rt-blk-l{width:44px;flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;}
  .rt-blk-t{font-family:'Exo 2',sans-serif;font-size:10.5px;font-weight:600;color:rgba(220,232,240,0.28);white-space:nowrap;margin-top:12px;}
  .rt-blk-line{width:1px;flex:1;margin-top:3px;min-height:18px;}
  .rt-card{flex:1;border-radius:10px;padding:9px 10px;border:1px solid;transition:all 0.2s;}
  .rt-card.done{opacity:0.45;}
  .rt-top{display:flex;align-items:center;gap:6px;cursor:pointer;}
  .rt-ico{font-size:14px;flex-shrink:0;line-height:1;}
  .rt-name{font-size:12.5px;font-weight:600;flex:1;line-height:1.25;}
  .rt-name.done{text-decoration:line-through;opacity:0.6;}
  .rt-tag{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:2px 6px;border-radius:7px;flex-shrink:0;}
  .rt-chk{width:26px;height:26px;border-radius:50%;border:1.5px solid;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;font-size:13px;font-weight:700;}
  .rt-edit{width:22px;height:22px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;color:rgba(220,232,240,0.4);}
  .rt-edit:hover{border-color:rgba(255,255,255,0.2);color:rgba(220,232,240,0.7);}
  .rt-det{font-size:11px;color:rgba(220,232,240,0.5);line-height:1.55;margin-top:7px;padding-top:7px;border-top:1px solid rgba(255,255,255,0.06);}
  .rt-tasks{margin-top:6px;display:flex;flex-direction:column;gap:4px;}
  .rt-taskrow{display:flex;gap:8px;align-items:flex-start;cursor:pointer;padding:2px 0;}
  .rt-taskchk{width:16px;height:16px;border-radius:4px;border:1.5px solid;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;transition:all 0.15s;}
  .rt-tasktxt{font-size:11px;color:rgba(220,232,240,0.5);line-height:1.45;flex:1;}
  .rt-tasktxt.done{text-decoration:line-through;opacity:0.45;}
  .rt-alldone{margin:14px 16px 0;padding:14px 16px;background:rgba(48,194,106,0.08);border:1px solid rgba(48,194,106,0.2);border-radius:12px;text-align:center;}
  .rt-alldone-ico{font-size:28px;margin-bottom:6px;}
  .rt-alldone-txt{font-family:'Exo 2',sans-serif;font-size:16px;font-weight:800;color:#30c26a;letter-spacing:0.5px;margin-bottom:3px;}
  .rt-alldone-sub{font-size:11px;color:rgba(48,194,106,0.5);}
  .rt-fab{position:fixed;bottom:24px;right:20px;width:52px;height:52px;border-radius:50%;background:#30c26a;border:none;font-size:24px;color:#fff;box-shadow:0 4px 20px rgba(48,194,106,0.4);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform 0.15s;}
  .rt-fab:hover{transform:scale(1.08);}
  .rt-loading{padding:40px 20px;text-align:center;color:rgba(220,232,240,0.3);font-size:14px;}
`

interface Props {
  activities: Activity[]
  dayKey: DayKey
  loading: boolean
  onDayChange: (d: DayKey) => void
  onEditActivity: (a: Activity) => void
  onAddActivity: () => void
  onLogout: () => void
}

export default function Routine({ activities, dayKey, loading, onDayChange, onEditActivity, onAddActivity, onLogout }: Props) {
  const [completions, setCompletions] = useState<Record<string,boolean>>({})
  const [taskCompletions, setTaskCompletions] = useState<Record<string,boolean>>({})
  const [open, setOpen] = useState<string|null>(null)
  const [bbOn, setBbOn] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const meta = DAYS_META.find(d => d.key === dayKey)!

  const loadCompletions = useCallback(async () => {
    const [bl, tk] = await Promise.all([getDayCompletions(today), getDayTaskCompletions(today)])
    const bm: Record<string,boolean> = {}; bl.forEach((c: any) => { bm[c.activity_id] = c.completed })
    const tm: Record<string,boolean> = {}; tk.forEach((c: any) => { tm[c.task_id] = c.completed })
    setCompletions(bm); setTaskCompletions(tm)
  }, [today])

  useEffect(() => { loadCompletions() }, [dayKey, loadCompletions])

  const doToggleBlock = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const next = !completions[id]
    setCompletions(p => ({ ...p, [id]: next }))
    await toggleCompletion(id, today, next)
  }

  const doToggleTask = async (tid: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const next = !taskCompletions[tid]
    setTaskCompletions(p => ({ ...p, [tid]: next }))
    await toggleTaskCompletion(tid, today, next)
  }

  const visibleActivities = [...activities]
    .filter(a => bbOn || a.type !== 'ball')
    .sort((a, b) => tMin(a.time) - tMin(b.time))

  const hasTrain = activities.some(a => a.type === 'train')
  const checkable = visibleActivities.filter(a => a.type !== 'sleep')
  const done = checkable.filter(a => completions[a.id]).length
  const pct = checkable.length ? Math.round((done / checkable.length) * 100) : 0
  const allDone = checkable.length > 0 && done === checkable.length
  const progColor = pct < 30 ? T.work.a : pct < 70 ? '#f5a623' : '#30c26a'

  const hasBball = activities.some(a => a.type === 'ball')

  const dotColors = (key: DayKey) => {
    const m = DAYS_META.find(d => d.key === key)!
    const r = []
    if (['seg','ter','qua','qui','sex'].includes(key)) r.push(T.work.a)
    if (m.trainName) r.push(T.train.a)
    r.push(T.nexsite.a)
    if (m.college) r.push(T.college.a)
    return r.slice(0,4)
  }

  return (
    <>
      <style>{css}</style>
      <div className="rt-root">

        {/* HEADER */}
        <div className="rt-hdr">
          <div className="rt-hdr-row">
            <div>
              <div className="rt-lbl">Rotina diária</div>
              <div className="rt-title">Minha <span>Rotina</span></div>
            </div>
            <div className="rt-hdr-right">
              <div className="rt-dayname">{meta.short}</div>
              <button className="rt-logbtn" onClick={onLogout}>Sair</button>
            </div>
          </div>
          <div className="rt-badges">
            {hasTrain && (
              <span className="rt-badge" style={{color:T.train.a,borderColor:T.train.bc,background:T.train.b}}>
                💪 {meta.trainName}
              </span>
            )}
            {!hasTrain && (
              <span className="rt-badge" style={{color:'#4a6a8a',borderColor:'rgba(74,106,138,0.2)',background:'rgba(5,9,17,0.9)'}}>
                😴 Descanso de treino
              </span>
            )}
            {meta.college && (
              <span className="rt-badge" style={{color:T.college.a,borderColor:T.college.bc,background:T.college.b}}>
                🎓 Faculdade 19h–22h
              </span>
            )}
          </div>
          {hasBball && (
            <div className="rt-bbtoggle" onClick={() => setBbOn(p => !p)}>
              <div>
                <div className="rt-bblabel">🏀 Jogar Basquete hoje</div>
                <div className="rt-bbsub">{bbOn ? 'Ativado' : 'Toca pra ativar'}</div>
              </div>
              <div className={`sw${bbOn ? ' on' : ''}`}><div className="sw-k" /></div>
            </div>
          )}
        </div>

        {/* DAY SELECTOR */}
        <div className="rt-daysel">
          {DAYS_META.map(d => {
            const ac = d.trainName ? T.train.a : d.college ? T.college.a : T.nexsite.a
            return (
              <button key={d.key} className={`rt-daybtn${dayKey===d.key?' active':''}`}
                style={{'--ac':ac} as React.CSSProperties} onClick={() => onDayChange(d.key)}>
                <span className="rt-daybtn-n">{d.short}</span>
                <div className="rt-dots">
                  {dotColors(d.key).map((c,i) => (
                    <div key={i} className="rt-dot" style={{background:c, opacity:dayKey===d.key?1:0.35}} />
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        {/* PROGRESS */}
        <div className="rt-prog">
          <div className="rt-prog-row">
            <span className="rt-prog-txt">{done} de {checkable.length} concluídos</span>
            <span className="rt-prog-pct" style={{color:progColor}}>{pct}%</span>
          </div>
          <div className="rt-prog-bar">
            <div className="rt-prog-fill" style={{width:`${pct}%`, background:progColor}} />
          </div>
        </div>

        {/* SUMMARY */}
        <div className="rt-sumbar">
          {[
            {v: ['seg','ter','qua','qui','sex'].includes(dayKey)?'9.5h':'—', l:'Trabalho', c:T.work.a},
            {v: hasTrain ? (meta.college?'35min':'1h') : '—', l:'Treino', c:T.train.a},
            {v: hasBball ? '1h' : '—', l:'Basquete', c:T.ball.a},
            {v: meta.college ? '2h' : '1.5h', l:'Nexsite', c:T.nexsite.a},
            {v: meta.college ? '7h' : '8h', l:'Sono', c:T['sleep'].a},
          ].map((s,i) => (
            <div key={i} className="rt-sum">
              <div className="rt-sum-v" style={{color:s.c}}>{s.v}</div>
              <div className="rt-sum-l">{s.l}</div>
            </div>
          ))}
        </div>

        {/* ALL DONE */}
        {allDone && (
          <div className="rt-alldone">
            <div className="rt-alldone-ico">🏆</div>
            <div className="rt-alldone-txt">DIA CONCLUÍDO!</div>
            <div className="rt-alldone-sub">Você arrasou hoje. Descansa bem.</div>
          </div>
        )}

        {/* TIMELINE */}
        <div className="rt-tl">
          {loading ? (
            <div className="rt-loading">Carregando rotina...</div>
          ) : visibleActivities.map(block => {
            const tp = T[block.type] || T.morning
            const isOpen = open === block.id
            const isDone = !!completions[block.id]
            const isCheckable = block.type !== 'sleep'
            const tasks = block.activity_tasks?.sort((a,b)=>a.sort_order-b.sort_order) ?? []

            return (
              <div key={block.id} className="rt-blk">
                <div className="rt-blk-l">
                  <div className="rt-blk-t">{block.time}</div>
                  <div className="rt-blk-line" style={{background:tp.a, opacity:isDone?0.1:0.2}} />
                </div>
                <div className={`rt-card${isDone?' done':''}`}
                  style={{background:tp.b, borderColor: isOpen ? tp.a : isDone ? 'rgba(48,194,106,0.2)' : tp.bc}}>
                  <div className="rt-top" onClick={() => (block.detail || tasks.length) && setOpen(isOpen ? null : block.id)}>
                    <div className="rt-ico">{block.icon}</div>
                    <div className={`rt-name${isDone?' done':''}`} style={{color:isDone?'rgba(220,232,240,0.4)':tp.a}}>
                      {block.name}
                    </div>
                    {block.tag && (
                      <div className="rt-tag" style={{color:tp.a, background:tp.tg}}>{block.tag}</div>
                    )}
                    <div className="rt-edit" onClick={e => { e.stopPropagation(); onEditActivity(block) }}>✏️</div>
                    {isCheckable && (
                      <div className="rt-chk"
                        style={{borderColor:isDone?'#30c26a':tp.a, background:isDone?'#30c26a':'transparent', color:isDone?'#fff':tp.a}}
                        onClick={e => doToggleBlock(block.id, e)}>
                        {isDone ? '✓' : ''}
                      </div>
                    )}
                  </div>
                  {isOpen && (
                    <>
                      {block.detail && <div className="rt-det">{block.detail}</div>}
                      {tasks.length > 0 && (
                        <div className="rt-tasks">
                          {tasks.map(t => {
                            const tDone = !!taskCompletions[t.id]
                            return (
                              <div key={t.id} className="rt-taskrow" onClick={e => doToggleTask(t.id, e)}>
                                <div className="rt-taskchk"
                                  style={{borderColor:tDone?'#30c26a':tp.a, background:tDone?'#30c26a':'transparent', color:'#fff'}}>
                                  {tDone?'✓':''}
                                </div>
                                <span className={`rt-tasktxt${tDone?' done':''}`}>{t.text}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* FAB */}
        <button className="rt-fab" onClick={onAddActivity} title="Nova atividade">+</button>

      </div>
    </>
  )
}
