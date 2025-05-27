import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Role-specific paths
const studentPaths = ['/dashboard/student']
const teacherPaths = ['/dashboard/teacher']
const adminPaths = ['/dashboard/admin']

// General protected paths
const protectedPaths = [
  '/dashboard',
  '/courses',
  '/lessons',
  '/live',
  '/chat',
  '/profile',
  '/portal' // Adding portal paths to protected routes
]

// Auth paths that should not be accessible when authenticated
const authPaths = [
  '/login',
  '/register'
]

// Paths that bypass authentication
const publicPaths = [
  '/test-reader',
  '/books' // Allow access to test files
]

// Função para validar sessão via Redis
async function validateRedisSession(sessionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sessions/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.valid;
    }
    return false;
  } catch (error) {
    console.error('Erro ao validar sessão Redis:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')
  const sessionId = request.cookies.get('session_id')
  const userDataCookie = request.cookies.get('user_data')
  const { pathname } = request.nextUrl

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check path types
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))
  const isStudentPath = studentPaths.some(path => pathname.startsWith(path))
  const isTeacherPath = teacherPaths.some(path => pathname.startsWith(path))
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path))

  // Validação de sessão Redis para rotas protegidas
  if (isProtectedPath) {
    let isAuthenticated = false;

    // Primeiro verifica se há token tradicional
    if (token) {
      isAuthenticated = true;
    }

    // Se há sessionId, valida via Redis
    if (sessionId && !isAuthenticated) {
      isAuthenticated = await validateRedisSession(sessionId.value);
      
      // Se a sessão Redis é inválida, limpa os cookies
      if (!isAuthenticated) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('session_id');
        response.cookies.delete('auth_token');
        response.cookies.delete('user_data');
        return response;
      }
    }

    // Se não está autenticado, redireciona para login
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // If authenticated and trying to access auth pages
  if (isAuthPath && (token || sessionId)) {
    return NextResponse.redirect(new URL('/portal/videos', request.url))
  }

  // Role-based access control
  if (userDataCookie) {
    try {
      const userData = JSON.parse(decodeURIComponent(userDataCookie.value))
      
      // Prevent students from accessing teacher paths
      if (isTeacherPath && userData.role !== 'teacher') {
        return NextResponse.redirect(new URL('/portal/videos', request.url))
      }

      // Prevent teachers from accessing student paths
      if (isStudentPath && userData.role !== 'student') {
        return NextResponse.redirect(new URL('/portal/videos', request.url))
      }

      // Redirect to portal/videos instead of role-specific dashboard
      if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/portal/videos', request.url))
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
    }
  }

  // Adiciona headers de sessão para rastreamento
  const response = NextResponse.next();
  
  if (sessionId) {
    response.headers.set('X-Session-ID', sessionId.value);
  }
  
  response.headers.set('X-Request-Path', pathname);
  response.headers.set('X-Request-Time', new Date().toISOString());

  return response;
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
