const https = require('https');

const data = JSON.stringify({
  email: 'admin@exemplo.com',
  password: 'senha123'
});

const options = {
  hostname: 'portal.sabercon.com.br',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🔐 Testando login...');
console.log('URL:', `https://${options.hostname}${options.path}`);
console.log('Dados:', data);

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Resposta:', responseData);
    try {
      const json = JSON.parse(responseData);
      console.log('JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Não é JSON válido');
    }
  });
});

req.on('error', (error) => {
  console.error('Erro:', error);
});

req.write(data);
req.end();