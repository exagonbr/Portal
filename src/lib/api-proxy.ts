/**
 * Utilitário para simplificar rotas proxy do frontend para o backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getInternalApiUrl } from '@/config/urls';

export interface ProxyOptions {
  requireAuth?: boolean;
  allowedRoles?: string[];
  skipValidation?: boolean;
}

/**
 * Cria uma rota proxy simples para o backend
 */
export function createProxyRoute(endpoint: string, options: ProxyOptions = {}) {
  const { requireAuth = true, allowedRoles = [], skipValidation = false } = options;

  return {
    async GET(request: NextRequest) {
      return handleProxyRequest(request, 'GET', endpoint, { requireAuth, allowedRoles });
    },

    async POST(request: NextRequest) {
      return handleProxyRequest(request, 'POST', endpoint, { requireAuth, allowedRoles });
    },

    async PUT(request: NextRequest) {
      return handleProxyRequest(request, 'PUT', endpoint, { requireAuth, allowedRoles });
    },

    async DELETE(request: NextRequest) {
      return handleProxyRequest(request, 'DELETE', endpoint, { requireAuth, allowedRoles });
    },

    async PATCH(request: NextRequest) {
      return handleProxyRequest(request, 'PATCH', endpoint, { requireAuth, allowedRoles });
    },
  };
}

/**
 * Manipula requisições proxy
 */
async function handleProxyRequest(
  request: NextRequest,
  method: string,
  endpoint: string,
  options: { requireAuth: boolean; allowedRoles: string[] }
) {
  try {
    // Verificação de autenticação
    if (options.requireAuth) {
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
      }

      // Verificação de roles se especificado
      if (options.allowedRoles.length > 0) {
        const userRole = session.user?.role;
        if (!userRole || !options.allowedRoles.includes(userRole)) {
          return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
        }
      }
    }

    // Constrói URL do backend
    const { searchParams } = new URL(request.url);
    const backendUrl = `${getInternalApiUrl(endpoint)}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    // Prepara headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Adiciona token de autenticação se disponível
    if (options.requireAuth) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        headers.Authorization = `Bearer ${session.user.id}`;
      }
    }

    // Prepara body para métodos que suportam
    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const requestBody = await request.json();
        body = JSON.stringify(requestBody);
      } catch {
        // Ignora erro se não houver body
      }
    }

    // Faz a requisição para o backend
    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
    });

    // Parse da resposta
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    // Retorna resposta com o mesmo status do backend
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Utilitário para fazer requisições diretas ao backend (server-side)
 */
export async function backendRequest<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
    params?: Record<string, string | number | boolean>;
    headers?: Record<string, string>;
    token?: string;
  } = {}
): Promise<{ data: T; status: number; success: boolean }> {
  const {
    method = 'GET',
    body,
    params,
    headers: customHeaders = {},
    token
  } = options;

  try {
    // Constrói URL
    const baseUrl = getInternalApiUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${baseUrl}${cleanEndpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Prepara headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Faz a requisição
    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Parse da resposta
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    return {
      data,
      status: response.status,
      success: response.ok,
    };

  } catch (error) {
    throw error;
  }
}

/**
 * Middleware para validação de schema (opcional)
 */
export function withValidation<T>(
  schema: { parse: (data: any) => T },
  handler: (data: T, request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);
      return handler(validatedData, request);
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error instanceof Error ? error.message : 'Erro de validação'
        },
        { status: 400 }
      );
    }
  };
} 