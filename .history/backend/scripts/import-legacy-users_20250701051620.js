/**
 * Script para importar usuários da tabela legada "user" para a tabela atual "users"
 * 
 * Funcionalidades:
 * - Converte IDs inteiros da tabela legada para UUIDs na tabela atual
 * - Armazena o ID legado no campo user_id_legacy
 * - Define todos os usuários importados com role_id de TEACHER
 * - Evita duplicatas baseado no email
 * - Gera log detalhado da importação
 */

const knex = require('knex');
const knexConfig = require('../knexfile');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const db = knex(knexConfig.development);

// Configurações
const TEACHER_ROLE_ID = '5b80c403-086b-414f-8501-10cff41fc6c3';
const DEFAULT_PASSWORD = 'senha123'; // Senha padrão para usuários sem senha

async function importLegacyUsers() {
  try {
    console.log('🚀 Iniciando importação de usuários legados...');
    console.log('=' .repeat(60));
    
    // Verificar se as tabelas existem
    const legacyTableExists = await db.schema.hasTable('user');
    if (!legacyTableExists) {
      console.log('❌ Tabela legada "user" não encontrada.');
      console.log('   Certifique-se de que a tabela existe no banco de dados.');
      process.exit(1);
    }
    
    const currentTableExists = await db.schema.hasTable('users');
    if (!currentTableExists) {
      console.log('❌ Tabela atual "users" não encontrada.');
      console.log('   Execute as migrações primeiro.');
      process.exit(1);
    }
    
    // Verificar se o role TEACHER existe
    const teacherRole = await db('roles').where('id', TEACHER_ROLE_ID).first();
    if (!teacherRole) {
      console.log('❌ Role TEACHER não encontrada.');
      console.log(`   Certifique-se de que existe um role com ID: ${TEACHER_ROLE_ID}`);
      process.exit(1);
    }
    
    console.log(`✅ Role TEACHER encontrada: ${teacherRole.name}`);
    
    // Contar registros antes da importação
    const legacyCount = await db('user').count('id as count').first();
    const currentCount = await db('users').count('id as count').first();
    
    console.log(`📊 Registros na tabela legada "user": ${legacyCount.count}`);
    console.log(`📊 Registros na tabela atual "users": ${currentCount.count}`);
    
    if (parseInt(legacyCount.count) === 0) {
      console.log('⚠️  Nenhum usuário encontrado na tabela legada.');
      process.exit(0);
    }
    
    // Obter todos os usuários da tabela legada
    console.log('\n📥 Carregando usuários da tabela legada...');
    const legacyUsers = await db('user').select('*');
    
    console.log(`✅ ${legacyUsers.length} usuários carregados da tabela legada`);
    
    // Estatísticas da importação
    let stats = {
      total: legacyUsers.length,
      imported: 0,
      skipped: 0,
      errors: 0
    };
    
    // Mapeamento de IDs legados para novos UUIDs
    const idMapping = {};
    const errors = [];
    
    console.log('\n🔄 Iniciando processo de importação...');
    console.log('-'.repeat(60));
    
    // Usar transação para garantir consistência
    await db.transaction(async (trx) => {
      for (let i = 0; i < legacyUsers.length; i++) {
        const legacyUser = legacyUsers[i];
        
        try {
          // Verificar se já existe um usuário com este email
          const existingUser = await trx('users').where('email', legacyUser.email).first();
          
          if (existingUser) {
            console.log(`⏭️  Usuário já existe: ${legacyUser.email}`);
            stats.skipped++;
            continue;
          }
          
          // Verificar se já existe um usuário com este user_id_legacy
          const existingLegacyUser = await trx('users').where('user_id_legacy', legacyUser.id).first();
          
          if (existingLegacyUser) {
            console.log(`⏭️  Usuário com ID legado ${legacyUser.id} já importado`);
            stats.skipped++;
            continue;
          }
          
          // Gerar novo UUID
          const newId = uuidv4();
          idMapping[legacyUser.id] = newId;
          
          // Preparar senha
          let hashedPassword;
          if (legacyUser.password && legacyUser.password.startsWith('$2')) {
            // Senha já está hasheada
            hashedPassword = legacyUser.password;
          } else if (legacyUser.password) {
            // Hashear senha existente
            hashedPassword = await bcrypt.hash(legacyUser.password, 12);
          } else {
            // Usar senha padrão
            hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);
          }
          
          // Mapear campos da tabela legada para a atual
          const newUser = {
            id: newId,
            email: legacyUser.email || `user${legacyUser.id}@legado.com`,
            password: hashedPassword,
            name: legacyUser.full_name || `Usuário ${legacyUser.id}`,
            cpf: legacyUser.cpf || null,
            phone: legacyUser.phone || legacyUser.telefone || null,
            birth_date: legacyUser.birth_date || legacyUser.data_nascimento || null,
            address: legacyUser.address || legacyUser.endereco || null,
            city: legacyUser.city || legacyUser.cidade || null,
            state: legacyUser.state || legacyUser.estado || null,
            zip_code: legacyUser.zip_code || legacyUser.cep || null,
            is_active: legacyUser.is_active !== undefined ? Boolean(legacyUser.is_active) : true,
            role_id: TEACHER_ROLE_ID, // Todos como TEACHER conforme solicitado
            institution_id: legacyUser.institution_id || null,
            school_id: legacyUser.school_id || null,
            user_id_legacy: legacyUser.id, // Armazenar ID legado
            created_at: legacyUser.created_at || new Date(),
            updated_at: legacyUser.updated_at || new Date()
          };
          
          // Inserir o novo usuário
          await trx('users').insert(newUser);
          
          stats.imported++;
          
          // Log de progresso
          if (stats.imported % 50 === 0) {
            console.log(`📈 Progresso: ${stats.imported}/${stats.total} usuários importados`);
          }
          
        } catch (error) {
          stats.errors++;
          const errorInfo = {
            legacyId: legacyUser.id,
            email: legacyUser.email,
            error: error.message
          };
          errors.push(errorInfo);
          console.log(`❌ Erro ao importar usuário ${legacyUser.id} (${legacyUser.email}): ${error.message}`);
        }
      }
    });
    
    // Contar registros após a importação
    const finalCount = await db('users').count('id as count').first();
    
    // Salvar mapeamento de IDs e relatório de erros
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    if (Object.keys(idMapping).length > 0) {
      const mappingFile = `id_mapping_legacy_to_uuid_${timestamp}.json`;
      fs.writeFileSync(mappingFile, JSON.stringify(idMapping, null, 2));
      console.log(`💾 Mapeamento de IDs salvo em: ${mappingFile}`);
    }
    
    if (errors.length > 0) {
      const errorsFile = `import_errors_${timestamp}.json`;
      fs.writeFileSync(errorsFile, JSON.stringify(errors, null, 2));
      console.log(`📋 Relatório de erros salvo em: ${errorsFile}`);
    }
    
    // Relatório final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL DA IMPORTAÇÃO');
    console.log('='.repeat(60));
    console.log(`✅ Usuários importados com sucesso: ${stats.imported}`);
    console.log(`⏭️  Usuários ignorados (duplicados): ${stats.skipped}`);
    console.log(`❌ Erros durante a importação: ${stats.errors}`);
    console.log(`📈 Total de usuários na tabela atual: ${finalCount.count}`);
    console.log(`🎯 Role definida para todos: TEACHER (${TEACHER_ROLE_ID})`);
    
    if (stats.imported > 0) {
      console.log('\n✨ Importação concluída com sucesso!');
      console.log('📝 Próximos passos recomendados:');
      console.log('   1. Verificar os usuários importados no sistema');
      console.log('   2. Notificar os usuários sobre suas credenciais');
      console.log('   3. Configurar instituições e escolas se necessário');
      console.log(`   4. Senha padrão para usuários sem senha: ${DEFAULT_PASSWORD}`);
    }
    
  } catch (error) {
    console.log(`💥 Erro crítico durante a importação: ${error.message}`);
    console.log(error.stack);
    process.exit(1);
  } finally {
    // Fechar conexão com o banco
    await db.destroy();
  }
}

// Executar o script
if (require.main === module) {
  importLegacyUsers()
    .then(() => {
      console.log('\n🎉 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.log('\n💥 Falha na execução do script:', error.message);
      process.exit(1);
    });
}

module.exports = { importLegacyUsers }; 