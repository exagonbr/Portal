import { NextRequest, NextResponse } from 'next/server';
import knex from '@/config/database';

// Funções CORS
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

function createCorsOptionsResponse(origin?: string) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin)
  })
}



// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = params;

    if (!videoId) {
      return NextResponse.json({
        success: false,
        message: 'ID do vídeo é obrigatório'
      }, { status: 400 });
    }

    console.log(`🔍 Buscando dados do arquivo para vídeo ID: ${videoId}`);

    // Query para buscar dados do arquivo através das tabelas relacionadas
    // video -> video_file -> file
    const fileData = await knex('video')
      .select(
        'file.sha256hex',
        'file.extension',
        'file.name as file_name',
        'file.content_type as mimetype',
        'file.size',
        'video.title as video_title',
        'video.id as video_id'
      )
      .leftJoin('video_file', 'video.id', 'video_file.video_files_id')
      .leftJoin('file', 'video_file.file_id', 'file.id')
      .where('video.id', videoId)
      .first();

    if (!fileData) {
      console.warn(`⚠️ Nenhum arquivo encontrado para vídeo ID: ${videoId}`);
      return NextResponse.json({
        success: false,
        message: 'Arquivo do vídeo não encontrado'
      }, { status: 404 });
    }

    if (!fileData.sha256hex || !fileData.extension) {
      console.warn(`⚠️ Dados do arquivo incompletos para vídeo ID: ${videoId}`, fileData);
      return NextResponse.json({
        success: false,
        message: 'Dados do arquivo incompletos'
      }, { status: 404 });
    }

    console.log(`✅ Dados do arquivo encontrados para vídeo ID: ${videoId}`, {
      sha256hex: fileData.sha256hex,
      extension: fileData.extension,
      file_name: fileData.file_name,
      video_title: fileData.video_title
    });

    return NextResponse.json({
      success: true,
      data: {
        sha256hex: fileData.sha256hex,
        extension: fileData.extension,
        file_name: fileData.file_name,
        mimetype: fileData.mimetype,
        size: fileData.size,
        video_title: fileData.video_title,
        video_id: fileData.video_id
      },
      message: 'Dados do arquivo encontrados com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados do arquivo do vídeo:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 