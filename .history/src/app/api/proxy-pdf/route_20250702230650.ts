import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';

/**
 * Proxy para servir PDFs com autenticação
 * GET /api/proxy-pdf?url=<pdf_url>
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.headers.get('x-auth-token') ||
                  request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token de autenticação necessário'
      }, { status: 401 });
    }

    // Validar token
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Token inválido ou expirado'
      }, { status: 401 });
    }

    // Obter URL do PDF
    const { searchParams } = new URL(request.url);
    const pdfUrl = searchParams.get('url');
    
    if (!pdfUrl) {
      return NextResponse.json({
        success: false,
        message: 'URL do PDF é obrigatória'
      }, { status: 400 });
    }

    // Validar se é uma URL válida
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(pdfUrl);
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'URL do PDF inválida'
      }, { status: 400 });
    }

    // Verificar se é um domínio permitido (segurança)
    const allowedDomains = [
      'localhost',
      '127.0.0.1',
      'storage.googleapis.com',
      's3.amazonaws.com',
      'cdn.sabercon.edu.br',
      'files.sabercon.edu.br'
    ];

    const isAllowedDomain = allowedDomains.some(domain => 
      validatedUrl.hostname === domain || 
      validatedUrl.hostname.endsWith(`.${domain}`)
    );

    if (!isAllowedDomain) {
      return NextResponse.json({
        success: false,
        message: 'Domínio não autorizado para proxy de PDF'
      }, { status: 403 });
    }

    // Fazer requisição para o PDF
    const pdfResponse = await fetch(pdfUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Portal-PDF-Proxy/1.0',
        'Accept': 'application/pdf,*/*'
      }
    });

    if (!pdfResponse.ok) {
      return NextResponse.json({
        success: false,
        message: `Erro ao buscar PDF: ${pdfResponse.status} ${pdfResponse.statusText}`
      }, { status: pdfResponse.status });
    }

    // Verificar se é realmente um PDF
    const contentType = pdfResponse.headers.get('content-type');
    if (contentType && !contentType.includes('application/pdf')) {
      return NextResponse.json({
        success: false,
        message: 'O arquivo não é um PDF válido'
      }, { status: 400 });
    }

    // Obter o conteúdo do PDF
    const pdfBuffer = await pdfResponse.arrayBuffer();
    
    // Registrar acesso (opcional)
    console.log(`PDF acessado por usuário ${user.userId}: ${pdfUrl}`);

    // Retornar o PDF com headers apropriados
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'private, max-age=3600',
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN'
      }
    });

  } catch (error) {
    console.error('Erro no proxy de PDF:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

/**
 * POST para upload de PDF via proxy (se necessário)
 * POST /api/proxy-pdf
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.headers.get('x-auth-token') ||
                  request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token de autenticação necessário'
      }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Token inválido ou expirado'
      }, { status: 401 });
    }

    // Verificar se o usuário tem permissão para upload
    if (!['ADMIN', 'TEACHER', 'COORDINATOR'].includes(user.role)) {
      return NextResponse.json({
        success: false,
        message: 'Permissão insuficiente para upload de PDF'
      }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'Arquivo PDF é obrigatório'
      }, { status: 400 });
    }

    // Verificar se é um PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json({
        success: false,
        message: 'Apenas arquivos PDF são permitidos'
      }, { status: 400 });
    }

    // Verificar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: 'Arquivo muito grande. Máximo permitido: 10MB'
      }, { status: 400 });
    }

    // TODO: Implementar upload para storage (S3, Google Cloud, etc.)
    // Por enquanto, apenas simular o upload
    const fileName = `${Date.now()}-${file.name}`;
    const uploadUrl = `https://files.sabercon.edu.br/pdfs/${fileName}`;

    return NextResponse.json({
      success: true,
      message: 'PDF enviado com sucesso',
      data: {
        fileName,
        originalName: file.name,
        size: file.size,
        uploadUrl,
        proxyUrl: `/api/proxy-pdf?url=${encodeURIComponent(uploadUrl)}`
      }
    });

  } catch (error) {
    console.error('Erro no upload de PDF:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Auth-Token'
    }
  });
}
