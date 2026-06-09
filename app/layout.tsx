import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Minha Rotina',
  description: 'Rotina diária com treino, Nexsite e sono',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Rotina', statusBarStyle: 'black-translucent' },
  themeColor: '#06090f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
