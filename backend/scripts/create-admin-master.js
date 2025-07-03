#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const knex = require('knex');
const path = require('path');
require('dotenv').config();

console.log('👑 CRIANDO ADMIN MASTER - PORTAL EDUCACIONAL');
console.log('='.repeat(50));

// Configuração do banco PostgreSQL
const dbConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'portal_sabercon'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};

// Dados do Admin Master
const ADMIN_DATA = {
  email: 'maia.cspg@gmail.com',
  password: 'maia.cspg@gmail.com',
  name: 'Admin Master',
  role: 'admin_master'
};

async function createAdminMaster() {
  let db;
  
  try {
    console.log('🔌 Conectando ao PostgreSQL...');
    db = knex(dbConfig);
    
    // Testar conexão
    await db.raw('SELECT 1');
    console.log('✅ Conexão com PostgreSQL estabelecida');

    // Verificar se usuário já existe
    console.log('\n🔍 Verificando se admin já existe...');
    const existingUser = await db('users')
      .where('email', ADMIN_DATA.email)
      .first();

    if (existingUser) {
      console.log('⚠️  Admin com email já existe. Atualizando dados...');
      
      // Atualizar usuário existente
      const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 12);
      
      await db('users')
        .where('email', ADMIN_DATA.email)
        .update({
          name: ADMIN_DATA.name,
          password: hashedPassword,
          role: ADMIN_DATA.role,
          is_active: true,
          is_verified: true,
          updated_at: new Date(),
          // Campos específicos para admin master
          permissions: JSON.stringify([
            'admin_master',
            'user_management',
            'institution_management',
            'content_management',
            'analytics_access',
            'system_settings',
            'backup_restore',
            'migration_control'
          ])
        });

      console.log('✅ Admin Master atualizado com sucesso!');
      
    } else {
      console.log('➕ Criando novo Admin Master...');
      
      // Hash da senha
      const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 12);
      const userId = uuidv4();
      
      // Criar novo usuário admin
      await db('users').insert({
        id: userId,
        email: ADMIN_DATA.email,
        name: ADMIN_DATA.name,
        password: hashedPassword,
        role: ADMIN_DATA.role,
        is_active: true,
        is_verified: true,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        // Campos específicos para admin master
        permissions: JSON.stringify([
          'admin_master',
          'user_management', 
          'institution_management',
          'content_management',
          'analytics_access',
          'system_settings',
          'backup_restore',
          'migration_control'
        ]),
        // Metadados do admin
        metadata: JSON.stringify({
          admin_level: 'master',
          created_by: 'system',
          admin_notes: 'Admin Master criado via script de inicialização',
          access_level: 'unlimited'
        })
      });

      console.log('✅ Admin Master criado com sucesso!');
      
      // Criar perfil de usuário se a tabela existir
      try {
        const profileExists = await db.schema.hasTable('user_profiles');
        
        if (profileExists) {
          const existingProfile = await db('user_profiles')
            .where('user_id', userId)
            .first();
            
          if (!existingProfile) {
            await db('user_profiles').insert({
              id: uuidv4(),
              user_id: userId,
              bio: 'Administrador Master do Portal Educacional',
              avatar_url: null,
              phone: null,
              address: null,
              preferences: JSON.stringify({
                theme: 'dark',
                language: 'pt-BR',
                notifications: {
                  email: true,
                  push: true,
                  sms: false
                },
                dashboard: {
                  layout: 'admin',
                  widgets: ['users', 'content', 'analytics', 'system']
                }
              }),
              created_at: new Date(),
              updated_at: new Date()
            });
            
            console.log('✅ Perfil do Admin Master criado');
          }
        }
      } catch (error) {
        console.log('⚠️  Aviso: Não foi possível criar perfil (tabela pode não existir)');
      }
    }

    // Verificar se tabela de sessions existe e limpar sessions antigas se necessário
    try {
      const sessionsExists = await db.schema.hasTable('user_sessions');
      if (sessionsExists) {
        await db('user_sessions')
          .where('user_id', '=', db('users').select('id').where('email', ADMIN_DATA.email))
          .del();
        console.log('✅ Sessions antigas do admin limpas');
      }
    } catch (error) {
      console.log('⚠️  Aviso: Não foi possível limpar sessions (tabela pode não existir)');
    }

    // Verificar e exibir informações finais
    console.log('\n📋 INFORMAÇÕES DO ADMIN MASTER:');
    console.log('='.repeat(50));
    
    const adminUser = await db('users')
      .where('email', ADMIN_DATA.email)
      .select('id', 'email', 'name', 'role', 'is_active', 'created_at', 'permissions')
      .first();

    if (adminUser) {
      console.log(`👤 ID: ${adminUser.id}`);
      console.log(`📧 Email: ${adminUser.email}`);
      console.log(`👨‍💼 Nome: ${adminUser.name}`);
      console.log(`🔑 Role: ${adminUser.role}`);
      console.log(`✅ Ativo: ${adminUser.is_active}`);
      console.log(`📅 Criado em: ${adminUser.created_at}`);
      
      if (adminUser.permissions) {
        const permissions = JSON.parse(adminUser.permissions);
        console.log(`🛡️  Permissões: ${permissions.join(', ')}`);
      }
    }

    console.log('\n🎯 CREDENCIAIS DE ACESSO:');
    console.log('='.repeat(50));
    console.log(`📧 Email: ${ADMIN_DATA.email}`);
    console.log(`🔐 Senha: ${ADMIN_DATA.password}`);
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('='.repeat(50));
    console.log('1. Acesse o portal usando as credenciais acima');
    console.log('2. Altere a senha após o primeiro login');
    console.log('3. Configure as instituições e usuários');
    console.log('4. Verifique as permissões do sistema');
    console.log('5. Configure integrações necessárias');

    console.log('\n✅ Admin Master configurado com sucesso! 👑');

  } catch (error) {
    console.error('\n❌ Erro ao criar Admin Master:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 DICAS PARA RESOLVER:');
      console.log('1. Verifique se o PostgreSQL está rodando');
      console.log('2. Confirme as credenciais no arquivo .env');
      console.log('3. Teste a conexão: psql -h localhost -U postgres -d portal_educacional');
    } else if (error.code === '42P01') {
      console.log('\n💡 TABELA NÃO ENCONTRADA:');
      console.log('1. Execute as migrations: npm run migrate');
      console.log('2. Verifique se a migração dos dados foi concluída');
      console.log('3. Confirme se está no banco correto');
    }
    
    process.exit(1);
  } finally {
    if (db) {
      await db.destroy();
      console.log('\n🔌 Conexão fechada');
    }
  }
}

// Função para verificar pré-requisitos
async function checkPrerequisites() {
  console.log('🔍 Verificando pré-requisitos...\n');

  // Verificar variáveis de ambiente
  const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('⚠️  Variáveis de ambiente faltando:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\n💡 Configuração padrão será utilizada');
  } else {
    console.log('✅ Variáveis de ambiente configuradas');
  }

  // Verificar se bcryptjs está instalado
  try {
    require('bcryptjs');
    console.log('✅ bcryptjs disponível');
  } catch (error) {
    console.log('❌ bcryptjs não encontrado. Execute: npm install bcryptjs');
    process.exit(1);
  }

  // Verificar se uuid está instalado
  try {
    require('uuid');
    console.log('✅ uuid disponível');
  } catch (error) {
    console.log('❌ uuid não encontrado. Execute: npm install uuid');
    process.exit(1);
  }

  console.log('✅ Pré-requisitos verificados\n');
}

// Executar script
async function main() {
  try {
    await checkPrerequisites();
    await createAdminMaster();
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { createAdminMaster }; 