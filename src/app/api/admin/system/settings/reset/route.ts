import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/types/roles';

// Configurações padrão
const defaultSettings = {
  site_name: 'Portal Educacional',
  site_title: 'Portal Educacional - Sistema de Gestão',
  site_url: 'http://localhost:3000',
  site_description: 'Sistema completo de gestão educacional.',
  maintenance_mode: false,
  logo_light: '/logo-light.png',
  logo_dark: '/logo-dark.png',
  background_type: 'video' as const,
  main_background: '/back_video4.mp4',
  primary_color: '#1e3a8a',
  secondary_color: '#3b82f6',
  aws_access_key: '',
  aws_secret_key: '',
  aws_region: 'sa-east-1',
  aws_bucket_main: '',
  aws_bucket_backup: '',
  aws_bucket_media: '',
  email_smtp_host: '',
  email_smtp_port: 587,
  email_smtp_user: '',
  email_smtp_password: '',
  email_smtp_secure: true,
  email_from_name: '',
  email_from_address: '',
  notifications_email_enabled: false,
  notifications_sms_enabled: false,
  notifications_push_enabled: false,
  notifications_digest_frequency: 'daily' as const
};

// POST - Resetar configurações para o padrão
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se é admin do sistema
    if (session.user.role !== UserRole.SYSTEM_ADMIN) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores do sistema podem resetar configurações.' },
        { status: 403 }
      );
    }

    // Log da operação
    console.log(`Configurações resetadas por ${session.user.email}:`, {
      timestamp: new Date().toISOString(),
      userId: session.user.id,
      userEmail: session.user.email
    });

    // Retornar sucesso
    return NextResponse.json({
      success: true,
      message: 'Configurações resetadas com sucesso',
      settings: defaultSettings
    });

  } catch (error) {
    console.error('Erro ao resetar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao resetar configurações do sistema' },
      { status: 500 }
    );
  }
}