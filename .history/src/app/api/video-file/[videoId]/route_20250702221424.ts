import { NextRequest, NextResponse } from 'next/server';

// Simulação de dados de vídeos (em produção, viria do banco de dados)
const MOCK_VIDEO_FILES = {
  '1': {
    sha256hex: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    extension: 'mp4',
    file_name: 'introducao-javascript.mp4',
    mimetype: 'video/mp4',
    size: 52428800, // 50MB
    video_title: 'Introdução ao JavaScript',
    video_id: '1'
  },
  '2': {
    sha256hex: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567',
    extension: 'mp4',
    file_name: 'react-fundamentos.mp4',
    mimetype: 'video/mp4',
    size: 73400320, // 70MB
    video_title: 'Fundamentos do React',
    video_id: '2'
  },
  '3': {
    sha256hex: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
    extension: 'mp4',
    file_name: 'python-data-science.mp4',
    mimetype: 'video/mp4',
    size: 94371840, // 90MB
    video_title: 'Python para Data Science',
    video_id: '3'
  }
};

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {
      success: true,
      message: 'API de arquivos de vídeo ativa',
      methods: ['GET', 'OPTIONS'],
      timestamp: new Date().toISOString()
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    if (!videoId) {
      return NextResponse.json({
        success: false,
        message: 'ID do vídeo é obrigatório',
        code: 'MISSING_VIDEO_ID'
      }, { status: 400 });
    }

    console.log(`🔍 [VIDEO-FILE] Buscando dados do arquivo para vídeo ID: ${videoId}`);

    // Buscar dados do arquivo no mock
    const fileData = MOCK_VIDEO_FILES[videoId as keyof typeof MOCK_VIDEO_FILES];

    if (!fileData) {
      console.warn(`⚠️ [VIDEO-FILE] Nenhum arquivo encontrado para vídeo ID: ${videoId}`);
      return NextResponse.json({
        success: false,
        message: 'Arquivo do vídeo não encontrado',
        code: 'VIDEO_FILE_NOT_FOUND'
      }, { status: 404 });
    }

    console.log(`✅ [VIDEO-FILE] Dados do arquivo encontrados para vídeo ID: ${videoId}`, {
      sha256hex: fileData.sha256hex.substring(0, 16) + '...',
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
        video_id: fileData.video_id,
        url: `/api/video-stream/${fileData.sha256hex}.${fileData.extension}`,
        thumbnail: `/api/video-thumbnail/${videoId}.jpg`
      },
      message: 'Dados do arquivo encontrados com sucesso',
      meta: {
        timestamp: new Date().toISOString(),
        size_formatted: `${Math.round(fileData.size / 1024 / 1024)}MB`
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache por 1 hora
      }
    });

  } catch (error) {
    console.error('❌ [VIDEO-FILE] Erro ao buscar dados do arquivo do vídeo:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}