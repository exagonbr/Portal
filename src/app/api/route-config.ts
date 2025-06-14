// Configuração global para rotas de API
// Força renderização dinâmica para todas as rotas de API

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

// Headers padrão para CORS
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? '*' : 'https://portal.sabercon.com.br',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization, X-CSRF-Token',
  'Access-Control-Allow-Credentials': 'true',
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
