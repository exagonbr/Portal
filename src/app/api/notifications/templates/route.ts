import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

// Simulação de banco de dados para templates
const templatesDB = {
  'welcome': {
    id: 'welcome',
    name: 'Boas-vindas',
    content: 'Olá {{name}}, bem-vindo ao nosso sistema!',
    description: 'Template para mensagem de boas-vindas',
    isHtml: false,
    channel: 'EMAIL',
    variables: ['name'],
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z'
  },
  'password_reset': {
    id: 'password_reset',
    name: 'Redefinição de Senha',
    content: '<h1>Redefinição de Senha</h1><p>Olá {{name}},</p><p>Clique <a href="{{resetLink}}">aqui</a> para redefinir sua senha.</p>',
    description: 'Template para redefinição de senha',
    isHtml: true,
    channel: 'EMAIL',
    variables: ['name', 'resetLink'],
    created_at: '2023-01-02T00:00:00.000Z',
    updated_at: '2023-01-02T00:00:00.000Z'
  },
  'notification': {
    id: 'notification',
    name: 'Notificação Geral',
    content: '{{message}}',
    description: 'Template genérico para notificações',
    isHtml: false,
    channel: 'ALL',
    variables: ['message'],
    created_at: '2023-01-03T00:00:00.000Z',
    updated_at: '2023-01-03T00:00:00.000Z'
  },
  'appointment_reminder': {
    id: 'appointment_reminder',
    name: 'Lembrete de Compromisso',
    content: 'Olá {{name}}, você tem um compromisso marcado para {{date}} às {{time}}.',
    description: 'Template para lembrete de compromissos',
    isHtml: false,
    channel: 'SMS',
    variables: ['name', 'date', 'time'],
    created_at: '2023-01-04T00:00:00.000Z',
    updated_at: '2023-01-04T00:00:00.000Z'
  },
  'new_message': {
    id: 'new_message',
    name: 'Nova Mensagem',
    content: '{"title": "Nova mensagem", "body": "Você recebeu uma nova mensagem de {{sender}}", "data": {"messageId": "{{messageId}}"}}',
    description: 'Template para notificação de nova mensagem',
    isHtml: false,
    channel: 'PUSH',
    variables: ['sender', 'messageId'],
    created_at: '2023-01-05T00:00:00.000Z',
    updated_at: '2023-01-05T00:00:00.000Z'
  }
};

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

// Listar todos os templates ou filtrar por canal
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

    // Obter parâmetros de consulta
    const url = new URL(request.url);
    const channel = url.searchParams.get('channel')?.toUpperCase();
    
    // Filtrar templates pelo canal, se especificado
    const templates = Object.values(templatesDB).filter(template => 
      !channel || template.channel === channel || template.channel === 'ALL'
    );

    return NextResponse.json({
      success: true,
      data: templates
    }, {
      status: 200,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    
  } catch (error) {
    console.error('❌ [Templates API] Erro ao listar templates:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// Obter um template específico por ID
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
    console.log('📑 [Templates API] Buscando template por ID:', body.id);
    
    if (!body.id) {
      return NextResponse.json({
        success: false,
        message: 'ID do template é obrigatório'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // @ts-ignore - Simulação
    const template = templatesDB[body.id];
    
    if (!template) {
      return NextResponse.json({
        success: false,
        message: `Template com ID ${body.id} não encontrado`
      }, {
        status: 404,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    return NextResponse.json({
      success: true,
      data: template
    }, {
      status: 200,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    
  } catch (error) {
    console.error('❌ [Templates API] Erro ao buscar template:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// Criar um novo template
export async function PUT(request: NextRequest) {
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
    console.log('📑 [Templates API] Criando novo template:', body);
    
    // Validar dados obrigatórios
    if (!body.id || !body.name || !body.content) {
      return NextResponse.json({
        success: false,
        message: 'ID, nome e conteúdo são obrigatórios'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Verificar se o ID já existe
    // @ts-ignore - Simulação
    if (templatesDB[body.id]) {
      return NextResponse.json({
        success: false,
        message: `Template com ID ${body.id} já existe`
      }, {
        status: 409,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Extrair variáveis do template
    const variables = extractVariables(body.content);

    // Criar novo template
    const newTemplate = {
      id: body.id,
      name: body.name,
      content: body.content,
      description: body.description || '',
      isHtml: body.isHtml || false,
      channel: body.channel?.toUpperCase() || 'ALL',
      variables,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Aqui você salvaria no banco de dados
    // @ts-ignore - Simulação
    templatesDB[body.id] = newTemplate;

    return NextResponse.json({
      success: true,
      message: 'Template criado com sucesso',
      data: newTemplate
    }, {
      status: 201,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    
  } catch (error) {
    console.error('❌ [Templates API] Erro ao criar template:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// Atualizar um template existente
export async function PATCH(request: NextRequest) {
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
    console.log('📑 [Templates API] Atualizando template:', body);
    
    if (!body.id) {
      return NextResponse.json({
        success: false,
        message: 'ID do template é obrigatório'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // @ts-ignore - Simulação
    const existingTemplate = templatesDB[body.id];
    
    if (!existingTemplate) {
      return NextResponse.json({
        success: false,
        message: `Template com ID ${body.id} não encontrado`
      }, {
        status: 404,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Extrair variáveis se o conteúdo foi atualizado
    const variables = body.content 
      ? extractVariables(body.content) 
      : existingTemplate.variables;

    // Atualizar template
    const updatedTemplate = {
      ...existingTemplate,
      name: body.name || existingTemplate.name,
      content: body.content || existingTemplate.content,
      description: body.description !== undefined ? body.description : existingTemplate.description,
      isHtml: body.isHtml !== undefined ? body.isHtml : existingTemplate.isHtml,
      channel: body.channel ? body.channel.toUpperCase() : existingTemplate.channel,
      variables,
      updated_at: new Date().toISOString()
    };

    // Aqui você atualizaria no banco de dados
    // @ts-ignore - Simulação
    templatesDB[body.id] = updatedTemplate;

    return NextResponse.json({
      success: true,
      message: 'Template atualizado com sucesso',
      data: updatedTemplate
    }, {
      status: 200,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    
  } catch (error) {
    console.error('❌ [Templates API] Erro ao atualizar template:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// Excluir um template
export async function DELETE(request: NextRequest) {
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

    // Obter ID do template da URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID do template é obrigatório'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // @ts-ignore - Simulação
    const template = templatesDB[id];
    
    if (!template) {
      return NextResponse.json({
        success: false,
        message: `Template com ID ${id} não encontrado`
      }, {
        status: 404,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Aqui você excluiria do banco de dados
    // @ts-ignore - Simulação
    delete templatesDB[id];

    return NextResponse.json({
      success: true,
      message: 'Template excluído com sucesso'
    }, {
      status: 200,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    
  } catch (error) {
    console.error('❌ [Templates API] Erro ao excluir template:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// Função auxiliar para extrair variáveis de um template
function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
  return Array.from(new Set(
    matches.map(match => match.replace(/\{\{|\}\}/g, '').trim())
  ));
}
