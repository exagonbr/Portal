import { NextRequest, NextResponse } from 'next/server';

/**
 * Este endpoint atua como um proxy para carregar PDFs de fontes externas,
 * evitando problemas de CORS
 * GET /api/proxy-pdf
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pdfUrl = url.searchParams.get('url');
    
    if (!pdfUrl) {
      return NextResponse.json(
        { success: false, message: 'URL do PDF é obrigatória' },
        { status: 400 }
      );
    }

    // Validar se é uma URL válida
    try {
      new URL(pdfUrl);
    } catch {
      return NextResponse.json(
        { success: false, message: 'URL inválida fornecida' },
        { status: 400 }
      );
    }

    // Fazer a requisição para o PDF
    const response = await fetch(pdfUrl, {
      headers: {
        'User-Agent': 'Portal-Sabercon-PDF-Proxy/1.0'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Erro ao carregar PDF da fonte externa' },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/pdf')) {
      return NextResponse.json(
        { success: false, message: 'O recurso solicitado não é um PDF válido' },
        { status: 400 }
      );
    }

    // Obter o buffer do PDF
    const pdfBuffer = await response.arrayBuffer();

    // Retornar o PDF com headers apropriados
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Erro no proxy PDF:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
