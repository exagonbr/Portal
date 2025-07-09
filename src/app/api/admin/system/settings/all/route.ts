import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/types/roles';
import { jwtDecode } from 'jwt-decode';
import { getSafeConnection } from '@/lib/database-safe';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar token JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let user;
    
    try {
      user = jwtDecode(token) as { id: string; email: string; role: string };
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar permissão (apenas admin do sistema)
    if (user.role !== UserRole.SYSTEM_ADMIN) {
      return NextResponse.json(
        { error: 'Permissão negada' },
        { status: 403 }
      );
    }

    // Buscar todas as configurações do sistema
    const connection = await getSafeConnection();
    const settings = await connection('system_settings').select('*');

    // Mascarar valores sensíveis
    const safeSettings = settings.map(setting => {
      if (setting.is_encrypted && setting.value) {
        return {
          ...setting,
          value: '••••••••••••••••' // Mascarar valor
        };
      }
      return setting;
    });
    
    return NextResponse.json({
      success: true,
      settings: safeSettings
    });

  } catch (error) {
    console.error('Erro ao buscar configurações do sistema:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações do sistema' },
      { status: 500 }
    );
  }
} 