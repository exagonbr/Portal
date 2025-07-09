import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiGet, apiPost } from '@/services/apiService';

export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// GET: Buscar logs do sistema com filtros e paginação
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Extrair parâmetros da query
    const searchParams = req.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const activityType = searchParams.get('activity_type');
    const severity = searchParams.get('severity');
    const search = searchParams.get('search');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Construir parâmetros para a API
    const params: Record<string, string> = {
      page,
      limit
    };

    if (activityType && activityType !== 'all') params.activity_type = activityType;
    if (severity && severity !== 'all') params.severity = severity;
    if (search) params.search = search;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (sortOrder) params.sort_order = sortOrder;

    // Fazer a chamada para o backend
    const response = await apiGet('/admin/audit-logs', params);

    // Retornar os resultados
    return NextResponse.json(response, {
      headers: getCorsHeaders()
    });
  } catch (error) {
    console.error('Erro ao buscar logs do sistema:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar logs do sistema' },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}

// POST: Obter estatísticas dos logs
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Extrair parâmetros do corpo da requisição
    const body = await req.json();
    const { startDate, endDate } = body;

    // Construir parâmetros para a API
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    // Fazer a chamada para o backend
    const response = await apiPost('/admin/audit-logs/stats', params);

    // Retornar os resultados
    return NextResponse.json(response, {
      headers: getCorsHeaders()
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas dos logs:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas dos logs' },
      { status: 500, headers: getCorsHeaders() }
    );
  }
} 
