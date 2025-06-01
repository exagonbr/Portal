const fetch = require('node-fetch');

async function testAllEndpoints() {
  console.log('🧪 Testando todos os endpoints após correções...\n');

  // Lista de endpoints que devem funcionar agora
  const endpoints = [
    { name: 'Auth Login', url: 'http://localhost:3001/api/auth/login', method: 'POST', body: { email: 'admin@portal.com', password: 'admin123' } },
    { name: 'Users', url: 'http://localhost:3001/api/users', method: 'GET' },
    { name: 'Roles', url: 'http://localhost:3001/api/roles', method: 'GET' },
    { name: 'Institutions', url: 'http://localhost:3001/api/institutions', method: 'GET' },
    { name: 'Courses', url: 'http://localhost:3001/api/courses', method: 'GET' },
    { name: 'User Classes', url: 'http://localhost:3001/api/user-classes', method: 'GET' },
    { name: 'School Managers', url: 'http://localhost:3001/api/school-managers', method: 'GET' },
    { name: 'Education Cycles', url: 'http://localhost:3001/api/education-cycles', method: 'GET' },
    { name: 'Notifications', url: 'http://localhost:3001/api/notifications', method: 'GET' },
  ];

  let token = null;

  console.log('📋 Testando endpoints do backend:');
  
  for (const endpoint of endpoints) {
    try {
      const options = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      };

      // Adicionar token se disponível (para endpoints que precisam de auth)
      if (token && endpoint.name !== 'Auth Login') {
        options.headers.Authorization = `Bearer ${token}`;
      }

      // Adicionar body se for POST
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }

      const response = await fetch(endpoint.url, options);
      const status = response.status;
      
      if (endpoint.name === 'Auth Login' && response.ok) {
        const data = await response.json();
        token = data.token;
        console.log(`✅ ${endpoint.name}: ${status} (Token obtido!)`);
      } else if (status === 200 || status === 201) {
        console.log(`✅ ${endpoint.name}: ${status}`);
      } else if (status === 401) {
        console.log(`🔐 ${endpoint.name}: ${status} (Autenticação necessária)`);
      } else if (status === 404) {
        console.log(`❌ ${endpoint.name}: ${status} (Endpoint não encontrado)`);
      } else {
        console.log(`⚠️  ${endpoint.name}: ${status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERROR - ${error.message}`);
    }
  }

  console.log('\n🔍 Testando endpoints antigos (devem dar 404):');
  
  const oldEndpoints = [
    'http://localhost:3001/auth/login',
    'http://localhost:3001/users',
    'http://localhost:3001/roles',
    'http://localhost:3001/institutions',
    'http://localhost:3001/courses',
  ];

  for (const url of oldEndpoints) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 404) {
        console.log(`✅ ${url}: 404 (Corretamente bloqueado)`);
      } else {
        console.log(`⚠️  ${url}: ${response.status} (Inesperado)`);
      }
    } catch (error) {
      console.log(`❌ ${url}: ERROR - ${error.message}`);
    }
  }

  console.log('\n✨ Teste concluído!');
  
  if (token) {
    console.log('🎉 Sistema de autenticação funcionando perfeitamente!');
  } else {
    console.log('⚠️  Problema com autenticação detectado.');
  }
}

testAllEndpoints(); 