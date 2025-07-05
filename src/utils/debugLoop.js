#!/usr/bin/env node

/**
 * Script para debugar loops de requisições
 * Monitora requisições e identifica padrões suspeitos
 */

const fs = require('fs');
const path = require('path');

// Configuração
const MONITOR_DURATION = 30000; // 30 segundos
const SUSPICIOUS_THRESHOLD = 5; // 5 requisições por segundo é suspeito
const LOG_FILE = path.join(__dirname, '../logs/request-monitor.log');

// Contadores
let requestCount = 0;
let startTime = Date.now();
const requestHistory = [];

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  const coloredMessage = `${colors[color]}${message}${colors.reset}`;
  console.log(`[${timestamp}] ${coloredMessage}`);
  
  // Salvar no arquivo de log
  try {
    const logDir = path.dirname(LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
  } catch (error) {
    console.log('Erro ao salvar log:', error);
  }
}

// Interceptar console.log para monitorar requisições
const originalConsoleLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  
  // Detectar requisições de login
  if (message.includes('🔐 LOGIN REQUEST START') || 
      message.includes('Middleware: Processando /api/users/login')) {
    requestCount++;
    requestHistory.push({
      timestamp: Date.now(),
      message: message.substring(0, 200) // Limitar tamanho
    });
    
    // Verificar se há loop suspeito
    const now = Date.now();
    const recentRequests = requestHistory.filter(req => now - req.timestamp < 1000); // Último segundo
    
    if (recentRequests.length >= SUSPICIOUS_THRESHOLD) {
      log(`🚨 LOOP SUSPEITO DETECTADO! ${recentRequests.length} requisições no último segundo`, 'red');
      log(`📊 Total de requisições: ${requestCount}`, 'yellow');
      log(`⏱️  Tempo decorrido: ${((now - startTime) / 1000).toFixed(1)}s`, 'yellow');
      
      // Mostrar últimas requisições
      log('📋 Últimas requisições:', 'blue');
      recentRequests.slice(-3).forEach((req, index) => {
        log(`  ${index + 1}. ${req.message}`, 'blue');
      });
    }
  }
  
  // Chamar console.log original
  originalConsoleLog.apply(console, args);
};

// Função para analisar padrões
function analyzePatterns() {
  const now = Date.now();
  const duration = now - startTime;
  const requestsPerSecond = (requestCount / (duration / 1000)).toFixed(2);
  
  log(`📊 ANÁLISE DE PADRÕES:`, 'bold');
  log(`   Total de requisições: ${requestCount}`, 'blue');
  log(`   Duração: ${(duration / 1000).toFixed(1)}s`, 'blue');
  log(`   Requisições por segundo: ${requestsPerSecond}`, 'blue');
  
  if (parseFloat(requestsPerSecond) > SUSPICIOUS_THRESHOLD) {
    log(`🚨 PADRÃO SUSPEITO: Taxa muito alta de requisições!`, 'red');
    return true;
  } else if (requestCount > 50) {
    log(`⚠️  MUITAS REQUISIÇÕES: Mais de 50 requisições detectadas`, 'yellow');
    return true;
  } else {
    log(`✅ PADRÃO NORMAL: Taxa de requisições aceitável`, 'green');
    return false;
  }
}

// Função para gerar relatório
function generateReport() {
  const now = Date.now();
  const duration = now - startTime;
  
  const report = {
    timestamp: new Date().toISOString(),
    duration: duration,
    totalRequests: requestCount,
    requestsPerSecond: (requestCount / (duration / 1000)).toFixed(2),
    suspicious: analyzePatterns(),
    recentRequests: requestHistory.slice(-10).map(req => ({
      timestamp: new Date(req.timestamp).toISOString(),
      message: req.message
    }))
  };
  
  // Salvar relatório
  try {
    const reportFile = path.join(__dirname, '../logs/loop-analysis-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    log(`📄 Relatório salvo em: ${reportFile}`, 'green');
  } catch (error) {
    log(`❌ Erro ao salvar relatório: ${error.message}`, 'red');
  }
  
  return report;
}

// Iniciar monitoramento
log(`🔍 INICIANDO MONITORAMENTO DE LOOPS`, 'bold');
log(`⏱️  Duração: ${MONITOR_DURATION / 1000}s`, 'blue');
log(`🚨 Limite suspeito: ${SUSPICIOUS_THRESHOLD} req/s`, 'yellow');
log(`📁 Logs salvos em: ${LOG_FILE}`, 'blue');

// Timer para análise periódica
const analysisInterval = setInterval(() => {
  if (requestCount > 0) {
    analyzePatterns();
  }
}, 5000); // A cada 5 segundos

// Timer para finalizar monitoramento
setTimeout(() => {
  clearInterval(analysisInterval);
  
  log(`🏁 MONITORAMENTO FINALIZADO`, 'bold');
  const report = generateReport();
  
  if (report.suspicious) {
    log(`🚨 RESULTADO: Loop suspeito detectado!`, 'red');
    log(`💡 RECOMENDAÇÃO: Verificar código que faz requisições automáticas`, 'yellow');
  } else {
    log(`✅ RESULTADO: Nenhum loop detectado`, 'green');
  }
  
  process.exit(0);
}, MONITOR_DURATION);

// Capturar Ctrl+C para gerar relatório antes de sair
process.on('SIGINT', () => {
  log(`\n⏹️  MONITORAMENTO INTERROMPIDO PELO USUÁRIO`, 'yellow');
  clearInterval(analysisInterval);
  generateReport();
  process.exit(0);
});

log(`✅ Monitor ativo. Pressione Ctrl+C para parar.`, 'green'); 