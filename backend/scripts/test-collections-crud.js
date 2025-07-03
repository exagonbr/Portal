const jwt = require('jsonwebtoken');
const http = require('http');

const JWT_SECRET = process.env.JWT_SECRET || 'ExagonTech';
const payload = {
  userId: 'admin',
  email: 'admin@test.com',
  name: 'Admin Test',
  role: 'SYSTEM_ADMIN',
  institutionId: 'test-institution-id',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60)
};

const token = jwt.sign(payload, JWT_SECRET);

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    if (data) {
      const dataString = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testCRUDOperations() {
  console.log('🧪 Iniciando testes CRUD das coleções...\n');

  try {
    // 1. Listar coleções (deve mostrar a coleção criada anteriormente)
    console.log('📋 1. Listando coleções existentes...');
    const listResponse = await makeRequest('GET', '/api/collections/manage');
    console.log(`Status: ${listResponse.statusCode}`);
    if (listResponse.statusCode === 200) {
      const listData = JSON.parse(listResponse.body);
      console.log(`✅ Encontradas ${listData.data?.length || 0} coleções`);
      if (listData.data && listData.data.length > 0) {
        console.log(`📄 Primeira coleção: ${listData.data[0].name}`);
      }
    } else {
      console.log(`❌ Erro na listagem: ${listResponse.body}`);
    }

    // 2. Criar nova coleção
    console.log('\n📝 2. Criando nova coleção...');
    const newCollection = {
      name: "Coleção Teste CRUD",
      synopsis: "Teste completo de operações CRUD",
      authors: "{\"Autor CRUD\"}",
      target_audience: "{\"Estudantes\",\"Professores\"}",
      producer: "Editora CRUD",
      release_date: "2024-06-25",
      contract_end_date: "2025-06-25"
    };

    const createResponse = await makeRequest('POST', '/api/collections/manage', newCollection);
    console.log(`Status: ${createResponse.statusCode}`);
    
    let collectionId = null;
    if (createResponse.statusCode === 201) {
      const createData = JSON.parse(createResponse.body);
      collectionId = createData.data.collection.id;
      console.log(`✅ Coleção criada com ID: ${collectionId}`);
    } else {
      console.log(`❌ Erro na criação: ${createResponse.body}`);
      return;
    }

    // 3. Buscar coleção por ID
    console.log('\n🔍 3. Buscando coleção por ID...');
    const getResponse = await makeRequest('GET', `/api/collections/manage/${collectionId}`);
    console.log(`Status: ${getResponse.statusCode}`);
    if (getResponse.statusCode === 200) {
      const getData = JSON.parse(getResponse.body);
      console.log(`✅ Coleção encontrada: ${getData.data.name}`);
    } else {
      console.log(`❌ Erro na busca: ${getResponse.body}`);
    }

    // 4. Atualizar coleção
    console.log('\n✏️  4. Atualizando coleção...');
    const updateData = {
      name: "Coleção Teste CRUD - ATUALIZADA",
      synopsis: "Teste de atualização bem-sucedida"
    };

    const updateResponse = await makeRequest('PUT', `/api/collections/manage/${collectionId}`, updateData);
    console.log(`Status: ${updateResponse.statusCode}`);
    if (updateResponse.statusCode === 200) {
      console.log('✅ Coleção atualizada com sucesso');
    } else {
      console.log(`❌ Erro na atualização: ${updateResponse.body}`);
    }

    // 5. Testar APIs públicas
    console.log('\n🌐 5. Testando APIs públicas...');
    const publicResponse = await makeRequest('GET', '/api/collections/public');
    console.log(`Status API pública: ${publicResponse.statusCode}`);
    if (publicResponse.statusCode === 200) {
      const publicData = JSON.parse(publicResponse.body);
      console.log(`✅ API pública funcionando - ${publicData.data?.length || 0} coleções`);
    } else {
      console.log(`❌ Erro na API pública: ${publicResponse.body}`);
    }

    // 6. Deletar coleção (soft delete)
    console.log('\n🗑️  6. Deletando coleção (soft delete)...');
    const deleteResponse = await makeRequest('DELETE', `/api/collections/manage/${collectionId}`);
    console.log(`Status: ${deleteResponse.statusCode}`);
    if (deleteResponse.statusCode === 200) {
      console.log('✅ Coleção deletada com sucesso (soft delete)');
    } else {
      console.log(`❌ Erro na deleção: ${deleteResponse.body}`);
    }

    console.log('\n🎉 Testes CRUD concluídos com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

testCRUDOperations(); 