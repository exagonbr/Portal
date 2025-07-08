import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCorsOptionsResponse, getCorsHeaders as corsHeaders } from '@/config/cors'

// Interface para templates de email
interface EmailTemplateDTO {
  id?: number;
  name: string;
  subject: string;
  html?: string;
  text?: string;
  category?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Mock data para desenvolvimento
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
  },
  {
    id: 3,
    name: 'reminder',
    subject: 'Lembrete: {{title}}',
    category: 'reminder',
    is_active: true,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Lembrete</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151;">Olá <strong>{{name}}</strong>,</p>
          <div style="font-size: 16px; color: #374151; line-height: 1.6; margin: 20px 0;">
            <p>Este é um lembrete para:</p>
            <h2 style="color: #f59e0b; margin: 10px 0;">{{title}}</h2>
            <p>{{message}}</p>
          </div>
        </div>
      </div>`,
    text: 'Lembrete: {{title}} - Olá {{name}}, {{message}}',
    created_at: new Date(),
    updated_at: new Date()
  }
];

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  return createCorsOptionsResponse(origin);
}

// Obter um template específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const origin = request.headers.get('origin') || '';
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        message: 'Não autorizado' 
      }, { 
        status: 401,
        headers: corsHeaders(origin)
      });
    }

    const id = parseInt(params.id);
    const template = mockTemplates.find(t => t.id === id);
    
    if (!template) {
      return NextResponse.json({
        success: false,
        message: 'Template não encontrado'
      }, {
        status: 404,
        headers: corsHeaders(origin)
      });
    }

    return NextResponse.json({
      success: true,
      template
    }, {
      status: 200,
      headers: corsHeaders(origin)
    });
  } catch (error) {
    console.error('Erro ao obter template:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: corsHeaders(request.headers.get('origin') || '')
    });
  }
}

// Atualizar um template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const origin = request.headers.get('origin') || '';
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        message: 'Não autorizado' 
      }, { 
        status: 401,
        headers: corsHeaders(origin)
      });
    }

    const id = parseInt(params.id);
    const templateIndex = mockTemplates.findIndex(t => t.id === id);
    
    if (templateIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'Template não encontrado'
      }, {
        status: 404,
        headers: corsHeaders(origin)
      });
    }

    const body = await request.json();

    // Validação básica
    if (!body.name || !body.subject) {
      return NextResponse.json({
        success: false,
        message: 'Nome e assunto são obrigatórios'
      }, {
        status: 400,
        headers: corsHeaders(origin)
      });
    }

    // Atualizar template
    const updatedTemplate: EmailTemplateDTO = {
      ...mockTemplates[templateIndex],
      name: body.name,
      subject: body.subject,
      html: body.html || mockTemplates[templateIndex].html,
      text: body.message || body.text || mockTemplates[templateIndex].text,
      category: body.category || mockTemplates[templateIndex].category,
      is_active: body.is_active !== undefined ? body.is_active : mockTemplates[templateIndex].is_active,
      updated_at: new Date()
    };

    mockTemplates[templateIndex] = updatedTemplate;

    return NextResponse.json({
      success: true,
      message: 'Template atualizado com sucesso',
      template: updatedTemplate
    }, {
      status: 200,
      headers: corsHeaders(origin)
    });
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: corsHeaders(request.headers.get('origin') || '')
    });
  }
}

// Excluir um template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const origin = request.headers.get('origin') || '';
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        message: 'Não autorizado' 
      }, { 
        status: 401,
        headers: corsHeaders(origin)
      });
    }

    const id = parseInt(params.id);
    const templateIndex = mockTemplates.findIndex(t => t.id === id);
    
    if (templateIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'Template não encontrado'
      }, {
        status: 404,
        headers: corsHeaders(origin)
      });
    }

    // Remover template
    mockTemplates.splice(templateIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Template excluído com sucesso'
    }, {
      status: 200,
      headers: corsHeaders(origin)
    });
  } catch (error) {
    console.error('Erro ao excluir template:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: corsHeaders(request.headers.get('origin') || '')
    });
  }
}
