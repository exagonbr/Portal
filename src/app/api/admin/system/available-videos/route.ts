import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET - Listar todos os vídeos disponíveis na pasta public
export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    
    // Verificar se o diretório existe
    if (!fs.existsSync(publicDir)) {
      return NextResponse.json(
        { error: 'Diretório public não encontrado' },
        { status: 404 }
      );
    }
    
    // Ler todos os arquivos do diretório
    const files = fs.readdirSync(publicDir);
    
    // Filtrar apenas arquivos MP4
    const videoFiles = files
      .filter(file => file.toLowerCase().endsWith('.mp4'))
      .map(file => `/${file}`); // Adicionar barra no início para formar URL relativa
    
    // Ordenar os vídeos para que back_video.mp4 e back_videoN.mp4 apareçam em ordem
    videoFiles.sort((a, b) => {
      // Verificar se é um arquivo back_video com número
      const aMatch = a.match(/\/back_video(\d*)\.mp4/i);
      const bMatch = b.match(/\/back_video(\d*)\.mp4/i);
      
      // Se ambos são back_video, ordenar por número
      if (aMatch && bMatch) {
        const aNum = aMatch[1] ? parseInt(aMatch[1]) : 0;
        const bNum = bMatch[1] ? parseInt(bMatch[1]) : 0;
        return aNum - bNum;
      }
      
      // Se apenas um é back_video, colocá-lo primeiro
      if (aMatch) return -1;
      if (bMatch) return 1;
      
      // Caso contrário, ordenação alfabética
      return a.localeCompare(b);
    });
    
    return NextResponse.json({
      success: true,
      videos: videoFiles
    });
    
  } catch (error) {
    console.error('Erro ao listar vídeos disponíveis:', error);
    return NextResponse.json(
      { error: 'Erro interno ao listar vídeos disponíveis' },
      { status: 500 }
    );
  }
} 