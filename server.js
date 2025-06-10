const { parse } = require('url');
const next = require('next');
const https = require('https');
const http = require('http');
const httpsLocalhost = require('https-localhost');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  if (dev) {
    const ssl = httpsLocalhost();
    ssl.getCerts().then(({ cert, key }) => {
      const httpsOptions = { key, cert };
      https.createServer(httpsOptions, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      }).listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on https://${hostname}:${port}`);
      });
    }).catch((e) => {
      console.error('Failed to get SSL certificates for HTTPS. Falling back to HTTP.', e);
      http.createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      }).listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
      });
    });
  } else {
    http.createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  }
});
