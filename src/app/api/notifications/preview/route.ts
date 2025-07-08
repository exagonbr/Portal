import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        message: 'Não autorizado' 
      }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    const body = await request.json()
    console.log('🔍 [Preview API] Dados recebidos:', body)

    // Validar dados obrigatórios
    if (!body.content) {
      return NextResponse.json({
        success: false,
        message: 'Conteúdo do template é obrigatório'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Extrair variáveis do template
    const variables = extractVariables(body.content)
    
    // Criar dados de exemplo para as variáveis não fornecidas
    const templateData = body.templateData || {}
    const sampleData = generateSampleData(variables, templateData)
    
    // Aplicar dados ao template
    const preview = applyTemplateData(body.content, sampleData)

    // Verificar se é HTML
    const isHtml = body.isHtml || body.content.includes('<') && body.content.includes('>')

    return NextResponse.json({
      success: true,
      data: {
        preview,
        isHtml,
        variables,
        sampleData
      }
    }, {
      status: 200,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('❌ [Preview API] Erro ao gerar preview:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// Função para extrair variáveis de um template
function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{([^}]+)\}\}/g) || []
  return Array.from(new Set(
    matches.map(match => match.replace(/\{\{|\}\}/g, '').trim())
  ))
}

// Função para aplicar dados a um template
function applyTemplateData(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    return data[key] !== undefined ? data[key] : `{{${key}}}`
  })
}

// Função para gerar dados de exemplo para as variáveis
function generateSampleData(variables: string[], providedData: Record<string, any>): Record<string, any> {
  const sampleData: Record<string, any> = { ...providedData }
  
  // Exemplos comuns para variáveis específicas
  const commonExamples: Record<string, any> = {
    name: 'João Silva',
    email: 'joao.silva@exemplo.com',
    phone: '+5511987654321',
    message: 'Esta é uma mensagem de exemplo para visualização.',
    title: 'Título de Exemplo',
    subject: 'Assunto de Exemplo',
    date: new Date().toLocaleDateString('pt-BR'),
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    resetLink: 'https://exemplo.com/reset-password?token=abc123',
    verificationCode: '123456',
    companyName: 'Empresa Exemplo',
    amount: 'R$ 100,00',
    orderId: '12345',
    sender: 'Sistema de Notificações',
    messageId: 'msg_' + Math.random().toString(36).substring(2, 10)
  }
  
  // Preencher dados de exemplo para variáveis que não foram fornecidas
  for (const variable of variables) {
    if (sampleData[variable] === undefined) {
      if (commonExamples[variable] !== undefined) {
        sampleData[variable] = commonExamples[variable]
      } else if (variable.includes('link') || variable.includes('url')) {
        sampleData[variable] = `https://exemplo.com/${variable.replace('link', '').replace('url', '')}`
      } else if (variable.includes('id')) {
        sampleData[variable] = Math.floor(Math.random() * 10000).toString()
      } else if (variable.includes('date')) {
        sampleData[variable] = new Date().toLocaleDateString('pt-BR')
      } else if (variable.includes('time')) {
        sampleData[variable] = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      } else if (variable.includes('code')) {
        sampleData[variable] = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
      } else {
        sampleData[variable] = `[Exemplo de ${variable}]`
      }
    }
  }
  
  return sampleData
} 