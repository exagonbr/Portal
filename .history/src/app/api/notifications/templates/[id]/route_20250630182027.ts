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

// Funções CORS
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

// Mock data - em produção, isso viria do banco de dados
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 [API] Buscando template ${params.id}...`);
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Verificar permissões
    const userRole = session.user?.role;
    const canManageTemplates = ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER', 'TEACHER'].includes(userRole);
    
    if (!canManageTemplates) {
      return NextResponse.json({ error: 'Sem permissão para gerenciar templates' }, { 
        status: 403,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const templateId = parseInt(params.id);
    const template = mockTemplates.find(t => t.id === templateId);
    
    if (!template) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Template não encontrado' 
        }, 
        { 
          status: 404,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }
    
    console.log(`✅ [API] Template encontrado: ${template.name}`);
    return NextResponse.json({
      success: true,
      data: template
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error: any) {
    console.error(`❌ [API] Erro ao buscar template ${params.id}:`, error);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 [API] Atualizando template ${params.id}...`);
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Verificar permissões
    const userRole = session.user?.role;
    const canManageTemplates = ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER', 'TEACHER'].includes(userRole);
    
    if (!canManageTemplates) {
      return NextResponse.json({ error: 'Sem permissão para gerenciar templates' }, { 
        status: 403,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const templateId = parseInt(params.id);
    const templateIndex = mockTemplates.findIndex(t => t.id === templateId);
    
    if (templateIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Template não encontrado' 
        }, 
        { 
          status: 404,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    const body: Partial<EmailTemplateDTO> = await request.json();
    
    // Se está mudando o nome, verificar se não conflita
    if (body.name && body.name !== mockTemplates[templateIndex].name) {
      const nameExists = mockTemplates.find(t => t.name === body.name && t.id !== templateId);
      if (nameExists) {
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
    }

    // Atualizar template
    const updatedTemplate = {
      ...mockTemplates[templateIndex],
      ...body,
      id: templateId, // Garantir que o ID não mude
      updated_at: new Date()
    };

    mockTemplates[templateIndex] = updatedTemplate;
    
    console.log(`✅ [API] Template atualizado: ${updatedTemplate.name}`);
    return NextResponse.json({
      success: true,
      data: updatedTemplate,
      message: 'Template atualizado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error: any) {
    console.error(`❌ [API] Erro ao atualizar template ${params.id}:`, error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 [API] Excluindo template ${params.id}...`);
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Verificar permissões
    const userRole = session.user?.role;
    const canManageTemplates = ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER', 'TEACHER'].includes(userRole);
    
    if (!canManageTemplates) {
      return NextResponse.json({ error: 'Sem permissão para gerenciar templates' }, { 
        status: 403,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const templateId = parseInt(params.id);
    const templateIndex = mockTemplates.findIndex(t => t.id === templateId);
    
    if (templateIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Template não encontrado' 
        }, 
        { 
          status: 404,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    const deletedTemplate = mockTemplates[templateIndex];
    mockTemplates.splice(templateIndex, 1);
    
    console.log(`✅ [API] Template excluído: ${deletedTemplate.name}`);
    return NextResponse.json({
      success: true,
      data: deletedTemplate,
      message: 'Template excluído com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error: any) {
    console.error(`❌ [API] Erro ao excluir template ${params.id}:`, error);
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
