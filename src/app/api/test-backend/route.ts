import { NextRequest, NextResponse } from 'next/server';
import { getInternalApiUrl } from '@/config/env';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [TEST-BACKEND] Testando comunicação com o backend');
    
    // Testar URL do backend
    const backendUrl = getInternalApiUrl('/health');
    console.log('🔗 [TEST-BACKEND] URL do backend:', backendUrl);

    // Fazer requisição simples para o health check
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('✅ [TEST-BACKEND] Resposta recebida:', response.status);

    const data = await response.json();
    console.log('📦 [TEST-BACKEND] Dados:', data);

    return NextResponse.json({
      success: true,
      message: 'Comunicação com backend funcionando',
      backendUrl,
      backendResponse: data,
      status: response.status
    });
  } catch (error) {
    console.error('❌ [TEST-BACKEND] Erro:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro na comunicação com backend',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      backendUrl: getInternalApiUrl('/health')
    }, { status: 500 });
  }
} 