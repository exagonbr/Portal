import { Router, Request, Response } from 'express';
import db from '../config/database';

const router = Router();

// GET /api/video-file/:videoId
router.get('/:videoId', async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'ID do vídeo é obrigatório'
      });
    }

    console.log(`🔍 Buscando dados do arquivo para vídeo ID: ${videoId}`);

    // Query para buscar dados do arquivo através das tabelas relacionadas
    // video -> video_file -> file
    const fileData = await db('video')
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
      return res.status(404).json({
        success: false,
        message: 'Arquivo do vídeo não encontrado'
      });
    }

    if (!fileData.sha256hex || !fileData.extension) {
      console.warn(`⚠️ Dados do arquivo incompletos para vídeo ID: ${videoId}`, fileData);
      return res.status(404).json({
        success: false,
        message: 'Dados do arquivo incompletos'
      });
    }

    console.log(`✅ Dados do arquivo encontrados para vídeo ID: ${videoId}`, {
      sha256hex: fileData.sha256hex,
      extension: fileData.extension,
      file_name: fileData.file_name,
      video_title: fileData.video_title
    });

    return res.json({
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
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados do arquivo do vídeo:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router; 