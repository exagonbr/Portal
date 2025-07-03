export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'

/**
 * Este endpoint atua como um proxy para carregar PDFs de fontes externas,
 * evitando problemas de CORS ao carregar PDFs de outros domínios.
 * 
 * Query parameters:
 * - url: URL do PDF a ser carregado
 */
export async function GET(request: NextRequest) {
  try {
    // Extrair a URL do PDF dos parâmetros de consulta
    const url = request.nextUrl.searchParams.get('url')
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL não fornecida. Use ?url=endereco-do-pdf' },
        { status: 400 }
      )
    }
    
    // Verificar se a URL é válida
    try {
      new URL(url)
    } catch (e) {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      )
    }
    
    // Verificar se é uma URL do Cloudfront ou Sabercon
    let finalUrl = url
    
    if (url.includes('lib.sabercon.com.br') && url.includes('#/pdf/')) {
      // Extrair o ID do PDF da URL do Sabercon
      const pdfId = url.split('/pdf/')[1].split('?')[0]
      finalUrl = `https://d1hxtyafwtqtm4.cloudfront.net/upload/${pdfId}`
    }
    
    console.log(`Proxy PDF: Carregando de ${finalUrl}`)
    
    // Fazer a requisição para o PDF
    const response = await fetch(finalUrl, {
      headers: {
        'Accept': 'application/pdf',
        'User-Agent': 'PDF Proxy/1.0'
      }
    })
    
    // Verificar se a resposta é válida
    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro ao carregar PDF: ${response.statusText}` },
        { status: response.status }
      )
    }
    
    // Obter o conteúdo do PDF como array buffer
    const pdfBuffer = await response.arrayBuffer()
    
    // Retornar o PDF com os headers apropriados
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="document.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Erro no proxy PDF:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar o PDF' },
      { status: 500 }
    )
  }
} 