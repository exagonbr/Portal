#!/usr/bin/env ts-node

import * as knex from 'knex';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import config from '../knexfile';

dotenv.config();

// Configuração do PostgreSQL
const pgConfig = config[process.env.NODE_ENV || 'development'];

// Configuração do MySQL
const mysqlConfig: mysql.ConnectionOptions = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'portal_sabercon_legacy',
  ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
};

interface MySQLUser {
  id: number;
  email: string;
  password: string;
  nome: string;
  cpf?: string;
  telefone?: string;
  data_nascimento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  unidade_ensino?: string;
  tipo_usuario?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface MySQLInstitution {
  id: number;
  nome: string;
  codigo: string;
  descricao?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  website?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

console.log('🔄 INICIANDO MIGRAÇÃO MYSQL → POSTGRESQL');
console.log('=======================================');

async function migrateFromMySQL() {
  let mysqlConnection: mysql.Connection | null = null;
  let pgConnection: knex.Knex | null = null;

  try {
    // Conectar ao MySQL
    console.log('\n1️⃣ Conectando ao MySQL...');
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Conectado ao MySQL');

    // Conectar ao PostgreSQL
    console.log('\n2️⃣ Conectando ao PostgreSQL...');
    pgConnection = knex.default(pgConfig);
    await pgConnection.raw('SELECT 1');
    console.log('✅ Conectado ao PostgreSQL');

    // Migrar instituições
    console.log('\n3️⃣ Migrando instituições...');
    await migrateInstitutions(mysqlConnection, pgConnection);
    
    // Migrar usuários
    console.log('\n4️⃣ Migrando usuários...');
    await migrateUsers(mysqlConnection, pgConnection);

    // Migrar escolas (se existirem)
    console.log('\n5️⃣ Migrando escolas...');
    await migrateSchools(mysqlConnection, pgConnection);

    // Migrar cursos (se existirem)
    console.log('\n6️⃣ Migrando cursos...');
    await migrateCourses(mysqlConnection, pgConnection);

    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    
  } catch (error) {
    console.error('\n❌ ERRO DURANTE A MIGRAÇÃO:', error);
    throw error;
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log('🔌 Conexão MySQL fechada');
    }
    if (pgConnection) {
      await pgConnection.destroy();
      console.log('🔌 Conexão PostgreSQL fechada');
    }
  }
}

async function migrateInstitutions(mysql: mysql.Connection, pg: knex.Knex) {
  try {
    // Buscar instituições do MySQL
    const [mysqlInstitutions] = await mysql.execute(`
      SELECT 
        id, nome, codigo, descricao, endereco, cidade, estado, cep,
        telefone, email, website, ativo, created_at, updated_at
      FROM instituicoes 
      WHERE ativo = 1
    `);

    const institutions = mysqlInstitutions as MySQLInstitution[];
    
    if (institutions.length === 0) {
      console.log('⚠️ Nenhuma instituição encontrada no MySQL');
      return;
    }

    // Mapear e inserir no PostgreSQL
    const pgInstitutions = institutions.map(inst => ({
      name: inst.nome,
      code: inst.codigo || `INST_${inst.id}`,
      description: inst.descricao,
      address: inst.endereco,
      city: inst.cidade,
      state: inst.estado,
      zip_code: inst.cep,
      phone: inst.telefone,
      email: inst.email,
      website: inst.website,
      status: inst.ativo ? 'active' : 'inactive',
      created_at: inst.created_at ? new Date(inst.created_at) : new Date(),
      updated_at: inst.updated_at ? new Date(inst.updated_at) : new Date()
    }));

    // Inserir instituições mantendo compatibilidade
    for (const institution of pgInstitutions) {
      await pg('institutions')
        .insert(institution)
        .onConflict('code')
        .merge();
    }

    console.log(`✅ ${institutions.length} instituições migradas`);
    
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('⚠️ Tabela "instituicoes" não encontrada no MySQL');
    } else {
      console.error('❌ Erro ao migrar instituições:', error);
    }
  }
}

async function migrateUsers(mysql: mysql.Connection, pg: knex.Knex) {
  try {
    // Buscar usuários do MySQL
    const [mysqlUsers] = await mysql.execute(`
      SELECT 
        id, email, password, nome, cpf, telefone, data_nascimento,
        endereco, cidade, estado, cep, unidade_ensino, tipo_usuario,
        ativo, created_at, updated_at
      FROM usuarios 
      WHERE ativo = 1
    `);

    const users = mysqlUsers as MySQLUser[];
    
    if (users.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado no MySQL');
      return;
    }

    // Buscar roles e instituições do PostgreSQL para mapeamento
    const roles = await pg('roles').select('id', 'name');
    const institutions = await pg('institutions').select('id', 'code');
    
    const roleMap = roles.reduce((acc, role) => {
      acc[role.name] = role.id;
      return acc;
    }, {} as Record<string, string>);

    // Mapear tipos de usuário MySQL para roles PostgreSQL
    const userTypeToRole: Record<string, string> = {
      'admin': 'SYSTEM_ADMIN',
      'administrador': 'SYSTEM_ADMIN',
      'gestor': 'INSTITUTION_MANAGER',
      'coordenador': 'ACADEMIC_COORDINATOR',
      'professor': 'TEACHER',
      'aluno': 'STUDENT',
      'estudante': 'STUDENT',
      'responsavel': 'GUARDIAN',
      'pai': 'GUARDIAN',
      'mae': 'GUARDIAN'
    };

    // Mapear e inserir usuários
    let migratedCount = 0;
    for (const user of users) {
      try {
        const userType = user.tipo_usuario?.toLowerCase() || 'student';
        const roleName = userTypeToRole[userType] || 'STUDENT';
        const roleId = roleMap[roleName];

        // Encontrar instituição baseada na unidade de ensino
        let institutionId = institutions[0]?.id; // padrão
        if (user.unidade_ensino) {
          const institution = institutions.find(inst => 
            inst.code.toLowerCase().includes(user.unidade_ensino?.toLowerCase() || '')
          );
          if (institution) {
            institutionId = institution.id;
          }
        }

        const pgUser = {
          email: user.email,
          password: user.password, // Assumindo que já está hasheada
          name: user.nome,
          cpf: user.cpf,
          phone: user.telefone,
          birth_date: user.data_nascimento ? new Date(user.data_nascimento) : null,
          address: user.endereco,
          city: user.cidade,
          state: user.estado,
          zip_code: user.cep,
          endereco: user.endereco, // Campo legado
          telefone: user.telefone, // Campo legado
          unidade_ensino: user.unidade_ensino,
          is_active: user.ativo !== false,
          role_id: roleId,
          institution_id: institutionId,
          created_at: user.created_at ? new Date(user.created_at) : new Date(),
          updated_at: user.updated_at ? new Date(user.updated_at) : new Date()
        };

        await pg('users')
          .insert(pgUser)
          .onConflict('email')
          .merge(['name', 'phone', 'address', 'city', 'state', 'zip_code', 'updated_at']);

        migratedCount++;
        
      } catch (userError: any) {
        console.error(`❌ Erro ao migrar usuário ${user.email}:`, userError);
      }
    }

    console.log(`✅ ${migratedCount}/${users.length} usuários migrados`);
    
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('⚠️ Tabela "usuarios" não encontrada no MySQL');
    } else {
      console.error('❌ Erro ao migrar usuários:', error);
    }
  }
}

async function migrateSchools(mysql: mysql.Connection, pg: knex.Knex) {
  try {
    const [mysqlSchools] = await mysql.execute(`
      SELECT 
        id, nome, codigo, descricao, endereco, cidade, estado, cep,
        telefone, email, instituicao_id, ativo, created_at, updated_at
      FROM escolas 
      WHERE ativo = 1
    `);

    const schools = mysqlSchools as any[];
    
    if (schools.length === 0) {
      console.log('⚠️ Nenhuma escola encontrada no MySQL');
      return;
    }

    // Buscar instituições para mapeamento
    const institutions = await pg('institutions').select('id', 'code');
    
    let migratedCount = 0;
    for (const school of schools) {
      try {
        // Mapear instituição
        const institutionId = institutions[0]?.id; // usar primeira instituição como padrão

        const pgSchool = {
          name: school.nome,
          code: school.codigo || `SCHOOL_${school.id}`,
          description: school.descricao,
          address: school.endereco,
          city: school.cidade,
          state: school.estado,
          zip_code: school.cep,
          phone: school.telefone,
          email: school.email,
          institution_id: institutionId,
          status: school.ativo ? 'active' : 'inactive',
          created_at: school.created_at ? new Date(school.created_at) : new Date(),
          updated_at: school.updated_at ? new Date(school.updated_at) : new Date()
        };

        await pg('schools')
          .insert(pgSchool)
          .onConflict(['code', 'institution_id'])
          .merge();

        migratedCount++;
        
      } catch (schoolError: any) {
        console.error(`❌ Erro ao migrar escola ${school.nome}:`, schoolError);
      }
    }

    console.log(`✅ ${migratedCount}/${schools.length} escolas migradas`);
    
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('⚠️ Tabela "escolas" não encontrada no MySQL');
    } else {
      console.error('❌ Erro ao migrar escolas:', error);
    }
  }
}

async function migrateCourses(mysql: mysql.Connection, pg: knex.Knex) {
  try {
    const [mysqlCourses] = await mysql.execute(`
      SELECT 
        id, titulo, codigo, descricao, objetivos, carga_horaria,
        nivel_dificuldade, categoria, professor_id, instituicao_id,
        ativo, created_at, updated_at
      FROM cursos 
      WHERE ativo = 1
    `);

    const courses = mysqlCourses as any[];
    
    if (courses.length === 0) {
      console.log('⚠️ Nenhum curso encontrado no MySQL');
      return;
    }

    // Buscar professores e instituições para mapeamento
    const teachers = await pg('users').select('id', 'email').where('role_id', 
      pg.select('id').from('roles').where('name', 'TEACHER').first()
    );
    const institutions = await pg('institutions').select('id');

    let migratedCount = 0;
    for (const course of courses) {
      try {
        const pgCourse = {
          title: course.titulo,
          code: course.codigo || `COURSE_${course.id}`,
          description: course.descricao,
          objectives: course.objetivos,
          duration_hours: course.carga_horaria,
          difficulty_level: course.nivel_dificuldade,
          category: course.categoria,
          teacher_id: teachers[0]?.id || null, // usar primeiro professor como padrão
          institution_id: institutions[0]?.id,
          status: course.ativo ? 'published' : 'archived',
          created_at: course.created_at ? new Date(course.created_at) : new Date(),
          updated_at: course.updated_at ? new Date(course.updated_at) : new Date()
        };

        await pg('courses')
          .insert(pgCourse)
          .onConflict(['code', 'institution_id'])
          .merge();

        migratedCount++;
        
      } catch (courseError: any) {
        console.error(`❌ Erro ao migrar curso ${course.titulo}:`, courseError);
      }
    }

    console.log(`✅ ${migratedCount}/${courses.length} cursos migrados`);
    
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('⚠️ Tabela "cursos" não encontrada no MySQL');
    } else {
      console.error('❌ Erro ao migrar cursos:', error);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  migrateFromMySQL()
    .then(() => {
      console.log('✅ Migração MySQL→PostgreSQL concluída');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Falha na migração:', error);
      process.exit(1);
    });
}

export default migrateFromMySQL; 