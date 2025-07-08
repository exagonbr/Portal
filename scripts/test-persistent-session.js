/**
 * Script de Teste - Sistema de Sessão Persistente
 * Execute no console do navegador para testar a funcionalidade
 */

console.log('🧪 Iniciando testes do sistema de sessão persistente...\n');

// Função para criar dados de teste
function createTestSession() {
  const testSession = {
    userId: 'test-user-123',
    email: 'teste@sabercon.com.br',
    name: 'Usuário de Teste',
    role: 'SYSTEM_ADMIN',
    permissions: ['all'],
    accessToken: 'test-access-token-' + Date.now(),
    refreshToken: 'test-refresh-token-' + Date.now(),
    sessionId: 'test-session-' + Date.now(),
    expiresAt: Date.now() + (60 * 60 * 1000), // 1 hora
    refreshExpiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
  };
  
  return testSession;
}

// Função para testar salvamento
function testSaveSession() {
  console.log('📝 Teste 1: Salvamento de sessão');
  
  try {
    if (typeof SessionPersistenceService === 'undefined') {
      console.error('❌ SessionPersistenceService não encontrado. Certifique-se de que está na página correta.');
      return false;
    }
    
    const testData = createTestSession();
    SessionPersistenceService.saveSession(testData);
    
    console.log('✅ Sessão salva com sucesso');
    console.log('📊 Dados salvos:', testData);
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar sessão:', error);
    return false;
  }
}

// Função para testar recuperação
function testGetSession() {
  console.log('\n📖 Teste 2: Recuperação de sessão');
  
  try {
    const session = SessionPersistenceService.getSession();
    
    if (session) {
      console.log('✅ Sessão recuperada com sucesso');
      console.log('📊 Dados recuperados:', session);
      return true;
    } else {
      console.log('❌ Nenhuma sessão encontrada');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao recuperar sessão:', error);
    return false;
  }
}

// Função para testar validação
function testSessionValidation() {
  console.log('\n✅ Teste 3: Validação de sessão');
  
  try {
    const isValid = SessionPersistenceService.isSessionValid();
    
    console.log(`📊 Sessão é válida: ${isValid}`);
    
    if (isValid) {
      console.log('✅ Validação passou');
      return true;
    } else {
      console.log('❌ Sessão não é válida');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro na validação:', error);
    return false;
  }
}

// Função para testar necessidade de refresh
function testRefreshNeeded() {
  console.log('\n🔄 Teste 4: Verificação de necessidade de refresh');
  
  try {
    const needsRefresh = SessionPersistenceService.needsTokenRefresh();
    
    console.log(`📊 Precisa refresh: ${needsRefresh}`);
    console.log('✅ Verificação de refresh funcionando');
    return true;
  } catch (error) {
    console.error('❌ Erro na verificação de refresh:', error);
    return false;
  }
}

// Função para testar armazenamento em múltiplos locais
function testMultipleStorage() {
  console.log('\n💾 Teste 5: Armazenamento em múltiplos locais');
  
  try {
    // Verificar localStorage
    const localData = localStorage.getItem('session_data');
    console.log(`📊 localStorage: ${localData ? 'OK' : 'VAZIO'}`);
    
    // Verificar sessionStorage
    const sessionData = sessionStorage.getItem('session_data');
    console.log(`📊 sessionStorage: ${sessionData ? 'OK' : 'VAZIO'}`);
    
    // Verificar cookies
    const hasAuthCookie = document.cookie.includes('auth_token');
    console.log(`📊 Cookies: ${hasAuthCookie ? 'OK' : 'VAZIO'}`);
    
    const storageCount = [localData, sessionData, hasAuthCookie].filter(Boolean).length;
    console.log(`📊 Armazenamentos ativos: ${storageCount}/3`);
    
    if (storageCount > 0) {
      console.log('✅ Armazenamento redundante funcionando');
      return true;
    } else {
      console.log('❌ Nenhum armazenamento ativo');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro na verificação de armazenamento:', error);
    return false;
  }
}

// Função para testar limpeza
function testClearSession() {
  console.log('\n🧹 Teste 6: Limpeza de sessão');
  
  try {
    SessionPersistenceService.clearSession();
    
    // Verificar se foi limpo
    const session = SessionPersistenceService.getSession();
    
    if (!session) {
      console.log('✅ Sessão limpa com sucesso');
      return true;
    } else {
      console.log('❌ Sessão não foi limpa completamente');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
    return false;
  }
}

// Função para testar interceptação de limpeza
function testStorageProtection() {
  console.log('\n🛡️ Teste 7: Proteção contra limpeza');
  
  try {
    // Primeiro, salvar uma sessão
    const testData = createTestSession();
    SessionPersistenceService.saveSession(testData);
    
    console.log('📝 Sessão salva para teste de proteção');
    
    // Tentar limpar localStorage
    console.log('🧹 Tentando localStorage.clear()...');
    localStorage.clear();
    
    // Verificar se a sessão ainda existe
    const session = SessionPersistenceService.getSession();
    
    if (session) {
      console.log('✅ Proteção funcionando - sessão preservada após clear()');
      return true;
    } else {
      console.log('❌ Proteção falhou - sessão foi perdida');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro no teste de proteção:', error);
    return false;
  }
}

// Função para executar todos os testes
async function runAllTests() {
  console.log('🚀 Executando bateria completa de testes...\n');
  
  const tests = [
    { name: 'Salvamento', fn: testSaveSession },
    { name: 'Recuperação', fn: testGetSession },
    { name: 'Validação', fn: testSessionValidation },
    { name: 'Refresh Check', fn: testRefreshNeeded },
    { name: 'Armazenamento Múltiplo', fn: testMultipleStorage },
    { name: 'Proteção Storage', fn: testStorageProtection },
    { name: 'Limpeza', fn: testClearSession }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, success: result });
    } catch (error) {
      console.error(`❌ Erro no teste ${test.name}:`, error);
      results.push({ name: test.name, success: false });
    }
  }
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('==================');
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.success ? 'PASSOU' : 'FALHOU'}`);
  });
  
  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`\n📈 Resultado: ${passedTests}/${totalTests} testes passaram`);
  
  if (passedTests === totalTests) {
    console.log('🎉 TODOS OS TESTES PASSARAM! Sistema funcionando corretamente.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
  
  return { passedTests, totalTests, results };
}

// Função para testar cenários específicos
function testSpecificScenario(scenario) {
  console.log(`🎯 Testando cenário específico: ${scenario}\n`);
  
  switch (scenario) {
    case 'refresh':
      return testRefreshNeeded();
    case 'storage':
      return testMultipleStorage();
    case 'protection':
      return testStorageProtection();
    case 'validation':
      return testSessionValidation();
    default:
      console.log('❌ Cenário não reconhecido. Opções: refresh, storage, protection, validation');
      return false;
  }
}

// Função para verificar status atual
function checkCurrentStatus() {
  console.log('📊 STATUS ATUAL DO SISTEMA DE SESSÃO');
  console.log('====================================');
  
  try {
    if (typeof SessionPersistenceService === 'undefined') {
      console.log('❌ SessionPersistenceService não disponível');
      return;
    }
    
    const session = SessionPersistenceService.getSession();
    const isValid = SessionPersistenceService.isSessionValid();
    const needsRefresh = SessionPersistenceService.needsTokenRefresh();
    
    console.log(`📊 Sessão existe: ${!!session}`);
    console.log(`📊 Sessão válida: ${isValid}`);
    console.log(`📊 Precisa refresh: ${needsRefresh}`);
    
    if (session) {
      console.log(`📊 Usuário: ${session.email}`);
      console.log(`📊 Role: ${session.role}`);
      console.log(`📊 Expira em: ${new Date(session.expiresAt).toLocaleString()}`);
      console.log(`📊 Refresh expira em: ${new Date(session.refreshExpiresAt).toLocaleString()}`);
    }
    
    // Verificar localStorage
    const localKeys = ['session_data', 'last_activity', 'accessToken', 'user'];
    localKeys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`📊 localStorage.${key}: ${value ? 'EXISTE' : 'VAZIO'}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
  }
}

// Exportar funções para uso global
window.testPersistentSession = {
  runAllTests,
  testSpecificScenario,
  checkCurrentStatus,
  testSaveSession,
  testGetSession,
  testSessionValidation,
  testRefreshNeeded,
  testMultipleStorage,
  testStorageProtection,
  testClearSession
};

console.log('✅ Script de teste carregado!');
console.log('📖 Como usar:');
console.log('  - testPersistentSession.runAllTests() - Executar todos os testes');
console.log('  - testPersistentSession.checkCurrentStatus() - Ver status atual');
console.log('  - testPersistentSession.testSpecificScenario("refresh") - Testar cenário específico');
console.log('  - testPersistentSession.testStorageProtection() - Testar proteção');

// Auto-executar verificação de status se solicitado
if (typeof window !== 'undefined' && window.location.search.includes('autotest=true')) {
  console.log('\n🚀 Auto-executando testes...');
  setTimeout(() => {
    runAllTests();
  }, 1000);
} 