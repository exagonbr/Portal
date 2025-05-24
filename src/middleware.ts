import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Role-specific paths
const studentPaths = ['/dashboard/student']
const teacherPaths = ['/dashboard/teacher']

// General protected paths
const protectedPaths = [
  '/dashboard',
  '/courses',
  '/lessons',
  '/live',
  '/chat',
  '/profile'
]

// Auth paths that should not be accessible when authenticated
const authPaths = [
  '/login',
  '/register'
]

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')
  const userDataCookie = request.cookies.get('user_data')
  const { pathname } = request.nextUrl

  // Check path types
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))
  const isStudentPath = studentPaths.some(path => pathname.startsWith(path))
  const isTeacherPath = teacherPaths.some(path => pathname.startsWith(path))

  // If not authenticated and trying to access protected path
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated and trying to access auth pages
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Role-based access control
  if (userDataCookie) {
    try {
      const userData = JSON.parse(decodeURIComponent(userDataCookie.value))
      
      // Prevent students from accessing teacher paths
      if (isTeacherPath && userData.role !== 'teacher') {
        return NextResponse.redirect(new URL('/dashboard/student', request.url))
      }

      // Prevent teachers from accessing student paths
      if (isStudentPath && userData.role !== 'student') {
        return NextResponse.redirect(new URL('/dashboard/teacher', request.url))
      }

      // Redirect to role-specific dashboard
      if (pathname === '/dashboard') {
        const dashboardPath = userData.role === 'student' ? '/dashboard/student' : '/dashboard/teacher'
        return NextResponse.redirect(new URL(dashboardPath, request.url))
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
    }
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
