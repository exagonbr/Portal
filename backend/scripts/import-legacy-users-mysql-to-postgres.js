/**
 * Script para importar usuários do MySQL (legado) para PostgreSQL (atual)
 * 
 * Funcionalidades:
 * - Conecta no MySQL para ler a tabela legada "user"
 * - Conecta no PostgreSQL para inserir na tabela atual "users"
 * - Converte IDs inteiros para UUIDs
 * - Armazena o ID legado no campo user_id_legacy
 * - Define todos os usuários importados com role_id de TEACHER
 * - Evita duplicatas baseado no email
 * - Gera log detalhado da migração
 */

const mysql = require('mysql2/promise');
const knex = require('knex');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Configurações do MySQL (legado)
let MYSQL_CONFIG;

try {
  // Tentar carregar configuração do arquivo
  const config = require('./mysql-config.js');
  MYSQL_CONFIG = config.mysql;
  console.log('✅ Configuração MySQL carregada do arquivo mysql-config.js');
} catch (error) {
  // Fallback para variáveis de ambiente
  MYSQL_CONFIG = {
    host: 'sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com',
    port: 3306,
    user: 'sabercon',
    password: 'gWg28m8^vffI9X#',
    database: 'sabercon',
    charset: 'utf8mb4'
  };
  console.log('⚠️  Usando configuração MySQL das variáveis de ambiente');
}

// Configurações do PostgreSQL (atual)
const knexConfig = require('../knexfile');
const pg = knex(knexConfig.development);

// Configurações
const TEACHER_ROLE_ID = '5b80c403-086b-414f-8501-10cff41fc6c3';
const DEFAULT_PASSWORD = 'password123'; // Senha padrão para usuários sem senha

async function importFromMySQLToPostgreSQL() {
  let mysqlConnection = null;
  
  try {
    console.log('🚀 Iniciando migração MySQL → PostgreSQL...');
    console.log('=' .repeat(60));
    
    // Conectar ao MySQL
    console.log('🔌 Conectando ao MySQL...');
    mysqlConnection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ Conectado ao MySQL');
    
    // Verificar se a tabela PostgreSQL existe
    const pgTableExists = await pg.schema.hasTable('users');
    if (!pgTableExists) {
      console.log('❌ Tabela "users" não encontrada no PostgreSQL.');
      console.log('   Execute as migrações primeiro.');
      process.exit(1);
    }
    
    // Verificar se o role TEACHER existe no PostgreSQL
    const teacherRole = await pg('roles').where('id', TEACHER_ROLE_ID).first();
    if (!teacherRole) {
      console.log('❌ Role TEACHER não encontrada no PostgreSQL.');
      console.log(`   Certifique-se de que existe um role com ID: ${TEACHER_ROLE_ID}`);
      process.exit(1);
    }
    
    console.log(`✅ Role TEACHER encontrada: ${teacherRole.name}`);
    
    // Verificar se a tabela MySQL existe
    try {
      const [tables] = await mysqlConnection.execute("SHOW TABLES LIKE 'user'");
      if (tables.length === 0) {
        console.log('❌ Tabela "user" não encontrada no MySQL.');
        process.exit(1);
      }
    } catch (error) {
      console.log('❌ Erro ao verificar tabela no MySQL:', error.message);
      process.exit(1);
    }
    
    // Contar registros
    const [mysqlCount] = await mysqlConnection.execute('SELECT COUNT(*) as count FROM user');
    const pgCount = await pg('users').count('id as count').first();
    
    console.log(`📊 Registros no MySQL "user": ${mysqlCount[0].count}`);
    console.log(`📊 Registros no PostgreSQL "users": ${pgCount.count}`);
    
    if (parseInt(mysqlCount[0].count) === 0) {
      console.log('⚠️  Nenhum usuário encontrado na tabela MySQL.');
      process.exit(0);
    }
    
    // Obter todos os usuários do MySQL
    console.log('\n📥 Carregando usuários do MySQL...');
    const [mysqlUsers] = await mysqlConnection.execute('SELECT * FROM user');
    
    console.log(`✅ ${mysqlUsers.length} usuários carregados do MySQL`);
    
    // Estatísticas da migração
    let stats = {
      total: mysqlUsers.length,
      imported: 0,
      skipped: 0,
      errors: 0
    };
    
    // Mapeamento de IDs legados para novos UUIDs
    const idMapping = {};
    const errors = [];
    
    console.log('\n🔄 Iniciando processo de migração...');
    console.log('-'.repeat(60));
    
    // Usar transação no PostgreSQL para garantir consistência
    await pg.transaction(async (trx) => {
      for (let i = 0; i < mysqlUsers.length; i++) {
        const mysqlUser = mysqlUsers[i];
        
        try {
          // Verificar se já existe um usuário com este email no PostgreSQL
          const existingUser = await trx('users').where('email', mysqlUser.email).first();
          
          if (existingUser) {
            console.log(`⏭️  Usuário já existe: ${mysqlUser.email}`);
            stats.skipped++;
            continue;
          }
          
          // Verificar se já existe um usuário com este user_id_legacy
          const existingLegacyUser = await trx('users').where('user_id_legacy', mysqlUser.id).first();
          
          if (existingLegacyUser) {
            console.log(`⏭️  Usuário com ID legado ${mysqlUser.id} já migrado`);
            stats.skipped++;
            continue;
          }
          
          // Gerar novo UUID
          const newId = uuidv4();
          idMapping[mysqlUser.id] = newId;
          
          // Preparar senha
          let hashedPassword;
          if (mysqlUser.password && mysqlUser.password.startsWith('$2')) {
            // Senha já está hasheada
            hashedPassword = mysqlUser.password;
          } else if (mysqlUser.password) {
            // Hashear senha existente
            hashedPassword = await bcrypt.hash(mysqlUser.password, 12);
          } else {
            // Usar senha padrão
            hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);
          }
          
          // Mapear campos do MySQL para PostgreSQL
          const newUser = {
            id: newId,
            email: mysqlUser.email || `user${mysqlUser.id}@legado.com`,
            password: hashedPassword,
            name: mysqlUser.full_name || `Usuário ${mysqlUser.id}`,
            cpf: mysqlUser.cpf || null,
            phone: mysqlUser.phone || mysqlUser.telefone || null,
            birth_date: mysqlUser.birth_date || mysqlUser.data_nascimento || null,
            address: mysqlUser.address || mysqlUser.endereco || null,
            city: mysqlUser.city || mysqlUser.cidade || null,
            state: mysqlUser.state || mysqlUser.estado || null,
            zip_code: mysqlUser.zip_code || mysqlUser.cep || null,
            is_active: mysqlUser.is_active !== undefined ? Boolean(mysqlUser.is_active) : 
                      mysqlUser.ativo !== undefined ? Boolean(mysqlUser.ativo) : true,
            role_id: TEACHER_ROLE_ID, // Todos como TEACHER conforme solicitado
            institution_id: mysqlUser.institution_id || null,
            school_id: mysqlUser.school_id || null,
            user_id_legacy: mysqlUser.id, // Armazenar ID legado do MySQL
            created_at: mysqlUser.created_at || mysqlUser.data_criacao || new Date(),
            updated_at: mysqlUser.updated_at || mysqlUser.data_atualizacao || new Date()
          };
          
          // Inserir o novo usuário no PostgreSQL
          await trx('users').insert(newUser);
          
          stats.imported++;
          
          // Log de progresso
          if (stats.imported % 50 === 0) {
            console.log(`📈 Progresso: ${stats.imported}/${stats.total} usuários migrados`);
          }
          
        } catch (error) {
          stats.errors++;
          const errorInfo = {
            mysqlId: mysqlUser.id,
            email: mysqlUser.email,
            error: error.message
          };
          errors.push(errorInfo);
          console.log(`❌ Erro ao migrar usuário ${mysqlUser.id} (${mysqlUser.email}): ${error.message}`);
        }
      }
    });
    
    // Contar registros após a migração
    const finalCount = await pg('users').count('id as count').first();
    
    // Salvar mapeamento de IDs e relatório de erros
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    if (Object.keys(idMapping).length > 0) {
      const mappingFile = `mysql_to_postgres_id_mapping_${timestamp}.json`;
      fs.writeFileSync(mappingFile, JSON.stringify(idMapping, null, 2));
      console.log(`💾 Mapeamento de IDs salvo em: ${mappingFile}`);
    }
    
    if (errors.length > 0) {
      const errorsFile = `mysql_to_postgres_errors_${timestamp}.json`;
      fs.writeFileSync(errorsFile, JSON.stringify(errors, null, 2));
      console.log(`📋 Relatório de erros salvo em: ${errorsFile}`);
    }
    
    // Relatório final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL DA MIGRAÇÃO');
    console.log('='.repeat(60));
    console.log(`🔄 Origem: MySQL (${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}/${MYSQL_CONFIG.database})`);
    console.log(`🎯 Destino: PostgreSQL`);
    console.log(`✅ Usuários migrados com sucesso: ${stats.imported}`);
    console.log(`⏭️  Usuários ignorados (duplicados): ${stats.skipped}`);
    console.log(`❌ Erros durante a migração: ${stats.errors}`);
    console.log(`📈 Total de usuários no PostgreSQL: ${finalCount.count}`);
    console.log(`🎯 Role definida para todos: TEACHER (${TEACHER_ROLE_ID})`);
    
    if (stats.imported > 0) {
      console.log('\n✨ Migração concluída com sucesso!');
      console.log('📝 Próximos passos recomendados:');
      console.log('   1. Verificar os usuários migrados no sistema PostgreSQL');
      console.log('   2. Notificar os usuários sobre suas credenciais');
      console.log('   3. Configurar instituições e escolas se necessário');
      console.log(`   4. Senha padrão para usuários sem senha: ${DEFAULT_PASSWORD}`);
      console.log('   5. Considerar desativar acesso ao MySQL legado');
    }
    
  } catch (error) {
    console.log(`💥 Erro crítico durante a migração: ${error.message}`);
    console.log(error.stack);
    process.exit(1);
  } finally {
    // Fechar conexões
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log('🔌 Conexão MySQL fechada');
    }
    await pg.destroy();
    console.log('🔌 Conexão PostgreSQL fechada');
  }
}

// Executar o script
if (require.main === module) {
  importFromMySQLToPostgreSQL()
    .then(() => {
      console.log('\n🎉 Script de migração executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.log('\n💥 Falha na execução da migração:', error.message);
      process.exit(1);
    });
}

module.exports = { importFromMySQLToPostgreSQL }; 