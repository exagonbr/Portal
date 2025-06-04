#!/usr/bin/env node

/**
 * Script para testar se o problema de duplicação de path da API foi corrigido
 */

const https = require('https');
const http = require('http');

// Configurações
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3001';

// Dados de teste
const loginData = {
  email: 'admin@portal.com',
  password: 'admin123'
};

// Função para fazer requisições HTTP
function makeRequest(url, data, method = 'POST') {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testEndpoints() {
  console.log('🧪 Testando correção do problema de duplicação de path da API...\n');

  const tests = [
    {
      name: 'Frontend Next.js API Route',
      url: `${FRONTEND_URL}/api/auth/login`,
      description: 'Endpoint correto do Next.js'
    },
    {
      name: 'Backend Express API',
      url: `${BACKEND_URL}/api/auth/login`,
      description: 'Endpoint correto do backend'
    },
    {
      name: 'Path Duplicado (deve falhar)',
      url: `${BACKEND_URL}/api/api/auth/login`,
      description: 'Path com duplicação - deve retornar 404'
    }
  ];

  for (const test of tests) {
    console.log(`📋 Testando: ${test.name}`);
    console.log(`🔗 URL: ${test.url}`);
    console.log(`📝 Descrição: ${test.description}`);
    
    try {
      const response = await makeRequest(test.url, loginData);
      
      console.log(`📊 Status: ${response.status}`);
      
      if (response.status === 404 && test.url.includes('/api/api/')) {
        console.log('✅ CORRETO: Path duplicado retorna 404 (como esperado)');
      } else if (response.status === 200 || response.status === 400) {
        console.log('✅ CORRETO: Endpoint responde adequadamente');
        if (response.data.message) {
          console.log(`📄 Mensagem: ${response.data.message}`);
        }
      } else {
        console.log(`⚠️  Status inesperado: ${response.status}`);
        if (response.data.message) {
          console.log(`📄 Mensagem: ${response.data.message}`);
        }
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Servidor não está rodando');
      } else {
        console.log(`❌ Erro: ${error.message}`);
      }
    }
    
    console.log(''); // Linha em branco para separar os testes
  }

  // Teste adicional: verificar se as constantes estão corretas
  console.log('🔍 Verificando configurações...\n');
  
  // Simular o que acontece no código
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const loginEndpoint = `${API_BASE_URL}/api/auth/login`;
  
  console.log(`📋 API_BASE_URL configurado: ${API_BASE_URL}`);
  console.log(`📋 Endpoint de login gerado: ${loginEndpoint}`);
  
  if (loginEndpoint === 'http://localhost:3001/api/auth/login') {
    console.log('✅ CORRETO: URL construída sem duplicação');
  } else {
    console.log('❌ ERRO: URL construída com problema');
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando testes de correção de API...\n');
  
  await testEndpoints();
  
  console.log('\n📋 Resumo:');
  console.log('- Se o endpoint /api/auth/login funciona: ✅ Problema corrigido');
  console.log('- Se o endpoint /api/api/auth/login retorna 404: ✅ Configuração correta');
  console.log('- Certifique-se de que os servidores estão rodando nas portas corretas');
  
  console.log('\n🔧 Para executar os serviços:');
  console.log('- Frontend: npm run dev (porta 3000)');
  console.log('- Backend: npm run start (porta 3001)');
}

// Executar se este arquivo for chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testEndpoints, makeRequest }; 