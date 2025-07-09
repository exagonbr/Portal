import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function OPTIONS() {
  return createCorsOptionsResponse();
}

// GET: Exportar logs do sistema para CSV/Excel
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Extrair parâmetros da query
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
    const activityType = searchParams.get('activity_type');
    const severity = searchParams.get('severity');
    const search = searchParams.get('search');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Construir URL para o backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const exportUrl = new URL(`${backendUrl}/api/admin/audit-logs/export`);
    
    // Adicionar parâmetros
    if (format) exportUrl.searchParams.append('format', format);
    if (activityType && activityType !== 'all') exportUrl.searchParams.append('activity_type', activityType);
    if (severity && severity !== 'all') exportUrl.searchParams.append('severity', severity);
    if (search) exportUrl.searchParams.append('search', search);
    if (startDate) exportUrl.searchParams.append('start_date', startDate);
    if (endDate) exportUrl.searchParams.append('end_date', endDate);

    // Redirecionar para o endpoint de exportação do backend
    return NextResponse.redirect(exportUrl);
  } catch (error) {
    console.error('Erro ao exportar logs do sistema:', error);
    return NextResponse.json(
      { error: 'Erro ao exportar logs do sistema' },
      { status: 500, headers: getCorsHeaders() }
    );
  }
} 