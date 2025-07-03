import { NextRequest, NextResponse } from 'next/server';
import { requireRole, AuthSession } from '@/middleware/auth';

/**
 * Obter configurações gerais do sistema
 * GET /api/settings/general
 */
export async function GET(request: NextRequest) {
  return requireRole(['SYSTEM_ADMIN', 'ADMIN'])(async (req: NextRequest, auth: AuthSession) => {
    try {
      // Simular configurações gerais
      const generalSettings = {
        application: {
          name: 'Portal Sabercon',
          description: 'Sistema de gestão educacional',
          version: '1.0.0',
          logo: '/images/logo.png',
          favicon: '/images/favicon.ico',
          timezone: 'America/Sao_Paulo',
          language: 'pt-BR',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h'
        },
        features: {
          userRegistration: true,
          emailVerification: true,
          twoFactorAuth: false,
          socialLogin: false,
          guestAccess: false,
          maintenanceMode: false,
          debugMode: process.env.NODE_ENV === 'development'
        },
        limits: {
          maxFileSize: 50, // MB
          maxUsers: 10000,
          maxCoursesPerUser: 50,
          sessionTimeout: 60, // minutos
          passwordMinLength: 8,
          maxLoginAttempts: 5
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          inAppEnabled: true,
          digestFrequency: 'daily'
        },
        security: {
          passwordComplexity: true,
          forcePasswordChange: false,
          sessionSecurity: 'standard',
          ipWhitelist: [],
          allowedDomains: ['sabercon.edu.br'],
          corsOrigins: ['http://localhost:3000', 'https://portal.sabercon.com.br']
        },
        backup: {
          enabled: true,
          frequency: 'daily',
          retention: 30, // dias
          location: 's3://portal-backups/',
          lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
        }
      };

      return NextResponse.json({
        success: true,
        message: 'Configurações gerais obtidas com sucesso',
        data: generalSettings
      });

    } catch (error) {
      console.error('Erro ao obter configurações gerais:', error);
      return NextResponse.json({
        success: false,
        message: 'Erro interno do servidor'
      }, { status: 500 });
    }
  })(request);
}

/**
 * Atualizar configurações gerais
 * PUT /api/settings/general
 */
export async function PUT(request: NextRequest) {
  return requireRole(['SYSTEM_ADMIN'])(async (req: NextRequest, auth: AuthSession) => {
    try {
      const body = await req.json();
      const { section, settings } = body;

      if (!section || !settings) {
        return NextResponse.json({
          success: false,
          message: 'Seção e configurações são obrigatórias'
        }, { status: 400 });
      }

      // Validar seções permitidas
      const allowedSections = ['application', 'features', 'limits', 'notifications', 'security', 'backup'];
      if (!allowedSections.includes(section)) {
        return NextResponse.json({
          success: false,
          message: 'Seção de configuração inválida'
        }, { status: 400 });
      }

      // Simular atualização das configurações
      const updatedSettings = {
        section,
        settings,
        updatedBy: auth.user.id,
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        message: 'Configurações atualizadas com sucesso',
        data: updatedSettings
      });

    } catch (error) {
      console.error('Erro ao atualizar configurações gerais:', error);
      return NextResponse.json({
        success: false,
        message: 'Erro interno do servidor'
      }, { status: 500 });
    }
  })(request);
}

/**
 * OPTIONS para CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
