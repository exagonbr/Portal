/**
 * Configuração global de CORS para todo o projeto
 * Permite todas as origens conforme solicitado
 */

export const CORS_CONFIG = {
  // PERMITIR TODAS AS ORIGENS
  origin: '*',
  credentials: false, // Deve ser false quando origin é '*'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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
    'Referer'
  ],
  exposedHeaders: [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'X-Response-Time',
    'Set-Cookie'
  ],
  maxAge: 86400, // 24 horas
  preflightContinue: false,
  optionsSuccessStatus: 204
};

/**
 * Headers de CORS para uso em respostas Next.js API
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': CORS_CONFIG.origin,
  'Access-Control-Allow-Methods': CORS_CONFIG.methods.join(', '),
  'Access-Control-Allow-Headers': CORS_CONFIG.allowedHeaders.join(', '),
  'Access-Control-Allow-Credentials': CORS_CONFIG.credentials.toString(),
  'Access-Control-Max-Age': CORS_CONFIG.maxAge.toString(),
};

/**
 * Função helper para criar resposta com CORS
 */
export function createCorsResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

/**
 * Função helper para criar resposta de erro com CORS
 */
export function createCorsErrorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

/**
 * Função helper para resposta OPTIONS (preflight)
 */
export function createCorsOptionsResponse() {
  return new Response(null, {
    status: CORS_CONFIG.optionsSuccessStatus,
    headers: {
      ...CORS_HEADERS,
      'Content-Length': '0',
    },
  });
}

/**
 * Middleware para Express.js
 */
export function setupExpressCors(app: any) {
  app.use((req: any, res: any, next: any) => {
    // Aplicar headers CORS em todas as respostas
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
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
  origin: CORS_CONFIG.origin,
  credentials: CORS_CONFIG.credentials,
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
export const NEXTJS_CORS_HEADERS = CORS_CONFIG.allowedHeaders.map(header => ({
  key: 'Access-Control-Allow-Headers',
  value: CORS_CONFIG.allowedHeaders.join(', ')
}));

export default CORS_CONFIG; 