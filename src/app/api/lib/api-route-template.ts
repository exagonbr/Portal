import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { prepareAuthHeaders } from './auth-headers';
import { getInternalApiUrl } from '@/config/env';

/**
 * Template para padronização de rotas da API
 * Este arquivo serve como base para implementar novas rotas ou refatorar rotas existentes
 * 
 * @example
 * // Como usar este template:
 * import { createStandardApiRoute } from '@/app/api/lib/api-route-template';
 * 
 * export const GET = createStandardApiRoute({
 *   endpoint: '/api/minha-rota',
 *   fallbackFunction: async (req) => {
 *     // Implementação do fallback
 *     return NextResponse.json({ ... });
 *   }
 * });
 */

export interface StandardApiRouteOptions {
  // Endpoint da API backend (ex: '/api/users')
  endpoint: string;
  
  // Função de fallback para quando a API falha
  fallbackFunction?: (req: NextRequest, params?: any) => Promise<NextResponse>;
  
  // Nome para identificação nos logs
  name?: string;
  
  // Se true, não tenta autenticação e usa acesso público
  publicAccess?: boolean;
  
  // Transformação de dados antes de retornar (opcional)
  transformResponse?: (data: any) => any;
}

/**
 * Cria um handler padrão para rotas GET da API
 */
export function createStandardApiRoute(options: StandardApiRouteOptions) {
  const {
    endpoint,
    fallbackFunction,
    name = endpoint.replace('/api/', ''),
    publicAccess = false,
    transformResponse
  } = options;

  // Handler para requisições OPTIONS (preflight)
  async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get('origin') || undefined;
    return createCorsOptionsResponse(origin);
  }

  // Handler para requisições GET
  async function GET(req: NextRequest, context?: any) {
    try {
      const url = new URL(req.url);
      const searchParams = url.searchParams;
      
      console.log(`🔍 [API-${name.toUpperCase()}] Requisição com params:`, Object.fromEntries(searchParams.entries()));
      
      // Preparar headers de autenticação
      const headers = await prepareAuthHeaders(req);
      
      // Verificar se há um token válido de autenticação (se não for rota pública)
      let hasValidAuthToken = false;
      if (!publicAccess) {
        const authHeader = headers.Authorization;
        hasValidAuthToken = authHeader && 
                          authHeader.startsWith('Bearer ') && 
                          authHeader.length > 'Bearer '.length &&
                          authHeader !== 'Bearer ';
        
        console.log(`🔐 [API-${name.toUpperCase()}] Status de autenticação:`, { 
          hasValidAuthToken, 
          headerLength: headers.Authorization ? headers.Authorization.length : 0 
        });
      }
      
      // Construir URL do backend
      const backendUrl = new URL(endpoint, getInternalApiUrl());
      searchParams.forEach((value, key) => {
        backendUrl.searchParams.append(key, value);
      });
      
      // Adicionar parâmetros de contexto à URL se existirem
      if (context?.params) {
        for (const [key, value] of Object.entries(context.params)) {
          if (!endpoint.includes(`[${key}]`)) {
            backendUrl.pathname = backendUrl.pathname.replace(`[${key}]`, value as string);
          }
        }
      }
      
      console.log(`🔗 [API-${name.toUpperCase()}] URL do backend:`, backendUrl.toString());

      try {
        // Fazer requisição para o backend
        const response = await fetch(backendUrl.toString(), {
          method: 'GET',
          headers: headers,
        });
        
        console.log(`📡 [API-${name.toUpperCase()}] Resposta do backend:`, { 
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type')
        });
        
        if (!response.ok) {
          console.error(`❌ [API-${name.toUpperCase()}] Erro na resposta do backend:`, response.status);
          
          // Fallback para dados locais em caso de falha na API
          if (fallbackFunction) {
            console.log(`🔄 [API-${name.toUpperCase()}] Usando fallback local`);
            return fallbackFunction(req, context?.params);
          }
          
          return NextResponse.json(
            { 
              success: false, 
              message: `Erro ao buscar ${name}`,
              status: response.status
            },
            { 
              status: response.status,
              headers: getCorsHeaders(req.headers.get('origin') || undefined)
            }
          );
        }
        
        // Verificar se a resposta é JSON
        const contentType = response.headers.get('content-type');
        
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`❌ [API-${name.toUpperCase()}] Resposta não é JSON:`, contentType);
          
          if (fallbackFunction) {
            return fallbackFunction(req, context?.params);
          }
          
          return NextResponse.json(
            { 
              success: false, 
              message: 'Resposta do backend não é JSON válido'
            },
            { 
              status: 500,
              headers: getCorsHeaders(req.headers.get('origin') || undefined)
            }
          );
        }
        
        const data = await response.json();
        
        // Aplicar transformação se necessário
        const responseData = transformResponse ? transformResponse(data) : data;
        
        console.log(`✅ [API-${name.toUpperCase()}] Dados recebidos do backend:`, { 
          hasData: !!responseData,
          itemsCount: Array.isArray(responseData?.items) ? responseData.items.length : 'N/A'
        });

        return NextResponse.json(responseData, { 
          status: response.status,
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        });
        
      } catch (fetchError) {
        console.error(`❌ [API-${name.toUpperCase()}] Erro ao conectar com backend:`, fetchError);
        
        if (fallbackFunction) {
          return fallbackFunction(req, context?.params);
        }
        
        return NextResponse.json(
          { 
            success: false, 
            message: `Erro ao conectar com o servidor backend para ${name}`,
            error: String(fetchError)
          },
          { 
            status: 503,
            headers: getCorsHeaders(req.headers.get('origin') || undefined)
          }
        );
      }
    } catch (err: any) {
      console.error(`❌ [API-${name.toUpperCase()}] Erro interno:`, err);
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro interno do servidor',
          error: String(err)
        },
        { 
          status: 500,
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        }
      );
    }
  }

  // Retornar o handler GET e OPTIONS
  return { GET, OPTIONS };
}

/**
 * Cria um handler padrão para rotas POST da API
 */
export function createStandardPostRoute(options: StandardApiRouteOptions) {
  const {
    endpoint,
    fallbackFunction,
    name = endpoint.replace('/api/', ''),
    publicAccess = false,
    transformResponse
  } = options;

  // Handler para requisições OPTIONS (preflight)
  async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get('origin') || undefined;
    return createCorsOptionsResponse(origin);
  }

  // Handler para requisições POST
  async function POST(req: NextRequest, context?: any) {
    try {
      // Obter o corpo da requisição
      const body = await req.json();
      
      console.log(`🔍 [API-${name.toUpperCase()}] POST com dados:`, { 
        hasBody: !!body,
        bodyKeys: body ? Object.keys(body) : [] 
      });
      
      // Preparar headers de autenticação
      const headers = await prepareAuthHeaders(req);
      
      // Verificar se há um token válido de autenticação (se não for rota pública)
      if (!publicAccess) {
        const authHeader = headers.Authorization;
        const hasValidAuthToken = authHeader && 
                                authHeader.startsWith('Bearer ') && 
                                authHeader.length > 'Bearer '.length &&
                                authHeader !== 'Bearer ';
        
        console.log(`🔐 [API-${name.toUpperCase()}] Status de autenticação:`, { 
          hasValidAuthToken, 
          headerLength: headers.Authorization ? headers.Authorization.length : 0 
        });
      }
      
      // Construir URL do backend
      let backendUrl = new URL(endpoint, getInternalApiUrl()).toString();
      
      // Adicionar parâmetros de contexto à URL se existirem
      if (context?.params) {
        for (const [key, value] of Object.entries(context.params)) {
          backendUrl = backendUrl.replace(`[${key}]`, value as string);
        }
      }
      
      console.log(`🔗 [API-${name.toUpperCase()}] URL do backend:`, backendUrl);

      try {
        // Fazer requisição para o backend
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
        
        console.log(`📡 [API-${name.toUpperCase()}] Resposta do backend:`, { 
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type')
        });
        
        if (!response.ok) {
          console.error(`❌ [API-${name.toUpperCase()}] Erro na resposta do backend:`, response.status);
          
          // Fallback para dados locais em caso de falha na API
          if (fallbackFunction) {
            console.log(`🔄 [API-${name.toUpperCase()}] Usando fallback local`);
            return fallbackFunction(req, context?.params);
          }
          
          // Tentar obter mensagem de erro do backend
          try {
            const errorData = await response.json();
            return NextResponse.json(
              errorData,
              { 
                status: response.status,
                headers: getCorsHeaders(req.headers.get('origin') || undefined)
              }
            );
          } catch {
            return NextResponse.json(
              { 
                success: false, 
                message: `Erro ao processar ${name}`,
                status: response.status
              },
              { 
                status: response.status,
                headers: getCorsHeaders(req.headers.get('origin') || undefined)
              }
            );
          }
        }
        
        // Verificar se a resposta é JSON
        const contentType = response.headers.get('content-type');
        
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`❌ [API-${name.toUpperCase()}] Resposta não é JSON:`, contentType);
          
          if (fallbackFunction) {
            return fallbackFunction(req, context?.params);
          }
          
          return NextResponse.json(
            { 
              success: false, 
              message: 'Resposta do backend não é JSON válido'
            },
            { 
              status: 500,
              headers: getCorsHeaders(req.headers.get('origin') || undefined)
            }
          );
        }
        
        const data = await response.json();
        
        // Aplicar transformação se necessário
        const responseData = transformResponse ? transformResponse(data) : data;
        
        console.log(`✅ [API-${name.toUpperCase()}] Dados recebidos do backend:`, { 
          success: responseData?.success || false,
          hasData: !!responseData
        });

        return NextResponse.json(responseData, { 
          status: response.status,
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        });
        
      } catch (fetchError) {
        console.error(`❌ [API-${name.toUpperCase()}] Erro ao conectar com backend:`, fetchError);
        
        if (fallbackFunction) {
          return fallbackFunction(req, context?.params);
        }
        
        return NextResponse.json(
          { 
            success: false, 
            message: `Erro ao conectar com o servidor backend para ${name}`,
            error: String(fetchError)
          },
          { 
            status: 503,
            headers: getCorsHeaders(req.headers.get('origin') || undefined)
          }
        );
      }
    } catch (err: any) {
      console.error(`❌ [API-${name.toUpperCase()}] Erro interno:`, err);
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro interno do servidor',
          error: String(err)
        },
        { 
          status: 500,
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        }
      );
    }
  }

  // Retornar o handler POST e OPTIONS
  return { POST, OPTIONS };
}

/**
 * Cria handlers padrão para rotas PUT da API
 */
export function createStandardPutRoute(options: StandardApiRouteOptions) {
  const {
    endpoint,
    fallbackFunction,
    name = endpoint.replace('/api/', ''),
    publicAccess = false,
    transformResponse
  } = options;

  // Reutilizar a lógica do POST, apenas mudando o método
  const { POST, OPTIONS } = createStandardPostRoute(options);
  
  // Handler para requisições PUT (mesmo comportamento que POST)
  async function PUT(req: NextRequest, context?: any) {
    return POST(req, context);
  }

  return { PUT, OPTIONS };
}

/**
 * Cria handlers padrão para rotas DELETE da API
 */
export function createStandardDeleteRoute(options: StandardApiRouteOptions) {
  const {
    endpoint,
    fallbackFunction,
    name = endpoint.replace('/api/', ''),
    publicAccess = false
  } = options;

  // Handler para requisições OPTIONS (preflight)
  async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get('origin') || undefined;
    return createCorsOptionsResponse(origin);
  }

  // Handler para requisições DELETE
  async function DELETE(req: NextRequest, context?: any) {
    try {
      console.log(`🔍 [API-${name.toUpperCase()}] DELETE requisição`);
      
      // Preparar headers de autenticação
      const headers = await prepareAuthHeaders(req);
      
      // Verificar se há um token válido de autenticação (se não for rota pública)
      if (!publicAccess) {
        const authHeader = headers.Authorization;
        const hasValidAuthToken = authHeader && 
                                authHeader.startsWith('Bearer ') && 
                                authHeader.length > 'Bearer '.length &&
                                authHeader !== 'Bearer ';
        
        console.log(`🔐 [API-${name.toUpperCase()}] Status de autenticação:`, { 
          hasValidAuthToken, 
          headerLength: headers.Authorization ? headers.Authorization.length : 0 
        });
      }
      
      // Construir URL do backend
      let backendUrl = new URL(endpoint, getInternalApiUrl()).toString();
      
      // Adicionar parâmetros de contexto à URL se existirem
      if (context?.params) {
        for (const [key, value] of Object.entries(context.params)) {
          backendUrl = backendUrl.replace(`[${key}]`, value as string);
        }
      }
      
      console.log(`🔗 [API-${name.toUpperCase()}] URL do backend:`, backendUrl);

      try {
        // Fazer requisição para o backend
        const response = await fetch(backendUrl, {
          method: 'DELETE',
          headers: headers
        });
        
        console.log(`📡 [API-${name.toUpperCase()}] Resposta do backend:`, { 
          status: response.status,
          ok: response.ok
        });
        
        if (!response.ok) {
          console.error(`❌ [API-${name.toUpperCase()}] Erro na resposta do backend:`, response.status);
          
          // Fallback para dados locais em caso de falha na API
          if (fallbackFunction) {
            console.log(`🔄 [API-${name.toUpperCase()}] Usando fallback local`);
            return fallbackFunction(req, context?.params);
          }
          
          // Tentar obter mensagem de erro do backend
          try {
            const errorData = await response.json();
            return NextResponse.json(
              errorData,
              { 
                status: response.status,
                headers: getCorsHeaders(req.headers.get('origin') || undefined)
              }
            );
          } catch {
            return NextResponse.json(
              { 
                success: false, 
                message: `Erro ao excluir ${name}`,
                status: response.status
              },
              { 
                status: response.status,
                headers: getCorsHeaders(req.headers.get('origin') || undefined)
              }
            );
          }
        }
        
        // Para DELETE, podemos ter 204 No Content
        if (response.status === 204) {
          return NextResponse.json(
            { success: true, message: `${name} excluído com sucesso` },
            { 
              status: 200,
              headers: getCorsHeaders(req.headers.get('origin') || undefined)
            }
          );
        }
        
        // Tentar obter resposta JSON se houver
        try {
          const data = await response.json();
          return NextResponse.json(data, { 
            status: response.status,
            headers: getCorsHeaders(req.headers.get('origin') || undefined)
          });
        } catch {
          // Se não for JSON, retornar sucesso genérico
          return NextResponse.json(
            { success: true, message: `${name} excluído com sucesso` },
            { 
              status: 200,
              headers: getCorsHeaders(req.headers.get('origin') || undefined)
            }
          );
        }
        
      } catch (fetchError) {
        console.error(`❌ [API-${name.toUpperCase()}] Erro ao conectar com backend:`, fetchError);
        
        if (fallbackFunction) {
          return fallbackFunction(req, context?.params);
        }
        
        return NextResponse.json(
          { 
            success: false, 
            message: `Erro ao conectar com o servidor backend para ${name}`,
            error: String(fetchError)
          },
          { 
            status: 503,
            headers: getCorsHeaders(req.headers.get('origin') || undefined)
          }
        );
      }
    } catch (err: any) {
      console.error(`❌ [API-${name.toUpperCase()}] Erro interno:`, err);
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro interno do servidor',
          error: String(err)
        },
        { 
          status: 500,
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        }
      );
    }
  }

  // Retornar o handler DELETE e OPTIONS
  return { DELETE, OPTIONS };
}

/**
 * Cria handlers padrão para rotas PATCH da API
 */
export function createStandardPatchRoute(options: StandardApiRouteOptions) {
  const {
    endpoint,
    fallbackFunction,
    name = endpoint.replace('/api/', ''),
    publicAccess = false,
    transformResponse
  } = options;

  // Reutilizar a lógica do POST, apenas mudando o método
  const { POST, OPTIONS } = createStandardPostRoute(options);
  
  // Handler para requisições PATCH (mesmo comportamento que POST)
  async function PATCH(req: NextRequest, context?: any) {
    return POST(req, context);
  }

  return { PATCH, OPTIONS };
} 