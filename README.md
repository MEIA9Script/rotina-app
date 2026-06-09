# Minha Rotina App

Stack: **Next.js 14 + Supabase + Vercel + Web Push**

## Setup em 5 passos

### 1. Instalar dependências
```bash
npm install
```

### 2. Criar projeto no Supabase
1. Acessa **supabase.com** → New Project (região: South America)
2. Vai em **SQL Editor** → cola o `schema.sql` → Execute
3. Em **Authentication → Email** → desativa "Confirm email" (para testar)

### 3. Variáveis de ambiente
Copia `.env.example` para `.env.local` e preenche:
```bash
cp .env.example .env.local
```

Gera as chaves VAPID (push notifications):
```bash
npx web-push generate-vapid-keys
```

### 4. Ícones do app
Cria dois arquivos PNG na pasta `/public`:
- `icon-192.png` (192×192px) — fundo `#06090f`, letra **R** verde `#30c26a`
- `icon-512.png` (512×512px) — mesma identidade

### 5. Deploy no Vercel
```bash
npm i -g vercel
vercel
```
Adiciona as variáveis do `.env.local` em **Vercel → Settings → Environment Variables**

---

## Funcionalidades
- ✅ Login / Cadastro (Supabase Auth)
- ✅ Rotina 7 dias pré-carregada no cadastro
- ✅ Checklist diário com progresso
- ✅ Adicionar / editar / remover atividades
- ✅ Toggle de basquete por dia
- ✅ Web Push Notifications
- ✅ PWA — instalar no celular como app nativo

## Estrutura
```
app/
  login/          → tela de login/cadastro
  dashboard/      → tela principal
  api/notify/     → enviar push notification
  api/cron/       → verificador de notificações (roda a cada 1min no Vercel)
components/
  Routine.tsx     → timeline com checklist
  ActivityEditor.tsx → modal de CRUD de atividades
lib/
  activities.ts   → CRUD de atividades no Supabase
  completions.ts  → checklist diário
  seed.ts         → atividades padrão (inseridas no cadastro)
  notifications.ts → registro de push
public/
  sw.js           → service worker (push notifications)
  manifest.json   → PWA config
```
