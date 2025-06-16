const axios = require('axios');

async function testCors() {
  try {
    console.log('🧪 Testando CORS no backend...');
    
    const response = await axios.get('http://localhost:3001/health', {
      headers: {
        'Origin': 'http://different-domain.com'
      }
    });
    
    console.log('✅ Status:', response.status);
    console.log('✅ CORS Headers:');
    console.log('   Access-Control-Allow-Origin:', response.headers['access-control-allow-origin']);
    console.log('   Access-Control-Allow-Methods:', response.headers['access-control-allow-methods']);
    console.log('   Access-Control-Allow-Headers:', response.headers['access-control-allow-headers']);
    
    if (response.headers['access-control-allow-origin'] === '*') {
      console.log('🎉 CORS configurado com allow * - Sucesso!');
    } else {
      console.log('⚠️  CORS não está configurado com allow *');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar CORS:', error.message);
  }
}

testCors(); 