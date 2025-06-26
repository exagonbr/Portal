// Configuração global para rotas de API
// Força renderização dinâmica para todas as rotas de API

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

// Headers padrão para CORS - PERMITIR TODAS AS ORIGENS
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization, X-CSRF-Token, Cache-Control, Pragma, Accept, Origin, Cookie',
  'Access-Control-Allow-Credentials': 'false', // Deve ser false com origin: '*'
  'Access-Control-Max-Age': '86400',
};

// Função helper para respostas com CORS
export function createResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Função helper para erros com CORS
export function createErrorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Função helper para respostas OPTIONS (preflight)
export function createOptionsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Content-Length': '0',
    },
  });
}
