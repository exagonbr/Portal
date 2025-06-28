#!/usr/bin/env node

/**
 * Script para gerar versão única de cache baseada no timestamp e git hash
 * Usado para versionamento automático do Service Worker
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function generateCacheVersion() {
  try {
    // Tentar obter hash do git
    const gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const timestamp = Date.now();
    return `${gitHash}-${timestamp}`;
  } catch (error) {
    // Fallback se não estiver em repositório git
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `${randomId}-${timestamp}`;
  }
}

function updateCacheVersion() {
  const version = generateCacheVersion();
  const envPath = path.join(__dirname, '..', '.env.local');
  
  console.log(`🔄 Gerando nova versão de cache: ${version}`);
  
  // Ler arquivo .env.local existente
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Remover linha existente de NEXT_PUBLIC_CACHE_VERSION
  const lines = envContent.split('\n').filter(line => 
    !line.startsWith('NEXT_PUBLIC_CACHE_VERSION=')
  );
  
  // Adicionar nova versão
  lines.push(`NEXT_PUBLIC_CACHE_VERSION=${version}`);
  
  // Escrever arquivo atualizado
  fs.writeFileSync(envPath, lines.join('\n'));
  
  console.log(`✅ Versão de cache atualizada em .env.local: ${version}`);
  
  return version;
}

// Executar se chamado diretamente
if (require.main === module) {
  updateCacheVersion();
}

module.exports = { generateCacheVersion, updateCacheVersion };
