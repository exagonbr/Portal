const https = require('https');
const fs = require('fs');
const next = require('next');
const selfsigned = require('selfsigned');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

async function start() {
  try {
    // Generate self-signed certificate
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, {
      algorithm: 'sha256',
      days: 365,
      keySize: 2048,
    });

    await app.prepare();

    const httpsOptions = {
      key: pems.private,
      cert: pems.cert
    };

    https.createServer(httpsOptions, async (req, res) => {
      try {
        // Handle Next.js routing
        await handle(req, res);
      } catch (err) {
        console.log('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }).listen(3000, (err) => {
      if (err) throw err;
      console.log('> Ready on https://portal.sabercon.com.br');
    });
  } catch (err) {
    console.log('Error starting server:', err);
    process.exit(1);
  }
}

start();
