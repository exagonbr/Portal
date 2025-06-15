import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/config/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Tentar fazer requisição para o backend
    let data;
    let response;
    
    try {
      response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(10000), // 10 segundos timeout
      });

      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend retornou resposta não-JSON');
      }

      data = await response.json();
    } catch (backendError) {
      console.error('Erro ao conectar com backend:', backendError);
      
      // Fallback: Autenticação local para desenvolvimento/teste
      const mockUsers = {
        'admin@sabercon.edu.br': {
          password: 'password123',
          user: {
            id: 'admin',
            name: 'Administrador',
            email: 'admin@sabercon.edu.br',
            role: 'SYSTEM_ADMIN',
            permissions: ['all'],
            institutionId: 'inst_sabercon'
          }
        },
        'gestor@sabercon.edu.br': {
          password: 'password123',
          user: {
            id: 'gestor',
            name: 'Gestor Institucional',
            email: 'gestor@sabercon.edu.br',
            role: 'INSTITUTION_ADMIN',
            permissions: ['manage_institution'],
            institutionId: 'inst_sabercon'
          }
        },
        'coordenador@sabercon.edu.br': {
          password: 'password123',
          user: {
            id: 'coordenador',
            name: 'Coordenador Acadêmico',
            email: 'coordenador@sabercon.edu.br',
            role: 'ACADEMIC_COORDINATOR',
            permissions: ['manage_courses'],
            institutionId: 'inst_sabercon'
          }
        },
        'professor@sabercon.edu.br': {
          password: 'password123',
          user: {
            id: 'professor',
            name: 'Professor',
            email: 'professor@sabercon.edu.br',
            role: 'TEACHER',
            permissions: ['manage_classes'],
            institutionId: 'inst_sabercon'
          }
        },
        'estudante@sabercon.edu.br': {
          password: 'password123',
          user: {
            id: 'estudante',
            name: 'Estudante',
            email: 'estudante@sabercon.edu.br',
            role: 'STUDENT',
            permissions: ['view_content'],
            institutionId: 'inst_sabercon'
          }
        }
      };

      const mockUser = mockUsers[email as keyof typeof mockUsers];
      
      if (mockUser && mockUser.password === password) {
        // Gerar token mock JWT-like
        const mockToken = Buffer.from(JSON.stringify({
          userId: mockUser.user.id,
          email: mockUser.user.email,
          name: mockUser.user.name,
          role: mockUser.user.role,
          institutionId: mockUser.user.institutionId,
          permissions: mockUser.user.permissions,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
        })).toString('base64');

        data = {
          success: true,
          token: mockToken,
          user: mockUser.user,
          message: 'Login realizado com sucesso (modo fallback - backend indisponível)'
        };
        response = { ok: true, status: 200 };
      } else {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Erro de conexão com o servidor. Tente novamente em alguns instantes.',
            details: backendError instanceof Error ? backendError.message : 'Erro desconhecido'
          },
          { status: 503 }
        );
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Erro ao fazer login' },
        { status: response.status }
      );
    }

    // Configurar cookies com os tokens recebidos do backend
    const cookieStore = cookies();
    
    // Token de acesso - configurado para ser acessível pelo middleware
    cookieStore.set('auth_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });

    // Token de refresh
    if (data.refreshToken) {
      cookieStore.set('refresh_token', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: '/',
      });
    }

    // ID da sessão
    if (data.sessionId) {
      cookieStore.set('session_id', data.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/',
      });
    }

    // Dados do usuário (não sensíveis)
    const userData = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      permissions: data.user.permissions || [],
    };

    // Cookie não httpOnly para acesso pelo cliente JavaScript
    cookieStore.set('user_data', JSON.stringify(userData), {
      httpOnly: false, // Permitir acesso via JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userData,
      redirectTo: data.redirectTo || '/dashboard'
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}