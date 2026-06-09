import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ACTIVITIES = [
  { day_key:'seg', time:'06:00', name:'Acordar — sem celular', type:'morning', icon:'☀️', tag:'Manhã', detail:'Água, café, sem celular.', tasks:[] },
  { day_key:'seg', time:'06:50', name:'Leva a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'seg', time:'07:30', name:'Cold Call — Bloco 1 (pico)', type:'work', icon:'📞', tag:'Trabalho', detail:'Melhor hora do dia.', tasks:['Monta lista de contatos antes de ligar','Personaliza a abertura do script','Anota: quente / frio / callback'] },
  { day_key:'seg', time:'10:00', name:'Busca a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'seg', time:'10:30', name:'Cold Call — Bloco 2', type:'work', icon:'📞', tag:'Trabalho', detail:'Follow-up nos que não atenderam.', tasks:['Retorna os não atendidos','Atualiza o pipeline'] },
  { day_key:'seg', time:'12:00', name:'Almoço + 15 min de sol', type:'meal', icon:'🍽️', tag:'Refeição', detail:'15 min de sol calibra o relógio biológico.', tasks:[] },
  { day_key:'seg', time:'13:00', name:'Leva a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'seg', time:'14:00', name:'Cold Call — Bloco 3', type:'work', icon:'📞', tag:'Trabalho', detail:'Tarde — fica de pé se a energia cair.', tasks:['Foca em fechar quem demonstrou interesse'] },
  { day_key:'seg', time:'16:30', name:'Busca a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'seg', time:'17:00', name:'Cold Call — Fechamento', type:'work', icon:'📞', tag:'Trabalho', detail:'Fecha o dia, bate meta.', tasks:['Contagem total de calls','Anota 1 melhoria pro pitch','Atualiza pipeline'] },
  { day_key:'seg', time:'18:00', name:'Transição + lanche', type:'meal', icon:'🍌', tag:'Refeição', detail:'20 min de descanso mental.', tasks:[] },
  { day_key:'seg', time:'18:30', name:'Treino — Força Máxima', type:'train', icon:'💪', tag:'Treino', detail:'Em casa, ~55 min.', tasks:['Pistol squat: 4×5/perna','Búlgaro (sofá): 3×10/perna','Nórdico (pés sob sofá): 3×5','Hip Thrust: 3×12','Panturrilha unilateral (degrau): 4×15/perna'] },
  { day_key:'seg', time:'19:30', name:'Janta', type:'meal', icon:'🍽️', tag:'Refeição', detail:'Mínimo 30g proteína.', tasks:[] },
  { day_key:'seg', time:'20:15', name:'Nexsite — Prospecção', type:'nexsite', icon:'💻', tag:'Nexsite', detail:'Segunda é dia de encher o funil.', tasks:['Lista 10 negócios locais sem site','Anota: nome, Instagram, telefone','Print do site ruim → arquivo de leads'] },
  { day_key:'seg', time:'21:00', name:'Wind-down — celular off', type:'wind', icon:'🌙', tag:'Wind-down', detail:'Banho, alongamento, leitura. Carregador na sala.', tasks:[] },
  { day_key:'seg', time:'22:00', name:'SONO — 8 horas', type:'sleep', icon:'💤', tag:'Sono', detail:'Alvo: 22:00.', tasks:[] },
  { day_key:'ter', time:'06:00', name:'Acordar — sem celular', type:'morning', icon:'☀️', tag:'Manhã', detail:'', tasks:[] },
  { day_key:'ter', time:'06:50', name:'Leva a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'ter', time:'07:30', name:'Cold Call — Bloco 1', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:['Monta lista de contatos','Personaliza a abertura'] },
  { day_key:'ter', time:'10:00', name:'Busca a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'ter', time:'10:30', name:'Cold Call — Bloco 2', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:[] },
  { day_key:'ter', time:'12:00', name:'Almoço + sol', type:'meal', icon:'🍽️', tag:'Refeição', detail:'', tasks:[] },
  { day_key:'ter', time:'13:00', name:'Leva a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'ter', time:'14:00', name:'Cold Call — Bloco 3', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:[] },
  { day_key:'ter', time:'16:30', name:'Busca a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'ter', time:'17:00', name:'Cold Call — Fechamento', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:[] },
  { day_key:'ter', time:'18:00', name:'Transição + lanche rápido', type:'meal', icon:'🍌', tag:'Refeição', detail:'', tasks:[] },
  { day_key:'ter', time:'18:15', name:'Treino — Pliometria', type:'train', icon:'⚡', tag:'Treino', detail:'35 min antes da faculdade.', tasks:['Depth jump (degrau): 4×5','Salto máximo: 3×5','Broad jump: 3×5','Sprint 15m: 3×'] },
  { day_key:'ter', time:'18:55', name:'Janta rápida', type:'meal', icon:'🍽️', tag:'Refeição', detail:'', tasks:[] },
  { day_key:'ter', time:'19:00', name:'Leva à faculdade', type:'college', icon:'🎓', tag:'Faculdade', detail:'', tasks:[] },
  { day_key:'ter', time:'19:20', name:'Nexsite — Desenvolvimento', type:'nexsite', icon:'💻', tag:'Nexsite', detail:'Casa vazia, foco total.', tasks:['Trabalha no projeto ativo','Testa no celular','Commita no GitHub'] },
  { day_key:'ter', time:'21:45', name:'Busca na faculdade', type:'college', icon:'🚗', tag:'Faculdade', detail:'', tasks:[] },
  { day_key:'ter', time:'22:15', name:'Chegada + wind-down', type:'wind', icon:'🌙', tag:'Wind-down', detail:'', tasks:[] },
  { day_key:'ter', time:'22:45', name:'SONO', type:'sleep', icon:'💤', tag:'Sono', detail:'', tasks:[] },
  { day_key:'qua', time:'06:00', name:'Acordar — sem celular', type:'morning', icon:'☀️', tag:'Manhã', detail:'', tasks:[] },
  { day_key:'qua', time:'06:50', name:'Leva a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'qua', time:'07:30', name:'Cold Call — Bloco 1', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:[] },
  { day_key:'qua', time:'10:00', name:'Busca a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'qua', time:'10:30', name:'Cold Call — Bloco 2', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:[] },
  { day_key:'qua', time:'12:00', name:'Almoço + sol', type:'meal', icon:'🍽️', tag:'Refeição', detail:'', tasks:[] },
  { day_key:'qua', time:'13:00', name:'Leva a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'qua', time:'14:00', name:'Cold Call — Bloco 3', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:[] },
  { day_key:'qua', time:'16:30', name:'Busca a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'qua', time:'17:00', name:'Cold Call — Fechamento', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:[] },
  { day_key:'qua', time:'18:00', name:'Janta com a esposa', type:'meal', icon:'🍽️', tag:'Refeição', detail:'', tasks:[] },
  { day_key:'qua', time:'19:00', name:'Leva à faculdade', type:'college', icon:'🎓', tag:'Faculdade', detail:'', tasks:[] },
  { day_key:'qua', time:'19:15', name:'Nexsite — Pitch Comercial', type:'nexsite', icon:'💻', tag:'Nexsite', detail:'Maior bloco da semana.', tasks:['Cria template de proposta','Inclui: problema → solução → valor','Adapta 2 propostas pros leads'] },
  { day_key:'qua', time:'21:45', name:'Busca na faculdade', type:'college', icon:'🚗', tag:'Faculdade', detail:'', tasks:[] },
  { day_key:'qua', time:'22:15', name:'Chegada + wind-down', type:'wind', icon:'🌙', tag:'Wind-down', detail:'', tasks:[] },
  { day_key:'qua', time:'22:45', name:'SONO', type:'sleep', icon:'💤', tag:'Sono', detail:'', tasks:[] },
  { day_key:'qui', time:'06:00', name:'Acordar — sem celular', type:'morning', icon:'☀️', tag:'Manhã', detail:'', tasks:[] },
  { day_key:'qui', time:'06:50', name:'Leva a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'qui', time:'07:30', name:'Cold Call — Bloco 1', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:[] },
  { day_key:'qui', time:'10:00', name:'Busca a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'qui', time:'10:30', name:'Cold Call — Bloco 2', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:[] },
  { day_key:'qui', time:'12:00', name:'Almoço + sol', type:'meal', icon:'🍽️', tag:'Refeição', detail:'', tasks:[] },
  { day_key:'qui', time:'13:00', name:'Leva a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'qui', time:'14:00', name:'Cold Call — Bloco 3', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:[] },
  { day_key:'qui', time:'16:30', name:'Busca a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'qui', time:'17:00', name:'Cold Call — Fechamento', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:[] },
  { day_key:'qui', time:'18:00', name:'Transição + lanche rápido', type:'meal', icon:'🍌', tag:'Refeição', detail:'', tasks:[] },
  { day_key:'qui', time:'18:15', name:'Treino — Explosão', type:'train', icon:'🔥', tag:'Treino', detail:'35 min antes da faculdade.', tasks:['Jump Squat c/ mochila 5-10kg: 4×8','Step-Up explosivo: 3×8/perna','Búlgaro explosivo: 3×6/perna','Prancha rotação: 3×30s'] },
  { day_key:'qui', time:'18:55', name:'Janta rápida', type:'meal', icon:'🍽️', tag:'Refeição', detail:'', tasks:[] },
  { day_key:'qui', time:'19:00', name:'Leva à faculdade', type:'college', icon:'🎓', tag:'Faculdade', detail:'', tasks:[] },
  { day_key:'qui', time:'19:20', name:'Nexsite — Contato & Vendas', type:'nexsite', icon:'💻', tag:'Nexsite', detail:'Usa cold call pra Nexsite.', tasks:['Liga/áudio WhatsApp pros leads','"Vi que não têm site — fiz um exemplo"','Meta: 5 conversas hoje'] },
  { day_key:'qui', time:'21:45', name:'Busca na faculdade', type:'college', icon:'🚗', tag:'Faculdade', detail:'', tasks:[] },
  { day_key:'qui', time:'22:15', name:'Chegada + wind-down', type:'wind', icon:'🌙', tag:'Wind-down', detail:'', tasks:[] },
  { day_key:'qui', time:'22:45', name:'SONO', type:'sleep', icon:'💤', tag:'Sono', detail:'', tasks:[] },
  { day_key:'sex', time:'06:00', name:'Acordar — sem celular', type:'morning', icon:'☀️', tag:'Manhã', detail:'', tasks:[] },
  { day_key:'sex', time:'06:50', name:'Leva a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'sex', time:'07:30', name:'Cold Call — Bloco 1', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:[] },
  { day_key:'sex', time:'10:00', name:'Busca a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'sex', time:'10:30', name:'Cold Call — Bloco 2', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:[] },
  { day_key:'sex', time:'12:00', name:'Almoço + sol', type:'meal', icon:'🍽️', tag:'Refeição', detail:'', tasks:[] },
  { day_key:'sex', time:'13:00', name:'Leva a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'sex', time:'14:00', name:'Cold Call — Bloco 3', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:[] },
  { day_key:'sex', time:'16:30', name:'Busca a esposa', type:'person', icon:'🚗', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'sex', time:'17:00', name:'Cold Call — Fechamento', type:'work', icon:'📞', tag:'Trabalho', detail:'', tasks:[] },
  { day_key:'sex', time:'18:00', name:'Janta + descanso', type:'meal', icon:'🍽️', tag:'Refeição', detail:'', tasks:[] },
  { day_key:'sex', time:'18:45', name:'Nexsite — Aprendizado', type:'nexsite', icon:'💻', tag:'Nexsite', detail:'', tasks:['Escolhe 1 skill: SEO / React / UX','Assiste 1 tutorial e replica','Anota 3 pontos no Notion'] },
  { day_key:'sex', time:'21:00', name:'Wind-down — celular off', type:'wind', icon:'🌙', tag:'Wind-down', detail:'', tasks:[] },
  { day_key:'sex', time:'22:00', name:'SONO — 8 horas', type:'sleep', icon:'💤', tag:'Sono', detail:'', tasks:[] },
  { day_key:'sab', time:'06:00', name:'Acordar', type:'morning', icon:'☀️', tag:'Manhã', detail:'Sem trabalho!', tasks:[] },
  { day_key:'sab', time:'06:30', name:'Nexsite — Build Intensivo (bloco 1)', type:'nexsite', icon:'💻', tag:'Nexsite', detail:'Melhor foco da semana.', tasks:['Define entregável antes de começar','Sem redes sociais até treinar'] },
  { day_key:'sab', time:'08:30', name:'Café reforçado + preparo', type:'meal', icon:'🍽️', tag:'Refeição', detail:'', tasks:[] },
  { day_key:'sab', time:'09:00', name:'Dunk Day — Na Quadra', type:'train', icon:'🏀', tag:'Treino', detail:'~90 min.', tasks:['Saltos progressivos: 50% → 100%','Dunk 1 passo: 4×5','Dunk 2-3 passos: 4×5','180° → 360° sem bola: 4×6'] },
  { day_key:'sab', time:'10:30', name:'Almoço reforçado', type:'meal', icon:'🍽️', tag:'Refeição', detail:'', tasks:[] },
  { day_key:'sab', time:'12:00', name:'Nexsite — Build Intensivo (bloco 2)', type:'nexsite', icon:'💻', tag:'Nexsite', detail:'2h deep work.', tasks:['Continua o projeto','Testa, ajusta, finaliza','Sobe no portfólio'] },
  { day_key:'sab', time:'15:00', name:'Tempo com a esposa', type:'person', icon:'❤️', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'sab', time:'21:00', name:'Wind-down', type:'wind', icon:'🌙', tag:'Wind-down', detail:'', tasks:[] },
  { day_key:'sab', time:'22:00', name:'SONO — 8 horas', type:'sleep', icon:'💤', tag:'Sono', detail:'', tasks:[] },
  { day_key:'dom', time:'06:00', name:'Acordar (até 07h)', type:'morning', icon:'☀️', tag:'Manhã', detail:'', tasks:[] },
  { day_key:'dom', time:'07:00', name:'Manhã tranquila', type:'person', icon:'☕', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'dom', time:'09:00', name:'Nexsite — Planejamento', type:'nexsite', icon:'💻', tag:'Nexsite', detail:'Estratégia, não produção.', tasks:['Revisa leads da semana','Define 1 meta pra semana seguinte','Planeja skill da sexta'] },
  { day_key:'dom', time:'10:00', name:'Tempo pessoal / esposa', type:'person', icon:'❤️', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'dom', time:'13:00', name:'Almoço', type:'meal', icon:'🍽️', tag:'Refeição', detail:'', tasks:[] },
  { day_key:'dom', time:'14:00', name:'Descanso total', type:'person', icon:'😴', tag:'Pessoal', detail:'', tasks:[] },
  { day_key:'dom', time:'18:00', name:'Prep para segunda-feira', type:'morning', icon:'📋', tag:'Prep', detail:'', tasks:['Monta lista de leads pra segunda','Prepara o que precisar'] },
  { day_key:'dom', time:'21:00', name:'Wind-down', type:'wind', icon:'🌙', tag:'Wind-down', detail:'', tasks:[] },
  { day_key:'dom', time:'22:00', name:'SONO — 8 horas', type:'sleep', icon:'💤', tag:'Sono', detail:'', tasks:[] },
]

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verifica se já tem atividades (evita seed duplo)
    const { data: existing } = await supabase
      .from('activities')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    for (const act of ACTIVITIES) {
      const { tasks, ...fields } = act as any
      const { data, error } = await supabase
        .from('activities')
        .insert({ ...fields, user_id: userId, is_default: true })
        .select()
        .single()
      if (error || !data) continue
      if (tasks?.length) {
        await supabase.from('activity_tasks').insert(
          tasks.map((text: string, i: number) => ({ activity_id: data.id, text, sort_order: i }))
        )
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
