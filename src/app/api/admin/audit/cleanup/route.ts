import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiPost } from '@/services/apiService';

export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// POST: Limpar logs antigos do sistema
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Extrair parâmetros do corpo da requisição
    const body = await req.json();
    const { daysToKeep } = body;

    if (!daysToKeep || daysToKeep < 7) {
      return NextResponse.json(
        { error: 'É necessário manter pelo menos 7 dias de logs' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Fazer a chamada para o backend
    const response = await apiPost('/admin/audit-logs/cleanup', { daysToKeep });

    // Retornar os resultados
    return NextResponse.json(response, {
      headers: getCorsHeaders()
    });
  } catch (error) {
    console.error('Erro ao limpar logs antigos:', error);
    return NextResponse.json(
      { error: 'Erro ao limpar logs antigos' },
      { status: 500, headers: getCorsHeaders() }
    );
  }
} 