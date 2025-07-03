const { Client } = require('pg');
require('dotenv').config();

// Configuração do banco de dados (usando as mesmas configurações do projeto)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || 'root'),
  database: process.env.DB_NAME || 'portal_sabercon',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

async function debugVideoCount() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('🔗 Conectado ao banco de dados');
    
    // 1. Verificar estrutura da tabela video
    console.log('\n📋 ESTRUTURA DA TABELA VIDEO:');
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'video' 
      ORDER BY ordinal_position;
    `);
    console.table(tableStructure.rows);
    
    // 2. Contar total de registros na tabela video
    console.log('\n📊 CONTAGEM GERAL DA TABELA VIDEO:');
    const totalVideos = await client.query('SELECT COUNT(*) as total FROM video');
    console.log(`Total de registros na tabela video: ${totalVideos.rows[0].total}`);
    
    // 3. Verificar valores da coluna deleted
    console.log('\n🗑️ ANÁLISE DA COLUNA DELETED:');
    const deletedAnalysis = await client.query(`
      SELECT 
        deleted,
        COUNT(*) as count
      FROM video
      GROUP BY deleted
      ORDER BY count DESC;
    `);
    console.table(deletedAnalysis.rows);
    
    // 4. Verificar valores da coluna show_id
    console.log('\n🔗 ANÁLISE DA COLUNA SHOW_ID:');
    const showIdAnalysis = await client.query(`
      SELECT 
        CASE 
          WHEN show_id IS NULL THEN 'NULL'
          ELSE 'NOT NULL'
        END as show_id_status,
        COUNT(*) as count
      FROM video
      GROUP BY show_id IS NULL
      ORDER BY count DESC;
    `);
    console.table(showIdAnalysis.rows);
    
    // 5. Contar vídeos por show_id (top 20)
    console.log('\n📈 TOP 20 COLEÇÕES COM MAIS VÍDEOS:');
    const topCollections = await client.query(`
      SELECT 
        v.show_id,
        ts.name as collection_name,
        COUNT(v.id) as video_count
      FROM video v
      LEFT JOIN tv_show ts ON v.show_id = ts.id
      WHERE v.deleted IS NULL OR v.deleted = false OR v.deleted = 0
      GROUP BY v.show_id, ts.name
      ORDER BY video_count DESC
      LIMIT 20;
    `);
    console.table(topCollections.rows);
    
    // 6. Verificar se há duplicatas suspeitas
    console.log('\n🔍 VERIFICAÇÃO DE POSSÍVEIS DUPLICATAS:');
    const duplicateCheck = await client.query(`
      SELECT 
        show_id,
        title,
        COUNT(*) as duplicate_count
      FROM video
      WHERE (deleted IS NULL OR deleted = false OR deleted = 0)
      AND show_id IS NOT NULL
      GROUP BY show_id, title
      HAVING COUNT(*) > 1
      ORDER BY duplicate_count DESC
      LIMIT 10;
    `);
    
    if (duplicateCheck.rows.length > 0) {
      console.log('⚠️ Possíveis duplicatas encontradas:');
      console.table(duplicateCheck.rows);
    } else {
      console.log('✅ Nenhuma duplicata óbvia encontrada');
    }
    
    // 7. Verificar IDs suspeitos (muito altos ou negativos)
    console.log('\n🆔 ANÁLISE DE IDs SUSPEITOS:');
    const idAnalysis = await client.query(`
      SELECT 
        MIN(id) as min_id,
        MAX(id) as max_id,
        AVG(id) as avg_id,
        COUNT(DISTINCT id) as unique_ids,
        COUNT(*) as total_records
      FROM video;
    `);
    console.table(idAnalysis.rows);
    
    // 8. Query exata que está sendo usada no service
    console.log('\n🔍 RESULTADO DA QUERY ATUAL DO SERVICE:');
    const serviceQuery = await client.query(`
      SELECT 
        ts.id as tv_show_id,
        ts.name as tv_show_name,
        COALESCE(v.video_count, 0) as video_count
      FROM tv_show ts
      LEFT JOIN (
        SELECT show_id, COUNT(DISTINCT id) as video_count
        FROM video
        WHERE (deleted IS NULL OR deleted = false OR deleted = 0)
        AND show_id IS NOT NULL
        GROUP BY show_id
      ) v ON ts.id = v.show_id
      WHERE (ts.deleted IS NULL OR ts.deleted = false OR ts.deleted = 0)
      ORDER BY v.video_count DESC NULLS LAST
      LIMIT 10;
    `);
    console.table(serviceQuery.rows);
    
    // 9. Calcular total geral
    const totalVideoCount = serviceQuery.rows.reduce((sum, row) => sum + parseInt(row.video_count || 0), 0);
    console.log(`\n📊 TOTAL CALCULADO: ${totalVideoCount} vídeos`);
    
    if (totalVideoCount > 100000) {
      console.log('🚨 ALERTA: Valor suspeito detectado! Investigar dados corrompidos.');
    }
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
  } finally {
    await client.end();
    console.log('🔚 Conexão fechada');
  }
}

// Executar diagnóstico
debugVideoCount().catch(console.error); 