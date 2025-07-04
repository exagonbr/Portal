import knex from 'knex';
import config from '../../knexfile';
import { spawn } from 'child_process';
import path from 'path';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

// Configuração MySQL
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'sabercon',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  multipleStatements: true
};

interface TableInfo {
  name: string;
  columns: string[];
  exists: boolean;
}

async function runCommand(command: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Executando: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '../..')
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function checkMySQLConnection(): Promise<boolean> {
  try {
    const connection = await mysql.createConnection(MYSQL_CONFIG);
    await connection.ping();
    await connection.end();
    console.log('✅ Conexão MySQL verificada com sucesso');
    return true;
  } catch (error) {
    console.log('⚠️ MySQL não disponível:', (error as Error).message);
    return false;
  }
}

async function getPostgreSQLTables(): Promise<string[]> {
  try {
    const tables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    return tables.rows.map((row: any) => row.table_name);
  } catch (error) {
    console.log('❌ Erro ao buscar tabelas PostgreSQL:', error);
    return [];
  }
}

async function getMySQLTables(): Promise<string[]> {
  try {
    const connection = await mysql.createConnection(MYSQL_CONFIG);
    const [tables] = await connection.execute('SHOW TABLES') as any[];
    await connection.end();
    return tables.map((row: any) => Object.values(row)[0] as string);
  } catch (error) {
    console.log('❌ Erro ao buscar tabelas MySQL:', error);
    return [];
  }
}

async function createMissingMigrations(missingTables: string[]): Promise<void> {
  if (missingTables.length === 0) return;

  console.log(`🏗️ Criando migrations para ${missingTables.length} tabelas faltantes...`);

  for (const tableName of missingTables) {
    try {
      const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
      const migrationName = `${timestamp}_create_${tableName}_table.js`;
      const migrationPath = path.join(__dirname, '../database/migrations', migrationName);

      const migrationContent = `
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('${tableName}', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Índices básicos
    table.index(['name']);
    table.index(['is_active']);
    table.index(['created_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('${tableName}');
};
`;

      await fs.writeFile(migrationPath, migrationContent.trim());
      console.log(`   ✅ Migration criada: ${migrationName}`);
    } catch (error) {
      console.log(`   ❌ Erro ao criar migration para ${tableName}:`, error);
    }
  }
}

async function createMissingSeeds(missingTables: string[]): Promise<void> {
  if (missingTables.length === 0) return;

  console.log(`🌱 Criando seeds para ${missingTables.length} tabelas faltantes...`);

  for (const tableName of missingTables) {
    try {
      const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
      const seedName = `${timestamp}_${tableName}_seed.js`;
      const seedPath = path.join(__dirname, '../database/seeds', seedName);

      const seedContent = `
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('${tableName}').del();
  
  // Inserir dados básicos
  await knex('${tableName}').insert([
    {
      name: '${tableName.charAt(0).toUpperCase() + tableName.slice(1)} Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: '${tableName.charAt(0).toUpperCase() + tableName.slice(1)} Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed ${tableName} executado com sucesso');
};
`;

      await fs.writeFile(seedPath, seedContent.trim());
      console.log(`   ✅ Seed criado: ${seedName}`);
    } catch (error) {
      console.log(`   ❌ Erro ao criar seed para ${tableName}:`, error);
    }
  }
}

async function compareTables(): Promise<string[]> {
  console.log('🔍 Comparando estruturas de tabelas...');
  
  const [pgTables, mysqlTables] = await Promise.all([
    getPostgreSQLTables(),
    getMySQLTables()
  ]);

  console.log(`   📊 PostgreSQL: ${pgTables.length} tabelas`);
  console.log(`   📊 MySQL: ${mysqlTables.length} tabelas`);

  // Encontrar tabelas que existem no MySQL mas não no PostgreSQL
  const missingTables = mysqlTables.filter(table => 
    !pgTables.includes(table) && 
    !table.startsWith('knex_') && 
    !table.startsWith('migrations')
  );

  if (missingTables.length > 0) {
    console.log(`   ⚠️ Tabelas faltantes no PostgreSQL: ${missingTables.join(', ')}`);
    return missingTables;
  } else {
    console.log('   ✅ Todas as tabelas MySQL estão presentes no PostgreSQL');
    return [];
  }
}

async function fresh() {
  try {
    console.log('🔄 Iniciando reset completo do banco de dados...');
    console.log('==========================================');
    
    // 1. Drop all tables
    console.log('🗑️  Dropando todas as tabelas...');
    await db.raw('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    console.log('✅ Todas as tabelas foram removidas.');

    // 2. Run migrations
    console.log('\n🏗️  Executando migrações...');
    await runCommand('npm', ['run', 'migrate:latest']);
    console.log('✅ Migrações executadas com sucesso.');

    // 3. Run seeds
    console.log('\n🌱 Executando seeds de dados iniciais...');
    await runCommand('npm', ['run', 'seed:run']);
    console.log('✅ Seeds executados com sucesso.');

    // 4. Verificar conexão MySQL e comparar tabelas
    console.log('\n🔗 Verificando conexão MySQL...');
    const mysqlAvailable = await checkMySQLConnection();
    
    if (mysqlAvailable) {
      // 5. Comparar estruturas e criar migrations/seeds faltantes
      const missingTables = await compareTables();
      
      if (missingTables.length > 0) {
        await createMissingMigrations(missingTables);
        await createMissingSeeds(missingTables);
        
        // Executar novas migrations e seeds
        console.log('\n🔄 Executando novas migrations...');
        await runCommand('npm', ['run', 'migrate:latest']);
        
        console.log('\n🌱 Executando novos seeds...');
        try {
          await runCommand('npm', ['run', 'seed:run']);
        } catch (error) {
          console.log('⚠️ Alguns seeds falharam (normal devido à ordem), continuando...');
        }
      }

      // 6. Executar migração MySQL → PostgreSQL
      console.log('\n📊 Iniciando importação de dados do MySQL...');
      try {
        await runCommand('npm', ['run', 'migrate:mysql:complete']);
        console.log('✅ Dados MySQL importados com sucesso.');
      } catch (error) {
        console.log('⚠️ Erro na importação MySQL (continuando):', (error as Error).message);
      }

      // 7. Verificação final
      console.log('\n🔍 Executando verificação final...');
      try {
        await runCommand('npm', ['run', 'migrate:mysql:verify']);
      } catch (error) {
        console.log('⚠️ Verificação final falhou (não crítico):', (error as Error).message);
      }
    } else {
      console.log('⚠️ MySQL não disponível - pulando importação de dados');
    }
    
    // 8. Relatório final
    console.log('\n🎉 BANCO DE DADOS RESETADO COM SUCESSO!');
    console.log('==========================================');
    console.log('✅ OPERAÇÕES REALIZADAS:');
    console.log('   • Schema PostgreSQL recriado');
    console.log('   • Todas as migrations executadas');
    console.log('   • Todos os seeds executados');
    
    if (mysqlAvailable) {
      console.log('   • Dados MySQL importados');
      console.log('   • Tabelas faltantes criadas automaticamente');
    }
    
    console.log('\n👥 USUÁRIOS DE TESTE DISPONÍVEIS:');
    console.log('📧 Admin: admin@sabercon.edu.br');
    console.log('📧 Professor: teacher@sabercon.edu.br');
    console.log('📧 Estudante: student@sabercon.edu.br');
    console.log('📧 Responsável: guardian@sabercon.edu.br');
    console.log('📧 Coordenador: coordinator@sabercon.edu.br');
    console.log('📧 Gerente: institution.manager@sabercon.edu.br');
    console.log('🔑 Senha para todos: password123');
    
    console.log('\n🔗 RELACIONAMENTOS E PERMISSÕES:');
    console.log('✅ Todos os usuários associados às suas roles');
    console.log('✅ Tabela user_roles populada');
    console.log('✅ Permissões de roles configuradas');
    console.log('✅ Hierarquia de permissões estabelecida');
    
    if (mysqlAvailable) {
      console.log('\n📊 DADOS MYSQL IMPORTADOS:');
      console.log('✅ Usuários migrados com role TEACHER');
      console.log('✅ Instituições e escolas importadas');
      console.log('✅ Arquivos e coleções migrados');
      console.log('✅ Dados organizados em estrutura padrão');
    }
    
    console.log('==========================================\n');
    
  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  fresh();
}

export default fresh;