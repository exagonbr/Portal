import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/courses',
  '/lessons',
  '/live',
  '/chat',
  '/profile'
]

// Paths that should not be accessible when authenticated
const authPaths = [
  '/login',
  '/register'
]

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')
  const { pathname } = request.nextUrl

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))

  // If the path requires authentication and user is not authenticated
  if (isProtectedPath && !token) {
    const response = NextResponse.redirect(new URL('/', request.url))
    return response
  }

  // If user is authenticated and tries to access auth pages
  if (isAuthPath && token) {
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
