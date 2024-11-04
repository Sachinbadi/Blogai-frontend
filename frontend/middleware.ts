import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for authentication pages
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/register'

  const isApiRequest = request.nextUrl.pathname.startsWith('/api')
  const isPublicPath = request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname === '/favicon.ico'

  // Allow API requests and public paths to pass through
  if (isApiRequest || isPublicPath) {
    return NextResponse.next()
  }

  // For now, we'll let all requests through since we haven't implemented
  // session management yet. You can uncomment and modify this code once
  // you implement session handling with your FastAPI backend
  
  /*
  // Redirect to login page if not authenticated
  if (!isAuthPage && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if already authenticated and trying to access auth pages
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  */

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 