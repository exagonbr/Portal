import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/types/roles';
import { jwtDecode } from 'jwt-decode';
import { resetPublicSettings } from '../../../../public/settings/route';
import { resetSystemSettings, loadSystemSettings } from '@/lib/systemSettings';

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

// POST - Resetar configurações para o padrão
export async function POST(request: NextRequest) {
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
        { error: 'Acesso negado. Apenas administradores do sistema podem resetar configurações.' },
        { status: 403 }
      );
    }

    // Resetar configurações no banco de dados
    const success = await resetSystemSettings();
    
    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao resetar configurações no banco de dados' },
        { status: 500 }
      );
    }

    // Resetar configurações públicas também
    resetPublicSettings();

    // Carregar configurações resetadas
    const defaultSettings = await loadSystemSettings();

    // Log da operação
    console.log(`Configurações resetadas por ${user.email}:`, {
      timestamp: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email
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