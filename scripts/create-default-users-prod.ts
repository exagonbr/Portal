import * as dotenv from 'dotenv';
import { Client } from 'pg';
import * as bcrypt from 'bcryptjs';

// Carregar variáveis de ambiente
dotenv.config({ path: '../backend/.env' });
dotenv.config({ path: '../.env' });
dotenv.config({ path: './backend/.env' });
dotenv.config({ path: './.env' });

// Configuração do banco
const dbConfig = {
  host: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.DATABASE_PORT || '5432'),
  database: process.env.DB_NAME || process.env.DATABASE_NAME || 'portal_sabercon',
  user: process.env.DB_USER || process.env.DATABASE_USER || 'postgres',
  password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

console.log('Configuração do banco:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  ssl: !!dbConfig.ssl
});

async function createDefaultUsers() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✓ Conectado ao banco de dados');
    
    // Hash da senha padrão
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('✓ Senha hash gerada');
    
    // Buscar instituições
    const institutionsResult = await client.query('SELECT id, name FROM institutions');
    const institutions = institutionsResult.rows;
    console.log(`✓ ${institutions.length} instituições encontradas`);
    
    const sabercon = institutions.find(i => i.name === 'Sabercon Educação');
    const ifsp = institutions.find(i => i.name === 'IFSP');
    
    if (!sabercon || !ifsp) {
      console.log('❌ Erro: Instituições padrão não encontradas');
      console.log('Instituições disponíveis:', institutions.map(i => i.name));
      process.exit(1);
    }
    
    // Buscar roles
    const rolesResult = await client.query('SELECT id, name FROM role');
    const roles = rolesResult.rows;
    console.log(`✓ ${roles.length} roles encontrados`);
    
    const roleMap: Record<string, number> = {};
    roles.forEach(role => {
      roleMap[role.name] = role.id;
    });
    
    // Definir usuários padrão
    const defaultUsers = [
      {
        name: 'Admin Sistema',
        email: 'admin@sabercon.com.br',
        password: hashedPassword,
        role_id: roleMap['SYSTEM_ADMIN'],
        institution_id: sabercon.id,
        is_active: true
      },
      {
        name: 'Gestor Instituição',
        email: 'gestor@sabercon.com.br',
        password: hashedPassword,
        role_id: roleMap['INSTITUTION_MANAGER'],
        institution_id: sabercon.id,
        is_active: true
      },
      {
        name: 'Professor Teste',
        email: 'professor@sabercon.com.br',
        password: hashedPassword,
        role_id: roleMap['TEACHER'],
        institution_id: sabercon.id,
        is_active: true
      },
      {
        name: 'Aluno Teste',
        email: 'aluno@sabercon.com.br',
        password: hashedPassword,
        role_id: roleMap['STUDENT'],
        institution_id: sabercon.id,
        is_active: true
      },
      {
        name: 'Coordenador Acadêmico',
        email: 'coordenador@sabercon.com.br',
        password: hashedPassword,
        role_id: roleMap['ACADEMIC_COORDINATOR'],
        institution_id: sabercon.id,
        is_active: true
      },
      {
        name: 'Responsável Teste',
        email: 'responsavel@sabercon.com.br',
        password: hashedPassword,
        role_id: roleMap['GUARDIAN'],
        institution_id: sabercon.id,
        is_active: true
      }
    ];
    
    console.log('\nCriando usuários padrão...');
    
    for (const user of defaultUsers) {
      try {
        // Verificar se usuário já existe
        const existingResult = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [user.email]
        );
        
        if (existingResult.rows.length > 0) {
          console.log(`- Usuário já existe: ${user.email}`);
          continue;
        }
        
        // Inserir novo usuário
        await client.query(
          `INSERT INTO users (name, email, password, role_id, institution_id, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [user.name, user.email, user.password, user.role_id, user.institution_id, user.is_active]
        );
        
        console.log(`✓ Usuário criado: ${user.email} (${roles.find(r => r.id === user.role_id)?.name})`);
      } catch (error) {
        console.log(`❌ Erro ao criar usuário ${user.email}:`, error);
      }
    }
    
    // Verificar total de usuários
    const countResult = await client.query('SELECT COUNT(*) as total FROM users');
    console.log(`\n✓ Total de usuários no banco: ${countResult.rows[0].total}`);
    
    console.log('\n✅ Processo concluído com sucesso!');
    
  } catch (error) {
    console.log('❌ Erro geral:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Executar
createDefaultUsers();