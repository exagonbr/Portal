import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString();
    
    return NextResponse.json({
      status: 'ok',
      message: 'API está funcionando',
      timestamp,
      path: request.nextUrl.pathname,
      method: 'GET'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erro na rota health-check:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    return NextResponse.json({
      status: 'ok',
      message: 'Health check POST funcionando',
      timestamp: new Date().toISOString(),
      receivedData: body
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erro na rota health-check POST:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 
