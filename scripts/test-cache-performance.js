#!/usr/bin/env node

/**
 * Script para testar performance e funcionamento do cache
 * Execute com: npm run cache:test
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function testCachePerformance() {
  console.log('🧪 Iniciando teste de performance de cache...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Habilitar cache
    await page.setCacheEnabled(true);
    
    // Interceptar requisições para medir performance
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    });
    
    const responses = [];
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        fromCache: response.fromCache(),
        timestamp: Date.now()
      });
    });
    
    console.log('📊 Primeira visita (sem cache)...');
    const firstVisitStart = Date.now();
    await page.goto('https://portal.sabercon.com.br', { waitUntil: 'networkidle0' });
    const firstVisitTime = Date.now() - firstVisitStart;
    
    console.log(`⏱️  Primeira visita: ${firstVisitTime}ms`);
    console.log(`📦 Requisições: ${requests.length}`);
    console.log(`📥 Respostas: ${responses.length}`);
    
    // Aguardar um pouco para o Service Worker se registrar
    await page.waitForTimeout(2000);
    
    // Limpar contadores
    requests.length = 0;
    responses.length = 0;
    
    console.log('\n📊 Segunda visita (com cache)...');
    const secondVisitStart = Date.now();
    await page.reload({ waitUntil: 'networkidle0' });
    const secondVisitTime = Date.now() - secondVisitStart;
    
    console.log(`⏱️  Segunda visita: ${secondVisitTime}ms`);
    console.log(`📦 Requisições: ${requests.length}`);
    console.log(`📥 Respostas: ${responses.length}`);
    
    const cachedResponses = responses.filter(r => r.fromCache);
    console.log(`🚀 Respostas do cache: ${cachedResponses.length}`);
    
    // Calcular melhoria de performance
    const improvement = ((firstVisitTime - secondVisitTime) / firstVisitTime * 100).toFixed(1);
    console.log(`📈 Melhoria de performance: ${improvement}%`);
    
    // Testar Service Worker
    console.log('\n🔧 Testando Service Worker...');
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
    });
    
    console.log(`🔧 Service Worker ativo: ${swRegistered ? '✅' : '❌'}`);
    
    if (swRegistered) {
      // Testar funções de cache
      const cacheInfo = await page.evaluate(async () => {
        try {
          if (window.getServiceWorkerCacheInfo) {
            return await window.getServiceWorkerCacheInfo();
          }
          return null;
        } catch (error) {
          return { error: error.message };
        }
      });
      
      if (cacheInfo && !cacheInfo.error) {
        console.log('📊 Informações do cache SW:', cacheInfo);
      }
    }
    
    // Testar cache de API
    console.log('\n🌐 Testando cache de API...');
    await page.goto('https://portal.sabercon.com.br/dashboard', { waitUntil: 'networkidle0' });
    
    const apiRequests = responses.filter(r => r.url.includes('/api/'));
    console.log(`🔌 Requisições de API: ${apiRequests.length}`);
    
    // Resumo final
    console.log('\n📋 RESUMO DO TESTE');
    console.log('==================');
    console.log(`✅ Primeira visita: ${firstVisitTime}ms`);
    console.log(`🚀 Segunda visita: ${secondVisitTime}ms`);
    console.log(`📈 Melhoria: ${improvement}%`);
    console.log(`🔧 Service Worker: ${swRegistered ? 'Ativo' : 'Inativo'}`);
    console.log(`📦 Cache hits: ${cachedResponses.length}/${responses.length}`);
    
    if (improvement > 20) {
      console.log('\n🎉 CACHE FUNCIONANDO PERFEITAMENTE!');
    } else if (improvement > 0) {
      console.log('\n✅ Cache funcionando, mas pode ser otimizado');
    } else {
      console.log('\n⚠️ Cache não está proporcionando melhorias significativas');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Função para testar cache em desenvolvimento
async function testDevCache() {
  console.log('🧪 Testando cache em desenvolvimento...\n');
  
  try {
    const fetch = require('node-fetch');
    
    // Testar endpoint de health
    console.log('🔍 Testando endpoint de health...');
    const healthStart = Date.now();
    const healthResponse = await fetch('https://portal.sabercon.com.br/api/health');
    const healthTime = Date.now() - healthStart;
    
    console.log(`⏱️  Health check: ${healthTime}ms`);
    console.log(`📊 Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      console.log('✅ API está respondendo');
    } else {
      console.log('❌ API não está respondendo corretamente');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar cache em desenvolvimento:', error.message);
    console.log('💡 Certifique-se de que a aplicação está rodando em https://portal.sabercon.com.br');
  }
}

// Verificar se está em ambiente de desenvolvimento
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  testDevCache();
} else {
  testCachePerformance();
}
