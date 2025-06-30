import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

// Função para criar headers CORS
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

// Função para resposta OPTIONS
function createCorsOptionsResponse(origin?: string) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin)
  })
}

const RECENT_ACTIVITIES = [
  { id: 1, type: 'system', message: 'Sistema reiniciado para manutenção', timestamp: '2024-03-20 10:30:00', severity: 'info' },
  { id: 2, type: 'security', message: 'Tentativa de acesso não autorizado bloqueada', timestamp: '2024-03-20 09:15:00', severity: 'warning' },
  { id: 3, type: 'backup', message: 'Backup automático concluído com sucesso', timestamp: '2024-03-20 02:00:00', severity: 'success' },
  { id: 4, type: 'update', message: 'Atualização de segurança aplicada', timestamp: '2024-03-19 18:45:00', severity: 'info' },
  { id: 5, type: 'error', message: 'Erro temporário no serviço de email', timestamp: '2024-03-19 14:20:00', severity: 'error' }
]

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  // Em um cenário real, isso viria de um sistema de logs ou banco de dados
  return NextResponse.json(RECENT_ACTIVITIES, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
}
