import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/types/roles';
import { jwtDecode } from 'jwt-decode';
import { updatePublicSettings } from '../../../public/settings/route';
import { 
  loadSystemSettings, 
  saveSystemSettings, 
  SystemSettings as ImportedSystemSettings 
} from '@/lib/systemSettings';

// Interface para as configurações do sistema
interface SystemSettings {
  site_name: string;
  site_title: string;
  site_url: string;
  site_description: string;
  maintenance_mode: boolean;
  logo_light: string;
  logo_dark: string;
  background_type: 'video' | 'image' | 'color';
  main_background: string;
  background_video_url: string;
  primary_color: string;
  secondary_color: string;
  aws_access_key: string;
  aws_secret_key: string;
  aws_region: string;
  aws_bucket_main: string;
  aws_bucket_backup: string;
  aws_bucket_media: string;
  email_smtp_host: string;
  email_smtp_port: number;
  email_smtp_user: string;
  email_smtp_password: string;
  email_smtp_secure: boolean;
  email_from_name: string;
  email_from_address: string;
  notifications_email_enabled: boolean;
  notifications_sms_enabled: boolean;
  notifications_push_enabled: boolean;
  notifications_digest_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

// Configurações padrão
const defaultSettings: SystemSettings = {
  site_name: 'Portal Educacional',
  site_title: 'Portal Educacional - Sistema de Gestão',
  site_url: 'http://localhost:3000',
  site_description: 'Sistema completo de gestão educacional.',
  maintenance_mode: false,
  logo_light: '/logo-light.png',
  logo_dark: '/logo-dark.png',
  background_type: 'video',
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
  email_smtp_secure: false,
  email_from_name: '',
  email_from_address: '',
  notifications_email_enabled: false,
  notifications_sms_enabled: false,
  notifications_push_enabled: false,
  notifications_digest_frequency: 'daily',
  background_video_url: ''
};

// Função auxiliar para verificar autenticação via JWT ou NextAuth
async function getAuthenticatedUser(request: NextRequest) {
  // Primeiro, tentar NextAuth
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return {
      id: (session.user as any).id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as any).role as UserRole,
      permissions: (session.user as any).permissions || []
    };
  }

  // Se não houver sessão NextAuth, verificar token JWT customizado
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwtDecode(token) as any;
      
      // Verificar se o token não expirou
      if (decoded.exp && decoded.exp * 1000 > Date.now()) {
        return {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role as UserRole,
          permissions: decoded.permissions || []
        };
      }
    } catch (error) {
      console.error('Erro ao decodificar token JWT:', error);
    }
  }

  return null;
}

// GET - Buscar configurações do sistema
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação (NextAuth ou JWT customizado)
    const user = await getAuthenticatedUser(request);
    
    // Carregar configurações do banco de dados
    const currentSettings = await loadSystemSettings();
    
    if (!user) {
      // Retornar configurações públicas para usuários não autenticados
      const publicSettings = {
        site_name: currentSettings.site_name,
        site_title: currentSettings.site_title,
        site_url: currentSettings.site_url,
        site_description: currentSettings.site_description,
        maintenance_mode: currentSettings.maintenance_mode,
        logo_light: currentSettings.logo_light,
        logo_dark: currentSettings.logo_dark,
        background_type: currentSettings.background_type,
        main_background: currentSettings.main_background,
        background_video_url: currentSettings.background_video_url,
        primary_color: currentSettings.primary_color,
        secondary_color: currentSettings.secondary_color,
      };
      
      return NextResponse.json({
        success: true,
        settings: publicSettings,
        isPublic: true
      });
    }

    // Para usuários autenticados mas não admin, retornar configurações limitadas
    if (user.role !== UserRole.SYSTEM_ADMIN) {
      const limitedSettings = {
        site_name: currentSettings.site_name,
        site_title: currentSettings.site_title,
        site_url: currentSettings.site_url,
        site_description: currentSettings.site_description,
        maintenance_mode: currentSettings.maintenance_mode,
        logo_light: currentSettings.logo_light,
        logo_dark: currentSettings.logo_dark,
        background_type: currentSettings.background_type,
        main_background: currentSettings.main_background,
        background_video_url: currentSettings.background_video_url,
        primary_color: currentSettings.primary_color,
        secondary_color: currentSettings.secondary_color,
        notifications_email_enabled: currentSettings.notifications_email_enabled,
        notifications_sms_enabled: currentSettings.notifications_sms_enabled,
        notifications_push_enabled: currentSettings.notifications_push_enabled,
        notifications_digest_frequency: currentSettings.notifications_digest_frequency
      };
      
      return NextResponse.json({
        success: true,
        settings: limitedSettings,
        isLimited: true
      });
    }

    // Para admin do sistema, retornar todas as configurações
    return NextResponse.json({
      success: true,
      settings: currentSettings,
      isAdmin: true
    });

  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações do sistema' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar configurações do sistema
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação (NextAuth ou JWT customizado)
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se é admin do sistema
    if (user.role !== UserRole.SYSTEM_ADMIN) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores do sistema podem modificar estas configurações.' },
        { status: 403 }
      );
    }

    // Obter dados do corpo da requisição
    const updates = await request.json();

    // Salvar configurações no banco de dados
    try {
      await saveSystemSettings(updates);
    } catch (dbError) {
      console.error('Erro específico do banco de dados:', dbError);
      return NextResponse.json(
        { 
          error: 'Erro ao salvar configurações no banco de dados',
          details: dbError instanceof Error ? dbError.message : 'Erro desconhecido no banco',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Carregar configurações atualizadas
    const currentSettings = await loadSystemSettings();

    // Sincronizar configurações públicas
    const publicUpdates = {
      site_name: currentSettings.site_name,
      site_title: currentSettings.site_title,
      site_url: currentSettings.site_url,
      site_description: currentSettings.site_description,
      maintenance_mode: currentSettings.maintenance_mode,
      logo_light: currentSettings.logo_light,
      logo_dark: currentSettings.logo_dark,
      background_type: currentSettings.background_type,
      main_background: currentSettings.main_background,
      background_video_url: currentSettings.background_video_url,
      primary_color: currentSettings.primary_color,
      secondary_color: currentSettings.secondary_color,
    };
    
    updatePublicSettings(publicUpdates);

    // Log da alteração
    console.log(`Configurações atualizadas por ${user.email}:`, {
      timestamp: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email,
      changes: Object.keys(updates)
    });

    // Retornar sucesso com as configurações atualizadas
    return NextResponse.json({
      success: true,
      message: 'Configurações salvas com sucesso',
      settings: currentSettings
    });

  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao salvar configurações do sistema',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}