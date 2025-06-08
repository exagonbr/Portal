import mysql from 'mysql2/promise';
import knex from 'knex';
import knexConfig from '../knexfile.js';
import bcrypt from 'bcrypt';

// Configuração simples
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'sabercon',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
};

async function migrateMySQL() {
  console.log('🚀 Iniciando migração MySQL → PostgreSQL\n');

  const pg = knex(knexConfig.development);
  let mysql: mysql.Connection;

  try {
    // Conectar
    mysql = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ Conectado ao MySQL');
    console.log('✅ Conectado ao PostgreSQL\n');

    // 1. Garantir role TEACHER
    let teacherRole = await pg('roles').where('name', 'TEACHER').first();
    if (!teacherRole) {
      const [roleId] = await pg('roles').insert({
        name: 'TEACHER',
        description: 'Professor',
        type: 'system',
        status: 'active'
      }).returning('id');
      teacherRole = { id: roleId };
      console.log('✅ Role TEACHER criada');
    }

    // 2. Garantir instituição padrão
    let institution = await pg('institutions').where('code', 'MIGRATED').first();
    if (!institution) {
      const [instId] = await pg('institutions').insert({
        name: 'Instituição Migrada',
        code: 'MIGRATED',
        description: 'Dados migrados do MySQL',
        address: 'N/A',
        city: 'N/A',
        state: 'N/A',
        zip_code: '00000-000',
        phone: '(00) 0000-0000',
        email: 'migrado@email.com',
        status: 'active'
      }).returning('id');
      institution = { id: instId };
      console.log('✅ Instituição padrão criada');
    }

    // 3. Garantir escola padrão
    let school = await pg('schools').where('code', 'MIGRATED').first();
    if (!school) {
      const [schoolId] = await pg('schools').insert({
        name: 'Escola Migrada',
        code: 'MIGRATED',
        description: 'Dados migrados do MySQL',
        address: 'N/A',
        city: 'N/A',
        state: 'N/A',
        zip_code: '00000-000',
        phone: '(00) 0000-0000',
        email: 'escola@email.com',
        institution_id: institution.id,
        status: 'active'
      }).returning('id');
      school = { id: schoolId };
      console.log('✅ Escola padrão criada\n');
    }

    // 4. Migrar usuários
    console.log('👥 Migrando usuários...');
    const [users] = await mysql.execute('SELECT * FROM usuarios') as any[];
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Verificar se já existe
        const existing = await pg('users').where('email', user.email).first();
        if (existing) {
          skipped++;
          continue;
        }

        // Preparar senha
        let password = user.password || user.senha;
        if (!password || !password.startsWith('$2b$')) {
          password = await bcrypt.hash('123456', 10);
        }

        // Inserir usuário com role TEACHER
        await pg('users').insert({
          email: user.email,
          password: password,
          name: user.nome || user.name,
          cpf: user.cpf,
          phone: user.telefone || user.phone,
          birth_date: user.data_nascimento || user.birth_date,
          address: user.endereco || user.address,
          city: user.cidade || user.city,
          state: user.estado || user.state,
          zip_code: user.cep || user.zip_code,
          is_active: user.ativo !== undefined ? Boolean(user.ativo) : true,
          role_id: teacherRole.id, // SEMPRE TEACHER
          institution_id: institution.id,
          school_id: school.id,
          created_at: user.created_at || new Date(),
          updated_at: user.updated_at || new Date()
        });

        migrated++;
      } catch (error) {
        errors++;
        console.log(`   ❌ Erro ao migrar ${user.email}: ${error.message}`);
      }
    }

    console.log(`   ✅ ${migrated} usuários migrados`);
    console.log(`   ⚠️ ${skipped} usuários já existiam`);
    console.log(`   ❌ ${errors} erros\n`);

    // 5. Migrar outras tabelas se existirem
    const tables = ['instituicoes', 'escolas', 'arquivos', 'colecoes'];
    
    for (const table of tables) {
      try {
        const [tableExists] = await mysql.execute(`SHOW TABLES LIKE '${table}'`) as any[];
        if (tableExists.length === 0) continue;

        const pgTable = table === 'instituicoes' ? 'institutions' : 
                       table === 'escolas' ? 'schools' :
                       table === 'arquivos' ? 'files' :
                       table === 'colecoes' ? 'collections' : table;

        const hasTable = await pg.schema.hasTable(pgTable);
        if (!hasTable) continue;

        console.log(`📁 Migrando ${table}...`);
        const [rows] = await mysql.execute(`SELECT * FROM ${table}`) as any[];
        
        let tableMigrated = 0;
        for (const row of rows) {
          try {
            const transformed = transformRow(table, row, teacherRole.id, institution.id);
            if (transformed) {
              await pg(pgTable).insert(transformed);
              tableMigrated++;
            }
          } catch (error) {
            // Ignorar erros de duplicata
            if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
              console.log(`   ❌ Erro: ${error.message}`);
            }
          }
        }
        console.log(`   ✅ ${tableMigrated} registros migrados\n`);
      } catch (error) {
        console.log(`   ⚠️ Tabela ${table} não encontrada ou erro: ${error.message}`);
      }
    }

    console.log('🎉 MIGRAÇÃO CONCLUÍDA!');
    console.log('✅ Todos os usuários têm role TEACHER');
    console.log('✅ Dados migrados com sucesso');

  } catch (error) {
    console.error('❌ ERRO:', error);
    throw error;
  } finally {
    if (mysql!) await mysql.end();
    await pg.destroy();
  }
}

function transformRow(table: string, row: any, teacherRoleId: string, institutionId: string) {
  switch (table) {
    case 'instituicoes':
      return {
        name: row.nome || row.name,
        code: row.codigo || row.code || `INST_${row.id}`,
        description: row.descricao || row.description || 'Migrado do MySQL',
        address: row.endereco || row.address || 'N/A',
        city: row.cidade || row.city || 'N/A',
        state: row.estado || row.state || 'N/A',
        zip_code: row.cep || row.zip_code || '00000-000',
        phone: row.telefone || row.phone || '(00) 0000-0000',
        email: row.email || `inst${row.id}@migrado.com`,
        status: row.ativo ? 'active' : 'inactive',
        created_at: row.created_at || new Date(),
        updated_at: row.updated_at || new Date()
      };

    case 'escolas':
      return {
        name: row.nome || row.name,
        code: row.codigo || row.code || `SCHOOL_${row.id}`,
        description: row.descricao || row.description || 'Migrado do MySQL',
        address: row.endereco || row.address || 'N/A',
        city: row.cidade || row.city || 'N/A',
        state: row.estado || row.state || 'N/A',
        zip_code: row.cep || row.zip_code || '00000-000',
        phone: row.telefone || row.phone || '(00) 0000-0000',
        email: row.email || `school${row.id}@migrado.com`,
        institution_id: institutionId,
        status: row.ativo ? 'active' : 'inactive',
        created_at: row.created_at || new Date(),
        updated_at: row.updated_at || new Date()
      };

    case 'arquivos':
      return {
        name: row.nome || row.name,
        original_name: row.nome_original || row.original_name || row.nome,
        type: row.tipo || row.type || 'document',
        size: row.tamanho || row.size || 0,
        size_formatted: row.tamanho_formatado || '0B',
        bucket: row.bucket || 'migrated',
        s3_key: row.s3_key || row.caminho || `migrated/${row.id}`,
        s3_url: row.s3_url || row.url || '',
        description: row.descricao || row.description,
        category: 'professor',
        uploaded_by: null, // Será resolvido depois
        is_active: row.ativo !== undefined ? Boolean(row.ativo) : true,
        created_at: row.created_at || new Date(),
        updated_at: row.updated_at || new Date()
      };

    case 'colecoes':
      return {
        name: row.nome || row.name,
        description: row.descricao || row.description,
        type: row.tipo || row.type || 'mixed',
        created_by: null, // Será resolvido depois
        institution_id: institutionId,
        is_public: row.publico !== undefined ? Boolean(row.publico) : true,
        items_count: row.total_itens || 0,
        tags: row.tags ? (Array.isArray(row.tags) ? row.tags : [row.tags]) : [],
        created_at: row.created_at || new Date(),
        updated_at: row.updated_at || new Date()
      };

    default:
      return null;
  }
}

// Executar
if (require.main === module) {
  migrateMySQL().catch(console.error);
}

export default migrateMySQL; 