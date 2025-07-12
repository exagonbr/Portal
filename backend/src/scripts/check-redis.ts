#!/usr/bin/env ts-node

import { testRedisConnection } from '../config/redis';

/**
 * Script para diagnosticar problemas de conexão com Redis
 */
async function checkRedisStatus() {
  console.log('🔍 Verificando status do Redis...\n');
  
  // Informações de configuração
  console.log('📋 Configuração atual:');
  console.log(`   Host: ${process.env.REDIS_HOST || 'localhost'}`);
  console.log(`   Port: ${process.env.REDIS_PORT || '6379'}`);
  console.log(`   DB Principal: ${process.env.REDIS_DB || '0'}`);
  console.log(`   DB Filas: ${process.env.QUEUE_REDIS_DB || '1'}`);
  console.log(`   DB Cache Estático: ${process.env.REDIS_STATIC_CACHE_DB || '2'}`);
  console.log(`   Password: ${process.env.REDIS_PASSWORD ? '***configurada***' : 'não configurada'}`);
  console.log();

  // Testes de conexão
  console.log('🧪 Executando testes de conexão...\n');
  
  const results = {
    main: false,
    queue: false,
    staticCache: false
  };

  // Teste conexão principal
  console.log('1. Testando conexão principal...');
  results.main = await testRedisConnection();
  console.log();

  // Teste conexão de filas
  console.log('2. Testando conexão de filas...');
  results.queue = await testRedisConnection();
  console.log();

  // Teste conexão de cache estático
  console.log('3. Testando conexão de cache estático...');
  results.staticCache = await testRedisConnection();
  console.log();

  // Resumo dos resultados
  console.log('📊 Resumo dos testes:');
  console.log(`   Redis Principal: ${results.main ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`   Redis Filas: ${results.queue ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`   Redis Cache Estático: ${results.staticCache ? '✅ OK' : '❌ FALHOU'}`);
  console.log();

  // Instruções para instalação/configuração
  if (!results.main || !results.queue || !results.staticCache) {
    console.log('🛠️  Instruções para resolver problemas:\n');
    
    console.log('📦 Para instalar Redis no Windows:');
    console.log('   1. Baixe Redis para Windows: https://github.com/microsoftarchive/redis/releases');
    console.log('   2. Ou use Docker: docker run -d -p 6379:6379 redis:alpine');
    console.log('   3. Ou use WSL2 com Ubuntu e instale: sudo apt install redis-server');
    console.log();
    
    console.log('📦 Para instalar Redis no macOS:');
    console.log('   brew install redis');
    console.log('   brew services start redis');
    console.log();
    
    console.log('📦 Para instalar Redis no Linux:');
    console.log('   sudo apt update');
    console.log('   sudo apt install redis-server');
    console.log('   sudo systemctl start redis-server');
    console.log();
    
    console.log('🔧 Configuração de variáveis de ambiente:');
    console.log('   Crie um arquivo .env no diretório backend/ com:');
    console.log('   REDIS_HOST=localhost');
    console.log('   REDIS_PORT=6379');
    console.log('   REDIS_DB=0');
    console.log('   QUEUE_REDIS_DB=1');
    console.log('   REDIS_STATIC_CACHE_DB=2');
    console.log('   # REDIS_PASSWORD=sua_senha (se necessário)');
    console.log();
    
    console.log('✅ Após configurar, execute novamente este script para verificar.');
  } else {
    console.log('🎉 Todas as conexões Redis estão funcionando corretamente!');
  }

  process.exit(results.main && results.queue && results.staticCache ? 0 : 1);
}

// Executa o diagnóstico
checkRedisStatus().catch(error => {
  console.error('❌ Erro durante o diagnóstico:', error);
  process.exit(1);
}); 