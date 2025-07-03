import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Interface para templates de email
interface EmailTemplateDTO {
  id?: number;
  name: string;
  subject: string;
  html: string;
  text?: string;
  category?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Funções CORS (copiadas do arquivo principal)
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

// Mock data temporário para desenvolvimento
let mockTemplates: EmailTemplateDTO[] = [
  {
    id: 1,
    name: 'welcome',
    subject: 'Bem-vindo ao Portal Sabercon!',
    category: 'system',
    is_active: true,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Bem-vindo ao Portal Sabercon!</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151;">Olá <strong>{{name}}</strong>,</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Seja bem-vindo ao Portal Sabercon! Sua conta foi criada com sucesso.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{loginUrl}}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Acessar Portal
            </a>
          </div>
        </div>
      </div>`,
    text: 'Bem-vindo ao Portal Sabercon! Olá {{name}}, sua conta foi criada com sucesso.',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    name: 'notification',
    subject: '{{subject}}',
    category: 'notification',
    is_active: true,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📢 {{title}}</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151;">Olá <strong>{{name}}</strong>,</p>
          <div style="font-size: 16px; color: #374151; line-height: 1.6; margin: 20px 0;">
            {{message}}
          </div>
        </div>
      </div>`,
    text: '{{title}} - Olá {{name}}, {{message}}',
    created_at: new Date(),
    updated_at: new Date()
  }
];

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin)
  });
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] Buscando templates de email...');
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Verificar permissões - apenas usuários que podem enviar notificações
    const userRole = session.user?.role;
    const canManageTemplates = ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'SCHOOL_MANAGER', 'TEACHER'].includes(userRole);
    
    if (!canManageTemplates) {
      return NextResponse.json({ error: 'Sem permissão para gerenciar templates' }, { 
        status: 403,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }
    
    // Extrair parâmetros de query
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const is_active = searchParams.get('is_active');
    
    let filteredTemplates = [...mockTemplates];
    
    // Aplicar filtros
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }
    
    if (is_active !== null) {
      const activeFilter = is_active === 'true';
      filteredTemplates = filteredTemplates.filter(t => t.is_active === activeFilter);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.subject.toLowerCase().includes(searchLower)
      );
    }
    
    console.log(`✅ [API] Retornando ${filteredTemplates.length} templates`);
    return NextResponse.json({
      success: true,
      data: filteredTemplates,
      count: filteredTemplates.length
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error: any) {
    console.error('❌ [API] Erro ao buscar templates:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erro interno do servidor'
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [API] Criando novo template de email...');
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Verificar permissões
    const userRole = session.user?.role;
    const canManageTemplates = ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'SCHOOL_MANAGER', 'TEACHER'].includes(userRole);
    
    if (!canManageTemplates) {
      return NextResponse.json({ error: 'Sem permissão para gerenciar templates' }, { 
        status: 403,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }
    
    const body: EmailTemplateDTO = await request.json();
    
    // Validações básicas
    if (!body.name || !body.subject || !body.html) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nome, assunto e HTML são obrigatórios'
        },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Verificar se já existe template com mesmo nome
    const existing = mockTemplates.find(t => t.name === body.name);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Já existe um template com o nome '${body.name}'`
        },
        { 
          status: 409,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Criar novo template
    const newTemplate: EmailTemplateDTO = {
      id: Math.max(...mockTemplates.map(t => t.id || 0)) + 1,
      name: body.name,
      subject: body.subject,
      html: body.html,
      text: body.text || '',
      category: body.category || 'general',
      is_active: body.is_active !== undefined ? body.is_active : true,
      created_at: new Date(),
      updated_at: new Date()
    };

    mockTemplates.push(newTemplate);
    
    console.log(`✅ [API] Template criado: ${newTemplate.name}`);
    return NextResponse.json(
      {
        success: true,
        data: newTemplate,
        message: 'Template criado com sucesso'
      },
      { 
        status: 201,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  } catch (error: any) {
    console.error('❌ [API] Erro ao criar template:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erro interno do servidor'
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}
