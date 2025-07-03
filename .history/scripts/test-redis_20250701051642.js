const Redis = require('ioredis');

// Configuração do Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

async function testRedisConnection() {
  console.log('🔍 Testando conexão com Redis...\n');
  
  const redis = new Redis(redisConfig);
  
  try {
    // Teste de conexão básica
    console.log('1. Testando conexão básica...');
    const pong = await redis.ping();
    console.log(`   ✅ PING: ${pong}\n`);
    
    // Teste de escrita e leitura
    console.log('2. Testando operações de escrita/leitura...');
    await redis.set('test:connection', 'Redis funcionando!', 'EX', 60);
    const value = await redis.get('test:connection');
    console.log(`   ✅ SET/GET: ${value}\n`);
    
    // Teste de operações de conjunto
    console.log('3. Testando operações de conjunto...');
    await redis.sadd('test:set', 'item1', 'item2', 'item3');
    const setMembers = await redis.smembers('test:set');
    console.log(`   ✅ SADD/SMEMBERS: ${setMembers.join(', ')}\n`);
    
    // Teste de TTL
    console.log('4. Testando TTL...');
    await redis.setex('test:ttl', 5, 'expira em 5 segundos');
    const ttl = await redis.ttl('test:ttl');
    console.log(`   ✅ TTL: ${ttl} segundos\n`);
    
    // Informações do servidor Redis
    console.log('5. Informações do servidor Redis...');
    const info = await redis.info('server');
    const lines = info.split('\r\n').filter(line => 
      line.includes('redis_version') || 
      line.includes('redis_mode') || 
      line.includes('os') ||
      line.includes('uptime_in_seconds')
    );
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`   📊 ${line}`);
      }
    });
    console.log('');
    
    // Estatísticas de memória
    console.log('6. Estatísticas de memória...');
    const memory = await redis.info('memory');
    const memoryLines = memory.split('\r\n').filter(line => 
      line.includes('used_memory_human') || 
      line.includes('used_memory_peak_human') ||
      line.includes('maxmemory_human')
    );
    memoryLines.forEach(line => {
      if (line.trim()) {
        console.log(`   💾 ${line}`);
      }
    });
    console.log('');
    
    // Limpeza dos dados de teste
    console.log('7. Limpando dados de teste...');
    await redis.del('test:connection', 'test:set', 'test:ttl');
    console.log('   ✅ Dados de teste removidos\n');
    
    console.log('🎉 Todos os testes passaram! Redis está funcionando corretamente.\n');
    
    // Teste de sessões simuladas
    console.log('8. Testando estrutura de sessões...');
    const sessionId = 'test-session-' + Date.now();
    const userId = 'test-user-123';
    
    // Simula criação de sessão
    const sessionData = {
      userId,
      user: { id: userId, name: 'Usuário Teste', email: 'teste@exemplo.com' },
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent'
    };
    
    await redis.setex(`session:${sessionId}`, 86400, JSON.stringify(sessionData));
    await redis.sadd(`user_sessions:${userId}`, sessionId);
    await redis.sadd('active_users', userId);
    
    console.log(`   ✅ Sessão criada: ${sessionId}`);
    
    // Verifica se a sessão foi criada corretamente
    const retrievedSession = await redis.get(`session:${sessionId}`);
    const userSessions = await redis.smembers(`user_sessions:${userId}`);
    const activeUsers = await redis.smembers('active_users');
    
    console.log(`   ✅ Sessão recuperada: ${retrievedSession ? 'OK' : 'ERRO'}`);
    console.log(`   ✅ Sessões do usuário: ${userSessions.length}`);
    console.log(`   ✅ Usuários ativos: ${activeUsers.length}`);
    
    // Limpeza
    await redis.del(`session:${sessionId}`, `user_sessions:${userId}`);
    await redis.srem('active_users', userId);
    console.log('   ✅ Dados de teste de sessão removidos\n');
    
    console.log('✨ Sistema de sessões Redis está pronto para uso!');
    
  } catch (error) {
    console.log('❌ Erro durante os testes:', error.message);
    console.log('\n🔧 Possíveis soluções:');
    console.log('   1. Verifique se o Redis está rodando: redis-cli ping');
    console.log('   2. Confirme as configurações de conexão no .env');
    console.log('   3. Verifique se a porta 6379 está disponível');
    console.log('   4. Para Redis remoto, confirme credenciais e firewall');
  } finally {
    await redis.quit();
    console.log('\n🔌 Conexão Redis fechada.');
  }
}

// Executa o teste se o script for chamado diretamente
if (require.main === module) {
  testRedisConnection();
}

module.exports = { testRedisConnection };