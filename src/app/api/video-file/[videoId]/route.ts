import { NextRequest, NextResponse } from 'next/server';
import { prepareAuthHeaders } from '../../lib/auth-headers';
import { createCorsOptionsResponse } from '@/config/cors';
import { getInternalApiUrl } from '@/config/env';

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log(`🔍 [VIDEO-FILE-API] Buscando dados do arquivo para vídeo ID: ${resolvedParams.videoId}`);
    
    const response = await fetch(getInternalApiUrl(`/video-file/${resolvedParams.videoId}`), {
      method: 'GET',
      headers: prepareAuthHeaders(request),
    });

    const data = await response.json();
    
    console.log(`📦 [VIDEO-FILE-API] Resposta do backend:`, {
      success: data.success,
      hasData: !!data.data
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ [VIDEO-FILE-API] Erro ao buscar dados do arquivo:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 