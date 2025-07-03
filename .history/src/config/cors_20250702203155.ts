/**
 * Configuração global de CORS para todo o projeto
 * Permite todas as origens conforme solicitado
 */

export const CORS_CONFIG = {
  // PERMITIR TODAS AS ORIGENS - MAIS PERMISSIVO
  origin: '*',
  credentials: false, // Deve ser false quando origin é '*'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'Cache-Control',
    'Pragma',
    'Accept',
    'Origin',
    'Cookie',
    'User-Agent',
    'Referer',
    'Host',
    'Connection',
    'Accept-Encoding',
    'Accept-Language',
    'If-None-Match',
    'If-Modified-Since'
  ],
  exposedHeaders: [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'X-Response-Time',
    'Set-Cookie',
    'X-Total-Count',
    'X-Page-Count',
    'ETag',
    'Last-Modified'
  ],
  maxAge: 86400, // 24 horas
  preflightContinue: false,
  optionsSuccessStatus: 200 // Mudado de 204 para 200 para melhor compatibilidade
};

/**
 * Headers de CORS para uso em respostas Next.js API
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': CORS_CONFIG.methods.join(', '),
  'Access-Control-Allow-Headers': CORS_CONFIG.allowedHeaders.join(', '),
  'Access-Control-Allow-Credentials': 'false',
  'Access-Control-Max-Age': CORS_CONFIG.maxAge.toString(),
  'Access-Control-Expose-Headers': CORS_CONFIG.exposedHeaders.join(', '),
  'Allow': CORS_CONFIG.methods.join(', '), // HEADER ALLOW ADICIONADO
};

/**
 * Headers específicos para as URLs solicitadas
 */
export const SPECIFIC_CORS_HEADERS = {
  'http://localhost:3000': {
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': CORS_CONFIG.methods.join(', '),
    'Access-Control-Allow-Headers': CORS_CONFIG.allowedHeaders.join(', '),
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': CORS_CONFIG.maxAge.toString(),
    'Allow': CORS_CONFIG.methods.join(', '),
  },
  '/api': {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': CORS_CONFIG.methods.join(', '),
    'Access-Control-Allow-Headers': CORS_CONFIG.allowedHeaders.join(', '),
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': CORS_CONFIG.maxAge.toString(),
    'Allow': CORS_CONFIG.methods.join(', '),
  }
};

/**
 * Função helper para obter headers CORS baseados na origem
 */
export function getCorsHeaders(origin?: string): Record<string, string> {
  // Se não há origem específica ou não está na lista, usar headers genéricos
  if (!origin || !SPECIFIC_CORS_HEADERS[origin as keyof typeof SPECIFIC_CORS_HEADERS]) {
    return CORS_HEADERS;
  }
  
  return SPECIFIC_CORS_HEADERS[origin as keyof typeof SPECIFIC_CORS_HEADERS];
}

/**
 * Função helper para criar resposta com CORS
 */
export function createCorsResponse(data: any, status = 200, origin?: string) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin),
    },
  });
}

/**
 * Função helper para criar resposta de erro com CORS
 */
export function createCorsErrorResponse(message: string, status = 500, origin?: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin),
    },
  });
}

/**
 * Função helper para resposta OPTIONS (preflight)
 */
export function createCorsOptionsResponse(origin?: string) {
  return new Response(null, {
    status: CORS_CONFIG.optionsSuccessStatus,
    headers: {
      ...getCorsHeaders(origin),
      'Content-Length': '0',
    },
  });
}

/**
 * Middleware para Express.js
 */
export function setupExpressCors(app: any) {
  app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    const corsHeaders = getCorsHeaders(origin);
    
    // Aplicar headers CORS em todas as respostas
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    // Responder imediatamente a requisições OPTIONS
    if (req.method === 'OPTIONS') {
      res.setHeader('Content-Length', '0');
      return res.status(CORS_CONFIG.optionsSuccessStatus).end();
    }
    
    next();
  });
}

/**
 * Configuração para bibliotecas cors do Express
 */
export const EXPRESS_CORS_CONFIG = {
  origin: (origin: any, callback: any) => {
    // Permitir todas as origens
    callback(null, true);
  },
  credentials: false, // Deve ser false para permitir todas as origens
  methods: CORS_CONFIG.methods,
  allowedHeaders: CORS_CONFIG.allowedHeaders,
  exposedHeaders: CORS_CONFIG.exposedHeaders,
  preflightContinue: CORS_CONFIG.preflightContinue,
  optionsSuccessStatus: CORS_CONFIG.optionsSuccessStatus,
  maxAge: CORS_CONFIG.maxAge
};

/**
 * Headers para Next.js config
 */
export const NEXTJS_CORS_HEADERS = [
  {
    key: 'Access-Control-Allow-Origin',
    value: '*'
  },
  {
    key: 'Access-Control-Allow-Methods',
    value: CORS_CONFIG.methods.join(', ')
  },
  {
    key: 'Access-Control-Allow-Headers',
    value: CORS_CONFIG.allowedHeaders.join(', ')
  },
  {
    key: 'Access-Control-Allow-Credentials',
    value: 'false'
  },
  {
    key: 'Access-Control-Max-Age',
    value: CORS_CONFIG.maxAge.toString()
  }
];

export default CORS_CONFIG; 