import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {
      success: true,
      message: 'API de configurações públicas ativa',
      methods: ['GET', 'OPTIONS'],
      timestamp: new Date().toISOString()
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 [SETTINGS] Buscando configurações públicas');

    // Configurações públicas padrão (sem necessidade de autenticação)
    const publicSettings = {
      success: true,
      data: {
        general: {
          site_name: 'Portal Sabercon',
          site_title: 'Portal Educacional Sabercon',
          site_url: 'https://portal.sabercon.com.br',
          site_description: 'Sistema completo de gestão educacional',
          maintenance_mode: false,
          version: '2.0.0',
          support_email: 'suporte@sabercon.edu.br'
        },
        appearance: {
          logo_light: '/logo-light.png',
          logo_dark: '/logo-dark.png',
          favicon: '/favicon.ico',
          background_type: 'video',
          main_background: '/back_video.mp4',
          primary_color: '#1e3a8a',
          secondary_color: '#3b82f6',
          accent_color: '#10b981',
          theme: 'system' // auto, light, dark
        },
        features: {
          registration_enabled: true,
          password_reset_enabled: true,
          social_login_enabled: false,
          two_factor_enabled: false,
          notifications_enabled: true
        },
        limits: {
          max_file_size: 50 * 1024 * 1024, // 50MB
          max_video_duration: 3600, // 1 hora
          session_timeout: 15 * 60 // 15 minutos
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        cached: false,
        source: 'default'
      }
    };

    console.log('✅ [SETTINGS] Configurações públicas retornadas com sucesso');

    return NextResponse.json(publicSettings, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=300', // Cache por 5 minutos
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ [SETTINGS] Erro ao buscar configurações públicas:', error);
    
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
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}
