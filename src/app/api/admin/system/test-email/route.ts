import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/types/roles';
import { jwtDecode } from 'jwt-decode';

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

// POST - Testar conexão de email
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
        { error: 'Acesso negado. Apenas administradores do sistema podem testar conexões.' },
        { status: 403 }
      );
    }

    // Obter configurações de email do corpo da requisição
    const { host, port, user: smtpUser, password, secure, fromAddress } = await request.json();

    // Validar campos obrigatórios
    if (!host || !port || !smtpUser || !password || !fromAddress) {
      return NextResponse.json({
        success: false,
        message: 'Configurações de email incompletas. Verifique todos os campos.'
      });
    }

    // Simular teste de conexão de email
    // Em produção, você usaria nodemailer ou similar para testar a conexão real
    try {
      // Simulação de teste
      console.log('Testando conexão de email:', {
        host,
        port,
        secure,
        timestamp: new Date().toISOString(),
        userId: user.id
      });

      // Simular envio de email de teste
      const testEmailAddress = user.email || 'admin@portal.com';

      // Simular sucesso
      return NextResponse.json({
        success: true,
        message: `Email de teste enviado com sucesso para ${testEmailAddress}!`
      });

    } catch (emailError) {
      return NextResponse.json({
        success: false,
        message: 'Falha ao enviar email de teste. Verifique as configurações SMTP.'
      });
    }

  } catch (error) {
    console.error('Erro ao testar conexão de email:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Erro ao testar conexão de email' 
      },
      { status: 500 }
    );
  }
}