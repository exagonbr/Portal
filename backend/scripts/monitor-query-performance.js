/**
 * Script para monitorar o desempenho de consultas no banco de dados
 * 
 * Este script se conecta ao banco de dados PostgreSQL e monitora consultas lentas,
 * fornecendo estatísticas sobre o desempenho das consultas.
 * 
 * Uso:
 * node monitor-query-performance.js
 */

require('dotenv').config();
const { Pool } = require('pg');

// Configuração da conexão com o banco de dados
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'portal_sabercon',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Tempo mínimo de execução para considerar uma consulta lenta (em ms)
const SLOW_QUERY_THRESHOLD = 1000;

// Configuração do monitoramento
const MONITORING_INTERVAL = 60000; // 1 minuto
const REPORT_INTERVAL = 300000; // 5 minutos

// Armazenar estatísticas de consultas
const queryStats = {
  totalQueries: 0,
  slowQueries: 0,
  queriesByTable: {},
  slowestQueries: [],
  startTime: new Date(),
};

/**
 * Ativa o monitoramento de consultas lentas no PostgreSQL
 */
async function enableQueryMonitoring() {
  const client = await pool.connect();
  try {
    // Verificar se pg_stat_statements está disponível
    const extensionCheck = await client.query(`
      SELECT COUNT(*) FROM pg_extension WHERE extname = 'pg_stat_statements'
    `);
    
    if (parseInt(extensionCheck.rows[0].count) === 0) {
      console.log('⚠️ Extensão pg_stat_statements não encontrada. Tentando instalar...');
      try {
        await client.query('CREATE EXTENSION pg_stat_statements');
        console.log('✅ Extensão pg_stat_statements instalada com sucesso');
      } catch (err) {
        console.log('❌ Erro ao instalar pg_stat_statements:', err.message);
        console.log('Por favor, instale manualmente a extensão pg_stat_statements');
      }
    } else {
      console.log('✅ Extensão pg_stat_statements já está instalada');
    }

    // Configurar log de consultas lentas
    await client.query(`
      ALTER SYSTEM SET log_min_duration_statement = ${SLOW_QUERY_THRESHOLD};
    `);
    
    // Recarregar configuração
    await client.query('SELECT pg_reload_conf()');
    
    console.log(`✅ Monitoramento de consultas lentas ativado (threshold: ${SLOW_QUERY_THRESHOLD}ms)`);
  } catch (err) {
    console.log('❌ Erro ao configurar monitoramento:', err);
  } finally {
    client.release();
  }
}

/**
 * Coleta estatísticas de consultas lentas
 */
async function collectQueryStats() {
  const client = await pool.connect();
  try {
    // Consultar estatísticas de consultas lentas
    const result = await client.query(`
      SELECT 
        query,
        calls,
        total_time / calls as avg_time,
        rows,
        100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent,
        regexp_replace(query, '\\s+', ' ', 'g') as normalized_query
      FROM pg_stat_statements
      WHERE total_time / calls > ${SLOW_QUERY_THRESHOLD / 1000}
      ORDER BY avg_time DESC
      LIMIT 20;
    `);

    // Atualizar estatísticas
    queryStats.totalQueries += result.rows.length;
    queryStats.slowQueries += result.rows.length;
    
    // Armazenar as consultas mais lentas
    result.rows.forEach(row => {
      // Extrair nome da tabela da consulta (simplificado)
      const tableMatch = row.query.match(/FROM\s+([^\s,;()]+)/i);
      const tableName = tableMatch ? tableMatch[1].toLowerCase() : 'unknown';
      
      // Atualizar estatísticas por tabela
      if (!queryStats.queriesByTable[tableName]) {
        queryStats.queriesByTable[tableName] = {
          count: 0,
          totalTime: 0,
        };
      }
      queryStats.queriesByTable[tableName].count++;
      queryStats.queriesByTable[tableName].totalTime += parseFloat(row.avg_time);
      
      // Adicionar à lista de consultas mais lentas
      queryStats.slowestQueries.push({
        query: row.normalized_query,
        avgTime: parseFloat(row.avg_time).toFixed(2),
        calls: parseInt(row.calls),
        rows: parseInt(row.rows),
        hitPercent: parseFloat(row.hit_percent).toFixed(2),
        table: tableName,
      });
    });
    
    // Manter apenas as 20 consultas mais lentas
    queryStats.slowestQueries.sort((a, b) => b.avgTime - a.avgTime);
    queryStats.slowestQueries = queryStats.slowestQueries.slice(0, 20);
    
    console.log(`📊 Coletadas estatísticas de ${result.rows.length} consultas lentas`);
  } catch (err) {
    console.log('❌ Erro ao coletar estatísticas:', err);
  } finally {
    client.release();
  }
}

/**
 * Gera um relatório de desempenho de consultas
 */
function generateReport() {
  const now = new Date();
  const duration = (now - queryStats.startTime) / 1000 / 60; // em minutos
  
  console.log('\n======================================================');
  console.log(`📈 RELATÓRIO DE DESEMPENHO DE CONSULTAS (${duration.toFixed(0)} minutos)`);
  console.log('======================================================');
  console.log(`Total de consultas monitoradas: ${queryStats.totalQueries}`);
  console.log(`Consultas lentas (>${SLOW_QUERY_THRESHOLD}ms): ${queryStats.slowQueries}`);
  console.log('\n📊 ESTATÍSTICAS POR TABELA:');
  console.log('------------------------------------------------------');
  
  // Ordenar tabelas por tempo total
  const sortedTables = Object.entries(queryStats.queriesByTable)
    .sort((a, b) => b[1].totalTime - a[1].totalTime);
  
  sortedTables.forEach(([table, stats]) => {
    console.log(`${table}:`);
    console.log(`  Consultas: ${stats.count}`);
    console.log(`  Tempo médio: ${(stats.totalTime / stats.count).toFixed(2)}ms`);
    console.log(`  Tempo total: ${stats.totalTime.toFixed(2)}ms`);
    console.log('------------------------------------------------------');
  });
  
  console.log('\n🐢 TOP 5 CONSULTAS MAIS LENTAS:');
  console.log('------------------------------------------------------');
  queryStats.slowestQueries.slice(0, 5).forEach((query, index) => {
    console.log(`${index + 1}. Tabela: ${query.table}`);
    console.log(`   Tempo médio: ${query.avgTime}ms`);
    console.log(`   Chamadas: ${query.calls}`);
    console.log(`   Linhas: ${query.rows}`);
    console.log(`   Hit cache: ${query.hitPercent}%`);
    console.log(`   Query: ${query.query.substring(0, 100)}...`);
    console.log('------------------------------------------------------');
  });
  
  console.log('\n💡 RECOMENDAÇÕES:');
  
  // Identificar tabelas problemáticas
  const problemTables = sortedTables
    .filter(([_, stats]) => stats.totalTime / stats.count > SLOW_QUERY_THRESHOLD)
    .map(([table]) => table);
  
  if (problemTables.length > 0) {
    console.log('1. Considere adicionar índices nas seguintes tabelas:');
    problemTables.forEach(table => console.log(`   - ${table}`));
  }
  
  // Verificar se há muitas consultas com baixo hit rate de cache
  const lowCacheHitQueries = queryStats.slowestQueries
    .filter(q => parseFloat(q.hitPercent) < 80);
  
  if (lowCacheHitQueries.length > 0) {
    console.log('2. Consultas com baixo hit rate de cache (considere otimização):');
    lowCacheHitQueries.slice(0, 3).forEach(q => {
      console.log(`   - Tabela ${q.table}: ${q.hitPercent}% hit rate`);
    });
  }
  
  console.log('\n======================================================');
}

/**
 * Função principal
 */
async function main() {
  console.log('🔍 Iniciando monitoramento de desempenho de consultas...');
  
  try {
    // Ativar monitoramento
    await enableQueryMonitoring();
    
    // Coletar estatísticas periodicamente
    setInterval(collectQueryStats, MONITORING_INTERVAL);
    
    // Gerar relatório periodicamente
    setInterval(generateReport, REPORT_INTERVAL);
    
    console.log(`✅ Monitoramento iniciado. Coletando estatísticas a cada ${MONITORING_INTERVAL/1000}s.`);
    console.log(`📊 Relatórios serão gerados a cada ${REPORT_INTERVAL/60000} minutos.`);
  } catch (err) {
    console.log('❌ Erro ao iniciar monitoramento:', err);
    process.exit(1);
  }
}

// Executar função principal
main().catch(console.log);

// Lidar com encerramento do script
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando monitoramento...');
  generateReport();
  await pool.end();
  process.exit(0);
}); 