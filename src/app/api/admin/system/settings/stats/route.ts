import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/types/roles';
import { jwtDecode } from 'jwt-decode';
import { getSafeConnection } from '@/lib/database-safe';
import { SystemSettingsStats } from '@/services/systemSettingsService';

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

    // Calcular estatísticas
    const stats: SystemSettingsStats = {
      totalCount: settings.length,
      categoryCounts: {},
      publicCount: 0,
      privateCount: 0,
      encryptedCount: 0
    };

    // Processar cada configuração para gerar estatísticas
    settings.forEach(setting => {
      // Contar por categoria
      const category = setting.category || 'general';
      if (!stats.categoryCounts[category]) {
        stats.categoryCounts[category] = 0;
      }
      stats.categoryCounts[category]++;

      // Contar públicas vs privadas
      if (setting.is_public) {
        stats.publicCount++;
      } else {
        stats.privateCount++;
      }

      // Contar criptografadas
      if (setting.is_encrypted) {
        stats.encryptedCount++;
      }
    });
    
    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas de configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas de configurações' },
      { status: 500 }
    );
  }
} 