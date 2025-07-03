/**
 * Script para testar conexões MySQL e PostgreSQL antes da migração
 * 
 * Este script verifica:
 * - Conectividade com MySQL
 * - Conectividade com PostgreSQL
 * - Existência das tabelas necessárias
 * - Existência dos roles necessários
 * - Contagem de registros
 */

const mysql = require('mysql2/promise');
const knex = require('knex');

// Configurações do MySQL
let MYSQL_CONFIG;
try {
  const config = require('./mysql-config.js');
  MYSQL_CONFIG = config.mysql;
} catch (error) {
  MYSQL_CONFIG = {
    host: 'sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com',
    port: 3306,
    user: 'sabercon',
    password: 'gWg28m8^vffI9X#',
    database: 'sabercon',
    charset: 'utf8mb4'
  };
}

// Configurações do PostgreSQL
const knexConfig = require('../knexfile');
const pg = knex(knexConfig.development);

const TEACHER_ROLE_ID = '5b80c403-086b-414f-8501-10cff41fc6c3';

async function testConnections() {
  let mysqlConnection = null;
  let mysqlOk = false;
  let postgresOk = false;
  
  console.log('🔍 Testando conexões para migração MySQL → PostgreSQL');
  console.log('=' .repeat(60));
  
  // Teste MySQL
  try {
    console.log('\n📡 TESTANDO MYSQL');
    console.log('-'.repeat(30));
    console.log(`Host: ${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}`);
    console.log(`Database: ${MYSQL_CONFIG.database}`);
    console.log(`User: ${MYSQL_CONFIG.user}`);
    
    mysqlConnection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ Conexão MySQL estabelecida');
    
    // Verificar versão
    const [version] = await mysqlConnection.execute('SELECT VERSION() as version');
    console.log(`📋 Versão MySQL: ${version[0].version}`);
    
    // Verificar se a tabela user existe
    const [tables] = await mysqlConnection.execute("SHOW TABLES LIKE 'user'");
    if (tables.length > 0) {
      console.log('✅ Tabela "user" encontrada');
      
      // Contar registros
      const [count] = await mysqlConnection.execute('SELECT COUNT(*) as count FROM user');
      console.log(`📊 Registros na tabela "user": ${count[0].count}`);
      
      // Mostrar estrutura da tabela
      const [structure] = await mysqlConnection.execute('DESCRIBE user');
      console.log('📋 Estrutura da tabela "user":');
      structure.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
      });
      
      // Mostrar alguns exemplos
      const [samples] = await mysqlConnection.execute('SELECT id, email, full_name FROM user LIMIT 3');
      if (samples.length > 0) {
        console.log('📋 Exemplos de registros:');
        samples.forEach(sample => {
          console.log(`   - ID: ${sample.id}, Email: ${sample.email}, Nome: ${sample.full_name || 'N/A'}`);
        });
      }
      
      mysqlOk = true;
    } else {
      console.log('❌ Tabela "user" não encontrada');
    }
    
  } catch (error) {
    console.log(`❌ Erro MySQL: ${error.message}`);
  }
  
  // Teste PostgreSQL
  try {
    console.log('\n📡 TESTANDO POSTGRESQL');
    console.log('-'.repeat(30));
    
    // Verificar conexão
    await pg.raw('SELECT 1');
    console.log('✅ Conexão PostgreSQL estabelecida');
    
    // Verificar versão
    const version = await pg.raw('SELECT version()');
    console.log(`📋 Versão PostgreSQL: ${version.rows[0].version.split(' ')[1]}`);
    
    // Verificar se a tabela users existe
    const tableExists = await pg.schema.hasTable('users');
    if (tableExists) {
      console.log('✅ Tabela "users" encontrada');
      
      // Contar registros
      const count = await pg('users').count('id as count').first();
      console.log(`📊 Registros na tabela "users": ${count.count}`);
      
      // Verificar estrutura da tabela
      const columns = await pg('information_schema.columns')
        .select('column_name', 'data_type', 'is_nullable')
        .where('table_name', 'users')
        .orderBy('ordinal_position');
      
      console.log('📋 Estrutura da tabela "users":');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
      });
      
    } else {
      console.log('❌ Tabela "users" não encontrada');
    }
    
    // Verificar se a tabela roles existe
    const rolesTableExists = await pg.schema.hasTable('roles');
    if (rolesTableExists) {
      console.log('✅ Tabela "roles" encontrada');
      
      // Verificar se o role TEACHER existe
      const teacherRole = await pg('roles').where('id', TEACHER_ROLE_ID).first();
      if (teacherRole) {
        console.log(`✅ Role TEACHER encontrada: ${teacherRole.name}`);
      } else {
        console.log('❌ Role TEACHER não encontrada');
        
        // Mostrar roles disponíveis
        const roles = await pg('roles').select('id', 'name').limit(5);
        console.log('📋 Roles disponíveis:');
        roles.forEach(role => {
          console.log(`   - ${role.name} (${role.id})`);
        });
      }
    } else {
      console.log('❌ Tabela "roles" não encontrada');
    }
    
    postgresOk = tableExists && rolesTableExists;
    
  } catch (error) {
    console.log(`❌ Erro PostgreSQL: ${error.message}`);
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO DE CONECTIVIDADE');
  console.log('='.repeat(60));
  console.log(`MySQL: ${mysqlOk ? '✅ OK' : '❌ FALHA'}`);
  console.log(`PostgreSQL: ${postgresOk ? '✅ OK' : '❌ FALHA'}`);
  
  if (mysqlOk && postgresOk) {
    console.log('\n🎉 Todas as verificações passaram!');
    console.log('✨ Você pode executar a migração com segurança:');
    console.log('   node scripts/import-legacy-users-mysql-to-postgres.js');
  } else {
    console.log('\n⚠️  Algumas verificações falharam.');
    console.log('📝 Resolva os problemas antes de executar a migração.');
    
    if (!mysqlOk) {
      console.log('\n🔧 Para resolver problemas MySQL:');
      console.log('   1. Verifique se o MySQL está rodando');
      console.log('   2. Confirme as credenciais de conexão');
      console.log('   3. Verifique se a tabela "user" existe');
      console.log('   4. Configure mysql-config.js ou variáveis de ambiente');
    }
    
    if (!postgresOk) {
      console.log('\n🔧 Para resolver problemas PostgreSQL:');
      console.log('   1. Execute as migrações: npm run migrate');
      console.log('   2. Execute os seeds: npm run seed');
      console.log('   3. Verifique o knexfile.js');
    }
  }
  
  // Cleanup
  if (mysqlConnection) {
    await mysqlConnection.end();
  }
  await pg.destroy();
  
  process.exit(mysqlOk && postgresOk ? 0 : 1);
}

// Executar teste
if (require.main === module) {
  testConnections()
    .catch((error) => {
      console.error('\n💥 Erro durante o teste:', error.message);
      process.exit(1);
    });
}

module.exports = { testConnections }; 