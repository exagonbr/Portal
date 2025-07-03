import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Capturar todos os headers
    const headers = Object.fromEntries(req.headers.entries())
    
    // Extrair token do header Authorization
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    // Informações de debug
    const debugInfo = {
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method,
      headers: {
        authorization: authHeader,
        'content-type': req.headers.get('content-type'),
        'user-agent': req.headers.get('user-agent'),
        cookie: req.headers.get('cookie'),
      },
      token: {
        present: !!token,
        length: token?.length || 0,
        preview: token ? token.substring(0, 20) + '...' : null,
        isJWT: token ? token.split('.').length === 3 : false,
      },
      allHeaders: headers
    }
    
    // Tentar decodificar JWT se presente
    if (token && token.split('.').length === 3) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        debugInfo.token = {
          ...debugInfo.token,
          payload: {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            exp: payload.exp,
            isExpired: payload.exp && payload.exp < Math.floor(Date.now() / 1000)
          }
        }
      } catch (error) {
        debugInfo.token = {
          ...debugInfo.token,
          decodeError: 'Erro ao decodificar JWT payload'
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug de autenticação - Frontend',
      debug: debugInfo
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro no debug de autenticação',
        error: error.message 
      },
      { status: 500 }
    )
  }
}