const jwt = require('jsonwebtoken');
const http = require('http');

const JWT_SECRET = process.env.JWT_SECRET || 'ExagonTech';
const token = jwt.sign({
  userId: 'admin',
  role: 'SYSTEM_ADMIN'
}, JWT_SECRET);

function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

async function testEndpoints() {
  console.log('🧪 Testando endpoints da API...\n');

  try {
    // 1. Testar listagem de coleções
    console.log('📋 1. GET /api/collections/manage');
    const listResponse = await makeRequest('GET', '/api/collections/manage');
    console.log(`Status: ${listResponse.statusCode}`);
    
    if (listResponse.statusCode === 200) {
      const listData = JSON.parse(listResponse.body);
      console.log('✅ Estrutura da resposta:');
      console.log(`  - success: ${listData.success}`);
      console.log(`  - data: ${typeof listData.data}`);
      console.log(`  - data.collections: ${Array.isArray(listData.data?.collections)}`);
      console.log(`  - Número de coleções: ${listData.data?.collections?.length || 0}`);
      
      if (listData.data?.collections?.length > 0) {
        const firstCollection = listData.data.collections[0];
        console.log(`  - Primeira coleção ID: ${firstCollection.id} (${typeof firstCollection.id})`);
        console.log(`  - Nome: ${firstCollection.name}`);
        
        // 2. Testar busca por ID
        console.log(`\n🔍 2. GET /api/collections/manage/${firstCollection.id}`);
        const detailResponse = await makeRequest('GET', `/api/collections/manage/${firstCollection.id}`);
        console.log(`Status: ${detailResponse.statusCode}`);
        
        if (detailResponse.statusCode === 200) {
          const detailData = JSON.parse(detailResponse.body);
          console.log('✅ Estrutura da resposta de detalhes:');
          console.log(`  - success: ${detailData.success}`);
          console.log(`  - data: ${typeof detailData.data}`);
          console.log(`  - data.collection: ${typeof detailData.data?.collection}`);
          console.log(`  - videos: ${Array.isArray(detailData.data?.collection?.videos)}`);
        } else {
          console.log(`❌ Erro na busca por ID: ${detailResponse.body}`);
        }
      }
    } else {
      console.log(`❌ Erro na listagem: ${listResponse.body}`);
    }

    // 3. Testar API pública
    console.log('\n🌐 3. GET /api/collections/public');
    const publicResponse = await makeRequest('GET', '/api/collections/public');
    console.log(`Status: ${publicResponse.statusCode}`);
    
    if (publicResponse.statusCode === 200) {
      const publicData = JSON.parse(publicResponse.body);
      console.log('✅ API pública funcionando');
      console.log(`  - Coleções públicas: ${publicData.data?.length || 0}`);
    } else {
      console.log(`❌ Erro na API pública: ${publicResponse.body}`);
    }

    console.log('\n✅ Testes de endpoints concluídos!');

  } catch (error) {
    console.log('❌ Erro durante os testes:', error.message);
  }
}

testEndpoints(); 