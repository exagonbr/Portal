import { NextRequest, NextResponse } from 'next/server'
import { getAuthentication } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test Auth endpoint called');
    console.log('Headers:', Object.fromEntries(request.headers));
    console.log('Cookies:', Object.fromEntries(request.cookies));
    
    const session = await getAuthentication(request)
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json(
        { 
          success: false, 
          message: 'No authentication found',
          debug: {
            hasAuthHeader: !!request.headers.get('authorization'),
            hasCookies: request.cookies.size > 0,
            endpoint: 'nextjs-api'
          }
        },
        { status: 401 }
      )
    }

    console.log('✅ Session found:', session.user);
    
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: session.user,
      debug: {
        endpoint: 'nextjs-api',
        sessionType: session.user.id === 'admin' ? 'fallback' : 'jwt'
      }
    })

  } catch (error) {
    console.error('❌ Test auth error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        debug: {
          endpoint: 'nextjs-api'
        }
      },
      { status: 500 }
    )
  }
} 