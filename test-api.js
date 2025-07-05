// Teste simples das APIs
async function testAPIs() {
  console.log('🧪 Testando APIs...\n');

  // Teste da API de usuários
  try {
    console.log('📋 Testando API de usuários...');
    const usersResponse = await fetch('http://localhost:3003/api/users?limit=5');
    const usersData = await usersResponse.json();
    console.log('✅ API de usuários:', usersData);
    console.log('   - Items:', usersData.items?.length || 0);
    console.log('   - Total:', usersData.total || 0);
  } catch (error) {
    console.log('❌ Erro na API de usuários:', error.message);
  }

  console.log('\n' + '─'.repeat(50) + '\n');

  // Teste da API de certificados
  try {
    console.log('🏆 Testando API de certificados...');
    const certsResponse = await fetch('http://localhost:3003/api/certificates?limit=5');
    const certsData = await certsResponse.json();
    console.log('✅ API de certificados:', certsData);
    console.log('   - Items:', certsData.items?.length || 0);
    console.log('   - Total:', certsData.total || 0);
  } catch (error) {
    console.log('❌ Erro na API de certificados:', error.message);
  }

  console.log('\n🎉 Teste concluído!');
}

testAPIs(); 