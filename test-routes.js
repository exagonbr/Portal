const fetch = require('node-fetch');

async function testRoutes() {
  console.log('🧪 Testando rotas do frontend...\n');

  // Testar rotas que existem e devem funcionar
  const validRoutes = [
    'http://localhost:3000/api/auth/login',
    'http://localhost:3000/api/sessions',
    'http://localhost:3000/api/content/search',
  ];

  // Testar rotas que podem estar causando 404
  const potentialProblemRoutes = [
    'http://localhost:3000/auth/login',
    'http://localhost:3000/api/auth/session',
    'http://localhost:3000/users',
    'http://localhost:3000/user-classes',
  ];

  console.log('✅ Testando rotas válidas:');
  for (const route of validRoutes) {
    try {
      const response = await fetch(route, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' })
      });
      console.log(`${route}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`${route}: ERROR - ${error.message}`);
    }
  }

  console.log('\n❌ Testando rotas problemáticas:');
  for (const route of potentialProblemRoutes) {
    try {
      const response = await fetch(route, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' })
      });
      console.log(`${route}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`${route}: ERROR - ${error.message}`);
    }
  }

  console.log('\n🔍 Verificando backend direto:');
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@portal.com', password: 'admin123' })
    });
    console.log(`Backend login: ${response.status} ${response.statusText}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Backend respondendo corretamente!`);
    }
  } catch (error) {
    console.log(`Backend login: ERROR - ${error.message}`);
  }
}

testRoutes(); 