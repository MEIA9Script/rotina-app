'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { seedDefaultActivities } from '@/lib/seed'
import { useRouter } from 'next/navigation'

const s: Record<string,React.CSSProperties> = {
  page: { minHeight:'100vh', background:'#06090f', display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { width:'100%', maxWidth:380, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:32 },
  logo: { fontFamily:"'Exo 2',sans-serif", fontSize:32, fontWeight:900, color:'#f0f6ff', marginBottom:4 },
  logoSpan: { color:'#30c26a' },
  sub: { fontSize:13, color:'rgba(220,232,240,0.4)', marginBottom:32 },
  label: { display:'block', fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'rgba(220,232,240,0.4)', marginBottom:6 },
  input: { width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'12px 14px', color:'#dce8f0', fontSize:14, outline:'none', marginBottom:14 },
  btn: { width:'100%', padding:'14px 0', borderRadius:10, border:'none', fontFamily:"'Exo 2',sans-serif", fontSize:15, fontWeight:800, letterSpacing:1, cursor:'pointer', marginTop:8 },
  btnPrimary: { background:'#30c26a', color:'#fff' },
  btnSecondary: { background:'transparent', color:'rgba(220,232,240,0.5)', border:'1px solid rgba(255,255,255,0.08)', marginTop:8 },
  err: { background:'rgba(255,80,80,0.1)', border:'1px solid rgba(255,80,80,0.2)', borderRadius:8, padding:'10px 12px', fontSize:12, color:'rgba(255,120,120,0.9)', marginBottom:12 },
  toggle: { textAlign:'center' as const, marginTop:20, fontSize:13, color:'rgba(220,232,240,0.4)' },
  toggleBtn: { background:'none', border:'none', color:'#30c26a', fontWeight:600, cursor:'pointer', fontSize:13 },
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isNew, setIsNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handle = async () => {
    if (!email || !password) { setError('Preenche email e senha'); return }
    setLoading(true); setError('')
    try {
      if (isNew) {
        const { data, error: e } = await supabase.auth.signUp({ email, password })
        if (e) { setError(e.message); return }
        if (data.user) {
          await seedDefaultActivities(data.user.id)
        }
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password })
        if (e) { setError(e.message); return }
      }
      router.push('/dashboard')
      router.refresh()
    } finally { setLoading(false) }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>Minha <span style={s.logoSpan}>Rotina</span></div>
        <div style={s.sub}>{isNew ? 'Cria sua conta e começa hoje' : 'Bem-vindo de volta'}</div>
        {error && <div style={s.err}>{error}</div>}
        <label style={s.label}>Email</label>
        <input style={s.input} type="email" placeholder="seu@email.com"
          value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
        <label style={s.label}>Senha</label>
        <input style={s.input} type="password" placeholder="••••••••"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handle()} autoComplete={isNew ? 'new-password' : 'current-password'} />
        <button style={{...s.btn,...s.btnPrimary}} onClick={handle} disabled={loading}>
          {loading ? '...' : isNew ? '🚀 Criar conta' : '→ Entrar'}
        </button>
        <div style={s.toggle}>
          {isNew ? 'Já tem conta? ' : 'Não tem conta? '}
          <button style={s.toggleBtn} onClick={() => { setIsNew(!isNew); setError('') }}>
            {isNew ? 'Fazer login' : 'Criar agora'}
          </button>
        </div>
      </div>
    </div>
  )
}
