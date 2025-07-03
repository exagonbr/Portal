const http = require('http');

const data = JSON.stringify({
  name: "Teste Direto",
  synopsis: "Teste direto da API",
  authors: ["Autor Teste"],
  target_audience: ["Estudantes"]
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/collections/manage',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', body);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.log(`Erro na requisição: ${e.message}`);
  process.exit(1);
});

req.write(data);
req.end(); 