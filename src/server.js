// Servidor personalizado para o Next.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Inicializar o app Next.js
const app = next({ 
  dev, 
  hostname, 
  port,
  // Configurar o Next.js para confiar no proxy
  conf: {
    // Isso garante que o Next.js saiba que está atrás de um proxy
    poweredByHeader: false,
    // Configuração para cookies seguros
    experimental: {
      trustHostHeader: true
    }
  }
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Configurar para confiar em headers de proxy
      if (process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production') {
        // Verificar se estamos atrás de um proxy HTTPS
        const xForwardedProto = req.headers['x-forwarded-proto'];
        
        // Se estamos atrás de um proxy HTTPS, definir req.secure como true
        if (xForwardedProto === 'https') {
          req.secure = true;
          
          // Definir cabeçalhos adicionais para garantir que o Next.js reconheça a conexão como segura
          req.headers['x-forwarded-proto'] = 'https';
          req.headers['x-forwarded-ssl'] = 'on';
        }
        
        // Log para debug
        console.log(`🔒 Secure connection: ${req.secure ? 'Yes' : 'No'} (X-Forwarded-Proto: ${xForwardedProto || 'none'})`);
      }

      // Parse da URL
      const parsedUrl = parse(req.url, true);
      
      // Deixar o Next.js lidar com a requisição
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
  .once('error', (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}); 