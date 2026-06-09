import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  const hasSession =
    req.cookies.has('sb-nkeajooyqjzgivpjlvlk-auth-token') ||
    req.cookies.has('sb-access-token') ||
    req.cookies.has('supabase-auth-token')

  if (!hasSession && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (hasSession && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',],
}
