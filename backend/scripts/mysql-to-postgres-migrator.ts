import mysql from 'mysql2/promise';
import knex from 'knex';
import knexConfig from '../knexfile.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Configuração MySQL
const MYSQL_CONFIG = {
  host: "sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com",
  user: "sabercon",
  password: "gWg28m8^vffI9X#",
  database: "sabercon",
  port: 3306,
  multipleStatements: true
};

interface MigrationStats {
  users: { migrated: number; skipped: number; errors: number };
  institutions: { migrated: number; skipped: number; errors: number };
  schools: { migrated: number; skipped: number; errors: number };
  files: { migrated: number; skipped: number; errors: number };
  collections: { migrated: number; skipped: number; errors: number };
}

class MySQLToPostgresMigrator {
  private pg: knex.Knex;
  private mysql: mysql.Connection | null = null;
  private stats: MigrationStats;
  private teacherRoleId: string | null = null;
  private defaultInstitutionId: string | null = null;
  private defaultSchoolId: string | null = null;

  constructor() {
    this.pg = knex(knexConfig.development);
    this.stats = {
      users: { migrated: 0, skipped: 0, errors: 0 },
      institutions: { migrated: 0, skipped: 0, errors: 0 },
      schools: { migrated: 0, skipped: 0, errors: 0 },
      files: { migrated: 0, skipped: 0, errors: 0 },
      collections: { migrated: 0, skipped: 0, errors: 0 }
    };
  }

  async connect(): Promise<void> {
    try {
      this.mysql = await mysql.createConnection(MYSQL_CONFIG);
      console.log('✅ Conectado ao MySQL');
      console.log('✅ Conectado ao PostgreSQL');
    } catch (error) {
      console.error('❌ Erro ao conectar:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.mysql) {
      await this.mysql.end();
    }
    await this.pg.destroy();
  }

  async setupDefaults(): Promise<void> {
    console.log('🔧 Configurando dados padrão...');

    // 1. Garantir role TEACHER
    let teacherRole = await this.pg('roles').where('name', 'TEACHER').first();
    if (!teacherRole) {
      const [roleId] = await this.pg('roles').insert({
        id: uuidv4(),
        name: 'TEACHER',
        description: 'Professor - Role padrão para usuários migrados',
        type: 'system',
        status: 'active',
        user_count: 0
      }).returning('id');
      teacherRole = { id: roleId };
      console.log('   ✅ Role TEACHER criada');
    }
    this.teacherRoleId = teacherRole.id;

    // 2. Garantir instituição padrão
    let institution = await this.pg('institutions').where('code', 'MYSQL_MIGRATED').first();
    if (!institution) {
      const [instId] = await this.pg('institutions').insert({
        id: uuidv4(),
        name: 'Instituição Migrada do MySQL',
        code: 'MYSQL_MIGRATED',
        description: 'Dados migrados do sistema legado MySQL',
        address: 'Endereço não informado',
        city: 'Cidade não informada',
        state: 'Estado não informado',
        zip_code: '00000-000',
        phone: '(00) 0000-0000',
        email: 'contato@migrado.com.br',
        status: 'active'
      }).returning('id');
      institution = { id: instId };
      console.log('   ✅ Instituição padrão criada');
    }
    this.defaultInstitutionId = institution.id;

    // 3. Garantir escola padrão
    let school = await this.pg('schools').where('code', 'MYSQL_MIGRATED_SCHOOL').first();
    if (!school) {
      const [schoolId] = await this.pg('schools').insert({
        id: uuidv4(),
        name: 'Escola Migrada do MySQL',
        code: 'MYSQL_MIGRATED_SCHOOL',
        description: 'Escola padrão para dados migrados',
        address: 'Endereço não informado',
        city: 'Cidade não informada',
        state: 'Estado não informado',
        zip_code: '00000-000',
        phone: '(00) 0000-0000',
        email: 'escola@migrado.com.br',
        institution_id: this.defaultInstitutionId,
        status: 'active'
      }).returning('id');
      school = { id: schoolId };
      console.log('   ✅ Escola padrão criada');
    }
    this.defaultSchoolId = school.id;

    // 4. Garantir permissões básicas para TEACHER
    await this.setupTeacherPermissions();
  }

  private async setupTeacherPermissions(): Promise<void> {
    if (!this.teacherRoleId) return;

    const existingPermissions = await this.pg('role_permissions')
      .where('role_id', this.teacherRoleId)
      .count('* as count')
      .first();

    if (existingPermissions && parseInt(existingPermissions.count as string) === 0) {
      console.log('   🔐 Configurando permissões para TEACHER...');
      
      // Buscar permissões básicas
      const basicPermissions = await this.pg('permissions')
        .whereIn('name', [
          'read_files',
          'create_files',
          'read_collections',
          'create_collections',
          'read_students',
          'read_classes'
        ]);

      if (basicPermissions.length > 0) {
        const rolePermissions = basicPermissions.map(permission => ({
          role_id: this.teacherRoleId,
          permission_id: permission.id
        }));

        await this.pg('role_permissions').insert(rolePermissions);
        console.log(`   ✅ ${basicPermissions.length} permissões atribuídas`);
      }
    }
  }

  async migrateUsers(): Promise<void> {
    if (!this.mysql) throw new Error('MySQL não conectado');
    
    console.log('👥 Migrando usuários...');

    try {
      // Verificar se a tabela usuarios existe
      const [tables] = await this.mysql.execute("SHOW TABLES LIKE 'usuarios'") as any[];
      if (tables.length === 0) {
        console.log('   ⚠️ Tabela "usuarios" não encontrada no MySQL');
        return;
      }

      const [users] = await this.mysql.execute('SELECT * FROM usuarios') as any[];
      console.log(`   📊 Encontrados ${users.length} usuários no MySQL`);

      for (const user of users) {
        try {
          // Verificar se já existe
          const existing = await this.pg('users').where('email', user.email).first();
          if (existing) {
            this.stats.users.skipped++;
            continue;
          }

          // Preparar senha
          let password = user.password || user.senha;
          if (!password || !password.startsWith('$2b$')) {
            password = await bcrypt.hash('123456', 10);
          }

          // Inserir usuário
          await this.pg('users').insert({
            id: uuidv4(),
            email: user.email,
            password: password,
            name: user.nome || user.name || 'Nome não informado',
            cpf: user.cpf,
            phone: user.telefone || user.phone,
            birth_date: user.data_nascimento || user.birth_date,
            address: user.endereco || user.address,
            city: user.cidade || user.city,
            state: user.estado || user.state,
            zip_code: user.cep || user.zip_code,
            is_active: user.ativo !== undefined ? Boolean(user.ativo) : true,
            role_id: this.teacherRoleId,
            institution_id: this.defaultInstitutionId,
            school_id: this.defaultSchoolId,
            created_at: user.created_at || new Date(),
            updated_at: user.updated_at || new Date()
          });

          this.stats.users.migrated++;
        } catch (error: any) {
          this.stats.users.errors++;
          console.log(`   ❌ Erro ao migrar ${user.email}: ${error.message}`);
        }
      }

      console.log(`   ✅ ${this.stats.users.migrated} usuários migrados`);
      console.log(`   ⚠️ ${this.stats.users.skipped} usuários já existiam`);
      console.log(`   ❌ ${this.stats.users.errors} erros`);
    } catch (error: any) {
      console.error('   ❌ Erro na migração de usuários:', error.message);
    }
  }

  async migrateInstitutions(): Promise<void> {
    if (!this.mysql) throw new Error('MySQL não conectado');
    
    console.log('🏢 Migrando instituições...');

    try {
      const [tables] = await this.mysql.execute("SHOW TABLES LIKE 'instituicoes'") as any[];
      if (tables.length === 0) {
        console.log('   ⚠️ Tabela "instituicoes" não encontrada');
        return;
      }

      const [institutions] = await this.mysql.execute('SELECT * FROM instituicoes') as any[];
      console.log(`   📊 Encontradas ${institutions.length} instituições`);

      for (const inst of institutions) {
        try {
          const code = inst.codigo || inst.code || `INST_${inst.id}`;
          const existing = await this.pg('institutions').where('code', code).first();
          
          if (existing) {
            this.stats.institutions.skipped++;
            continue;
          }

          await this.pg('institutions').insert({
            id: uuidv4(),
            name: inst.nome || inst.name || 'Instituição sem nome',
            code: code,
            description: inst.descricao || inst.description || 'Migrado do MySQL',
            address: inst.endereco || inst.address || 'Não informado',
            city: inst.cidade || inst.city || 'Não informado',
            state: inst.estado || inst.state || 'Não informado',
            zip_code: inst.cep || inst.zip_code || '00000-000',
            phone: inst.telefone || inst.phone || '(00) 0000-0000',
            email: inst.email || `inst${inst.id}@migrado.com`,
            status: inst.ativo ? 'active' : 'inactive',
            created_at: inst.created_at || new Date(),
            updated_at: inst.updated_at || new Date()
          });

          this.stats.institutions.migrated++;
        } catch (error: any) {
          this.stats.institutions.errors++;
          console.log(`   ❌ Erro ao migrar instituição ${inst.id}: ${error.message}`);
        }
      }

      console.log(`   ✅ ${this.stats.institutions.migrated} instituições migradas`);
    } catch (error: any) {
      console.error('   ❌ Erro na migração de instituições:', error.message);
    }
  }

  async migrateSchools(): Promise<void> {
    if (!this.mysql) throw new Error('MySQL não conectado');
    
    console.log('🏫 Migrando escolas...');

    try {
      const [tables] = await this.mysql.execute("SHOW TABLES LIKE 'escolas'") as any[];
      if (tables.length === 0) {
        console.log('   ⚠️ Tabela "escolas" não encontrada');
        return;
      }

      const [schools] = await this.mysql.execute('SELECT * FROM escolas') as any[];
      console.log(`   📊 Encontradas ${schools.length} escolas`);

      for (const school of schools) {
        try {
          const code = school.codigo || school.code || `SCHOOL_${school.id}`;
          const existing = await this.pg('schools').where('code', code).first();
          
          if (existing) {
            this.stats.schools.skipped++;
            continue;
          }

          await this.pg('schools').insert({
            id: uuidv4(),
            name: school.nome || school.name || 'Escola sem nome',
            code: code,
            description: school.descricao || school.description || 'Migrado do MySQL',
            address: school.endereco || school.address || 'Não informado',
            city: school.cidade || school.city || 'Não informado',
            state: school.estado || school.state || 'Não informado',
            zip_code: school.cep || school.zip_code || '00000-000',
            phone: school.telefone || school.phone || '(00) 0000-0000',
            email: school.email || `escola${school.id}@migrado.com`,
            institution_id: this.defaultInstitutionId,
            status: school.ativo ? 'active' : 'inactive',
            created_at: school.created_at || new Date(),
            updated_at: school.updated_at || new Date()
          });

          this.stats.schools.migrated++;
        } catch (error: any) {
          this.stats.schools.errors++;
          console.log(`   ❌ Erro ao migrar escola ${school.id}: ${error.message}`);
        }
      }

      console.log(`   ✅ ${this.stats.schools.migrated} escolas migradas`);
    } catch (error: any) {
      console.error('   ❌ Erro na migração de escolas:', error.message);
    }
  }

  async migrateFiles(): Promise<void> {
    if (!this.mysql) throw new Error('MySQL não conectado');
    
    console.log('📁 Migrando arquivos...');

    try {
      const [tables] = await this.mysql.execute("SHOW TABLES LIKE 'arquivos'") as any[];
      if (tables.length === 0) {
        console.log('   ⚠️ Tabela "arquivos" não encontrada');
        return;
      }

      const [files] = await this.mysql.execute('SELECT * FROM arquivos') as any[];
      console.log(`   📊 Encontrados ${files.length} arquivos`);

      for (const file of files) {
        try {
          const s3Key = file.s3_key || file.caminho || `migrated/${file.id}`;
          const existing = await this.pg('files').where('s3_key', s3Key).first();
          
          if (existing) {
            this.stats.files.skipped++;
            continue;
          }

          await this.pg('files').insert({
            id: uuidv4(),
            name: file.nome || file.name || 'Arquivo sem nome',
            original_name: file.nome_original || file.original_name || file.nome || 'arquivo',
            type: file.tipo || file.type || 'document',
            size: file.tamanho || file.size || 0,
            size_formatted: file.tamanho_formatado || this.formatFileSize(file.tamanho || file.size || 0),
            bucket: file.bucket || 'migrated',
            s3_key: s3Key,
            s3_url: file.s3_url || file.url || '',
            description: file.descricao || file.description,
            category: 'professor',
            metadata: file.metadata ? JSON.parse(file.metadata) : {},
            uploaded_by: null, // Será resolvido depois se necessário
            is_active: file.ativo !== undefined ? Boolean(file.ativo) : true,
            tags: file.tags ? (Array.isArray(file.tags) ? file.tags : [file.tags]) : [],
            created_at: file.created_at || new Date(),
            updated_at: file.updated_at || new Date()
          });

          this.stats.files.migrated++;
        } catch (error: any) {
          this.stats.files.errors++;
          console.log(`   ❌ Erro ao migrar arquivo ${file.id}: ${error.message}`);
        }
      }

      console.log(`   ✅ ${this.stats.files.migrated} arquivos migrados`);
    } catch (error: any) {
      console.error('   ❌ Erro na migração de arquivos:', error.message);
    }
  }

  async migrateCollections(): Promise<void> {
    if (!this.mysql) throw new Error('MySQL não conectado');
    
    console.log('📚 Migrando coleções...');

    try {
      const [tables] = await this.mysql.execute("SHOW TABLES LIKE 'colecoes'") as any[];
      if (tables.length === 0) {
        console.log('   ⚠️ Tabela "colecoes" não encontrada');
        return;
      }

      const [collections] = await this.mysql.execute('SELECT * FROM colecoes') as any[];
      console.log(`   📊 Encontradas ${collections.length} coleções`);

      for (const collection of collections) {
        try {
          const name = collection.nome || collection.name || 'Coleção sem nome';
          const existing = await this.pg('collections').where('name', name).first();
          
          if (existing) {
            this.stats.collections.skipped++;
            continue;
          }

          await this.pg('collections').insert({
            id: uuidv4(),
            name: name,
            description: collection.descricao || collection.description,
            type: collection.tipo || collection.type || 'mixed',
            created_by: null, // Será resolvido depois se necessário
            institution_id: this.defaultInstitutionId,
            is_public: collection.publico !== undefined ? Boolean(collection.publico) : true,
            items_count: collection.total_itens || 0,
            tags: collection.tags ? (Array.isArray(collection.tags) ? collection.tags : [collection.tags]) : [],
            created_at: collection.created_at || new Date(),
            updated_at: collection.updated_at || new Date()
          });

          this.stats.collections.migrated++;
        } catch (error: any) {
          this.stats.collections.errors++;
          console.log(`   ❌ Erro ao migrar coleção ${collection.id}: ${error.message}`);
        }
      }

      console.log(`   ✅ ${this.stats.collections.migrated} coleções migradas`);
    } catch (error: any) {
      console.error('   ❌ Erro na migração de coleções:', error.message);
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i];
  }

  async printSummary(): Promise<void> {
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA!');
    console.log('==========================================');
    console.log(`👥 Usuários: ${this.stats.users.migrated} migrados, ${this.stats.users.skipped} pulados, ${this.stats.users.errors} erros`);
    console.log(`🏢 Instituições: ${this.stats.institutions.migrated} migradas, ${this.stats.institutions.skipped} puladas, ${this.stats.institutions.errors} erros`);
    console.log(`🏫 Escolas: ${this.stats.schools.migrated} migradas, ${this.stats.schools.skipped} puladas, ${this.stats.schools.errors} erros`);
    console.log(`📁 Arquivos: ${this.stats.files.migrated} migrados, ${this.stats.files.skipped} pulados, ${this.stats.files.errors} erros`);
    console.log(`📚 Coleções: ${this.stats.collections.migrated} migradas, ${this.stats.collections.skipped} puladas, ${this.stats.collections.errors} erros`);
    console.log('==========================================');
    console.log('✅ Todos os usuários migrados têm role TEACHER');
    console.log('✅ Dados organizados em instituição/escola padrão');
  }

  async migrate(): Promise<void> {
    try {
      console.log('🚀 Iniciando migração MySQL → PostgreSQL\n');
      
      await this.connect();
      await this.setupDefaults();
      
      console.log('\n📊 Iniciando migração de dados...\n');
      
      await this.migrateInstitutions();
      await this.migrateSchools();
      await this.migrateUsers();
      await this.migrateFiles();
      await this.migrateCollections();
      
      await this.printSummary();
      
    } catch (error) {
      console.error('❌ ERRO NA MIGRAÇÃO:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// Executar migração
async function runMigration() {
  const migrator = new MySQLToPostgresMigrator();
  await migrator.migrate();
}

if (require.main === module) {
  runMigration().catch(console.error);
}

export default MySQLToPostgresMigrator; 