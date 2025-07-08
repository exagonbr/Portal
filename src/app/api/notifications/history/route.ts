import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

// Simulação de banco de dados para histórico de notificações
const notificationsHistory = [
  {
    id: 'notification_1672531200000',
    title: 'Boas-vindas',
    message: 'Olá Maria, bem-vindo ao nosso sistema!',
    type: 'info',
    category: 'email',
    priority: 'medium',
    sender_id: 'admin@example.com',
    sender_name: 'Administrador',
    recipients: ['maria@example.com'],
    recipient_count: 1,
    channels: ['EMAIL'],
    template_id: 'welcome',
    template_data: { name: 'Maria' },
    status: 'sent',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'notification_1672617600000',
    title: 'Redefinição de Senha',
    message: '<h1>Redefinição de Senha</h1><p>Olá Pedro,</p><p>Clique <a href="https://example.com/reset?token=abc123">aqui</a> para redefinir sua senha.</p>',
    type: 'info',
    category: 'email',
    priority: 'high',
    sender_id: 'system@example.com',
    sender_name: 'Sistema',
    recipients: ['pedro@example.com'],
    recipient_count: 1,
    channels: ['EMAIL'],
    template_id: 'password_reset',
    template_data: { name: 'Pedro', resetLink: 'https://example.com/reset?token=abc123' },
    status: 'sent',
    created_at: '2023-01-02T00:00:00.000Z',
    updated_at: '2023-01-02T00:00:00.000Z'
  },
  {
    id: 'notification_1672704000000',
    title: 'Lembrete de Compromisso',
    message: 'Olá Ana, você tem um compromisso marcado para 03/01/2023 às 14:30.',
    type: 'reminder',
    category: 'sms',
    priority: 'medium',
    sender_id: 'calendar@example.com',
    sender_name: 'Calendário',
    recipients: ['+5511987654321'],
    recipient_count: 1,
    channels: ['SMS'],
    template_id: 'appointment_reminder',
    template_data: { name: 'Ana', date: '03/01/2023', time: '14:30' },
    status: 'sent',
    created_at: '2023-01-03T00:00:00.000Z',
    updated_at: '2023-01-03T00:00:00.000Z'
  },
  {
    id: 'notification_1672790400000',
    title: 'Nova Mensagem',
    message: '{"title": "Nova mensagem", "body": "Você recebeu uma nova mensagem de Carlos", "data": {"messageId": "msg_abc123"}}',
    type: 'message',
    category: 'push',
    priority: 'low',
    sender_id: 'messaging@example.com',
    sender_name: 'Sistema de Mensagens',
    recipients: ['device_token_123'],
    recipient_count: 1,
    channels: ['PUSH'],
    template_id: 'new_message',
    template_data: { sender: 'Carlos', messageId: 'msg_abc123' },
    status: 'sent',
    created_at: '2023-01-04T00:00:00.000Z',
    updated_at: '2023-01-04T00:00:00.000Z'
  },
  {
    id: 'notification_1672876800000',
    title: 'Notificação em Massa',
    message: 'Informamos que o sistema estará em manutenção no dia 10/01/2023 das 22:00 às 00:00.',
    type: 'system',
    category: 'all',
    priority: 'high',
    sender_id: 'admin@example.com',
    sender_name: 'Administrador',
    recipients: ['todos@example.com', 'grupo_usuarios@example.com'],
    recipient_count: 150,
    channels: ['EMAIL', 'SMS', 'PUSH'],
    template_id: 'notification',
    template_data: { message: 'Informamos que o sistema estará em manutenção no dia 10/01/2023 das 22:00 às 00:00.' },
    status: 'sent',
    created_at: '2023-01-05T00:00:00.000Z',
    updated_at: '2023-01-05T00:00:00.000Z'
  },
  {
    id: 'notification_1672963200000',
    title: 'Falha no Envio',
    message: 'Esta é uma notificação de teste que falhou.',
    type: 'test',
    category: 'email',
    priority: 'low',
    sender_id: 'test@example.com',
    sender_name: 'Teste',
    recipients: ['invalid@example'],
    recipient_count: 1,
    channels: ['EMAIL'],
    template_id: null,
    template_data: null,
    status: 'failed',
    error: 'Endereço de email inválido',
    created_at: '2023-01-06T00:00:00.000Z',
    updated_at: '2023-01-06T00:00:00.000Z'
  }
];

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        message: 'Não autorizado' 
      }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Obter parâmetros de consulta para filtros e paginação
    const url = new URL(request.url);
    const channel = url.searchParams.get('channel')?.toUpperCase();
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const type = url.searchParams.get('type');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Aplicar filtros
    let filteredHistory = [...notificationsHistory];
    
    if (channel) {
      filteredHistory = filteredHistory.filter(notification => 
        notification.channels.includes(channel)
      );
    }
    
    if (status) {
      filteredHistory = filteredHistory.filter(notification => 
        notification.status === status
      );
    }
    
    if (category) {
      filteredHistory = filteredHistory.filter(notification => 
        notification.category === category
      );
    }
    
    if (type) {
      filteredHistory = filteredHistory.filter(notification => 
        notification.type === type
      );
    }
    
    if (startDate) {
      const start = new Date(startDate).getTime();
      filteredHistory = filteredHistory.filter(notification => 
        new Date(notification.created_at).getTime() >= start
      );
    }
    
    if (endDate) {
      const end = new Date(endDate).getTime();
      filteredHistory = filteredHistory.filter(notification => 
        new Date(notification.created_at).getTime() <= end
      );
    }
    
    // Ordenar por data de criação (mais recente primeiro)
    filteredHistory.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Paginação
    const totalItems = filteredHistory.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginatedHistory = filteredHistory.slice(startIndex, startIndex + limit);

    // Estatísticas
    const stats = {
      total: totalItems,
      sent: filteredHistory.filter(n => n.status === 'sent').length,
      failed: filteredHistory.filter(n => n.status === 'failed').length,
      byChannel: {
        EMAIL: filteredHistory.filter(n => n.channels.includes('EMAIL')).length,
        SMS: filteredHistory.filter(n => n.channels.includes('SMS')).length,
        PUSH: filteredHistory.filter(n => n.channels.includes('PUSH')).length
      }
    };

    return NextResponse.json({
      success: true,
      data: paginatedHistory,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      },
      stats
    }, {
      status: 200,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    
  } catch (error) {
    console.error('❌ [History API] Erro ao buscar histórico:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// Obter detalhes de uma notificação específica
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        message: 'Não autorizado' 
      }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({
        success: false,
        message: 'ID da notificação é obrigatório'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Buscar notificação pelo ID
    const notification = notificationsHistory.find(n => n.id === body.id);
    
    if (!notification) {
      return NextResponse.json({
        success: false,
        message: `Notificação com ID ${body.id} não encontrada`
      }, {
        status: 404,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    return NextResponse.json({
      success: true,
      data: notification
    }, {
      status: 200,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    
  } catch (error) {
    console.error('❌ [History API] Erro ao buscar detalhes da notificação:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
} 