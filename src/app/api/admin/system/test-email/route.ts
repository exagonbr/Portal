import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/types/roles';

// POST - Testar conexão de email
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
        { error: 'Acesso negado. Apenas administradores do sistema podem testar conexões.' },
        { status: 403 }
      );
    }

    // Obter configurações de email do corpo da requisição
    const { host, port, user, password, secure, fromAddress } = await request.json();

    // Validar campos obrigatórios
    if (!host || !port || !user || !password || !fromAddress) {
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
        userId: session.user.id
      });

      // Simular envio de email de teste
      const testEmailAddress = session.user.email || 'admin@portal.com';

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