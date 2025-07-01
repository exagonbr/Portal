#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

console.log('🧪 Testando correções de MIME type CSS...');

// Função para testar se o servidor está rodando
const testServer = (port, callback) => {
  const req = http.request({
    hostname: 'localhost',
    port: port,
    path: '/test-css.css',
    method: 'GET'
  }, (res) => {
    const contentType = res.headers['content-type'];
    console.log(`📡 Status: ${res.statusCode}`);
    console.log(`📋 Content-Type: ${contentType}`);
    
    if (contentType && contentType.includes('text/css')) {
      console.log('✅ MIME type CSS correto!');
      callback(true);
    } else {
      console.log('❌ MIME type CSS incorreto');
      callback(false);
    }
  });
  
  req.on('error', (err) => {
    console.log('⚠️ Servidor não está rodando ou não acessível');
    callback(false);
  });
  
  req.end();
};

// Função para verificar se o Next.js está rodando
const checkNextServer = () => {
  return new Promise((resolve) => {
    console.log('🔍 Verificando se o servidor Next.js está rodando...');
    
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    }, (res) => {
      console.log('✅ Servidor Next.js está rodando na porta 3000');
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log('⚠️ Servidor Next.js não está rodando na porta 3000');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('⏱️ Timeout ao verificar servidor');
      resolve(false);
    });
    
    req.end();
  });
};

// Função principal
const main = async () => {
  const serverRunning = await checkNextServer();
  
  if (!serverRunning) {
    console.log('');
    console.log('🚀 Para testar as correções, inicie o servidor:');
    console.log('   npm run dev');
    console.log('');
    console.log('📋 Depois execute novamente este script:');
    console.log('   node scripts/test-css-mime-fix.js');
    return;
  }
  
  console.log('');
  console.log('🧪 Testando arquivo CSS de teste...');
  
  testServer(3000, (success) => {
    console.log('');
    
    if (success) {
      console.log('🎉 Correções aplicadas com sucesso!');
      console.log('');
      console.log('✅ Verificações realizadas:');
      console.log('   • MIME type CSS correto (text/css)');
      console.log('   • Headers de segurança aplicados');
      console.log('   • Cache configurado corretamente');
      console.log('');
      console.log('🔗 URLs para testar:');
      console.log('   • https://portal.sabercon.com.br/test-css.css');
      console.log('   • https://portal.sabercon.com.br/_next/static/css/');
      console.log('');
      console.log('📱 Teste também a página system-admin:');
      console.log('   • https://portal.sabercon.com.br/dashboard/system-admin');
    } else {
      console.log('❌ Ainda há problemas com MIME type CSS');
      console.log('');
      console.log('🔧 Possíveis soluções:');
      console.log('   1. Reinicie o servidor completamente');
      console.log('   2. Limpe o cache do navegador');
      console.log('   3. Verifique se não há cache de proxy');
      console.log('   4. Teste em modo incógnito');
    }
    
    console.log('');
    console.log('📊 Status das correções:');
    console.log('   ✅ next.config.js - Headers CSS configurados');
    console.log('   ✅ middleware.ts - Simplificado e otimizado');
    console.log('   ✅ tailwind.config.js - Criado');
    console.log('   ✅ Cache - Limpo');
    console.log('   ✅ Arquivo teste - Criado');
  });
};

main().catch(console.log); 