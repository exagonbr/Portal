import { NextRequest, NextResponse } from 'next/server';
import { getInternalApiUrl } from '@/config/env';
import { getCorsHeaders, createCorsOptionsResponse } from '@/config/cors';

export const dynamic = 'force-dynamic';


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    // Tentar buscar configurações do backend
    try {
      const backendUrl = getInternalApiUrl('/settings/public');
      const backendResponse = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // Timeout de 5 segundos
        signal: AbortSignal.timeout(5000)
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return NextResponse.json(data, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
      } else {
        console.warn(`Backend retornou status ${backendResponse.status}, usando fallback`);
      }
    } catch (backendError) {
      console.warn('Erro ao conectar com backend, usando configurações padrão:', backendError);
    }

    // Fallback com configurações padrão
    const defaultSettings = {
      success: true,
      fallback: true,
      data: {
        general: {
          site_name: 'Portal Sabercon',
          site_title: 'Portal Educacional Sabercon',
          site_url: 'https://portal.sabercon.com.br',
          site_description: 'Sistema completo de gestão educacional',
          maintenance_mode: false
        },
        appearance: {
          logo_light: '/logo-light.png',
          logo_dark: '/logo-dark.png',
          background_type: 'video',
          main_background: '/back_video.mp4',
          primary_color: '#1e3a8a',
          secondary_color: '#3b82f6'
        }
      }
    };

    return NextResponse.json(defaultSettings, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('Erro ao buscar configurações públicas:', error);
    
    // Fallback de emergência
    return NextResponse.json({
      success: true,
      fallback: true,
      error: 'Usando configurações de emergência',
      data: {
        general: {
          site_name: 'Portal Educacional',
          site_title: 'Portal Educacional',
          site_url: 'https://portal.educacional.com',
          maintenance_mode: false
        },
        appearance: {
          background_type: 'color',
          main_background: '#1e3a8a',
          primary_color: '#1e3a8a',
          secondary_color: '#3b82f6'
        }
      }
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
} 
