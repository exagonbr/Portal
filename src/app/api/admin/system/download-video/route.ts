import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@/types/roles';
import { jwtDecode } from 'jwt-decode';
import fs from 'fs';
import path from 'path';

// Função auxiliar para verificar autenticação via JWT ou NextAuth
async function getAuthenticatedUser(request: NextRequest) {
  // Primeiro, tentar NextAuth
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return {
      id: (session.user as any).id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as any).role as UserRole,
      permissions: (session.user as any).permissions || []
    };
  }

  // Se não houver sessão NextAuth, verificar token JWT customizado
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwtDecode(token) as any;
      
      // Verificar se o token não expirou
      if (decoded.exp && decoded.exp * 1000 > Date.now()) {
        return {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role as UserRole,
          permissions: decoded.permissions || []
        };
      }
    } catch (error) {
      console.error('Erro ao decodificar token JWT:', error);
    }
  }

  return null;
}

// Função para gerar próximo número sequencial
async function getNextVideoNumber(): Promise<number> {
  const publicDir = path.join(process.cwd(), 'public');
  
  try {
    const files = fs.readdirSync(publicDir);
    const videoFiles = files.filter(file => file.startsWith('back_video') && file.endsWith('.mp4'));
    
    // Extrair números dos arquivos existentes
    const numbers = videoFiles.map(file => {
      const match = file.match(/back_video(\d+)\.mp4/);
      return match ? parseInt(match[1]) : 0;
    });
    
    // Adicionar o arquivo base back_video.mp4 como número 0
    if (files.includes('back_video.mp4')) {
      numbers.push(0);
    }
    
    // Encontrar o próximo número disponível
    let nextNumber = 1;
    while (numbers.includes(nextNumber)) {
      nextNumber++;
    }
    
    return nextNumber;
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return 1;
  }
}

// POST - Fazer download e conversão do vídeo
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se é admin do sistema
    if (user.role !== UserRole.SYSTEM_ADMIN) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores do sistema podem fazer download de vídeos.' },
        { status: 403 }
      );
    }

    // Obter dados do corpo da requisição
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'URL do vídeo é obrigatória' },
        { status: 400 }
      );
    }

    // Validar URL
    try {
      new URL(videoUrl);
    } catch {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      );
    }

    console.log(`Iniciando download do vídeo: ${videoUrl}`);

    // Gerar próximo número sequencial
    const nextNumber = await getNextVideoNumber();
    const filename = `back_video${nextNumber}.mp4`;
    const filePath = path.join(process.cwd(), 'public', filename);

    // Fazer download do vídeo
    const response = await fetch(videoUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao fazer download do vídeo. Verifique se a URL está acessível.' },
        { status: 400 }
      );
    }

    // Verificar se é um arquivo de vídeo válido
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('video/')) {
      return NextResponse.json(
        { error: 'O arquivo não é um vídeo válido' },
        { status: 400 }
      );
    }

    // Salvar o arquivo
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(filePath, buffer);

    console.log(`Vídeo salvo como: ${filename}`);

    // Log da operação
    console.log(`Vídeo baixado por ${user.email}:`, {
      timestamp: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email,
      videoUrl,
      filename,
      fileSize: buffer.length
    });

    // Retornar sucesso
    return NextResponse.json({
      success: true,
      message: 'Vídeo baixado e salvo com sucesso',
      filename: `/${filename}`,
      fileSize: buffer.length
    });

  } catch (error) {
    console.error('Erro ao fazer download do vídeo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao processar o vídeo' },
      { status: 500 }
    );
  }
} 