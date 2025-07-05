import knex from 'knex';
import knexConfig from '../../knexfile.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

interface DefaultUser {
  email: string;
  name: string;
  roleName: string;
  emoji: string;
}

interface CreateUserStats {
  created: number;
  skipped: number;
  errors: number;
}

export class DefaultUsersService {
  private pg: knex.Knex;
  private roleIds: Record<string, string> = {};
  private defaultInstitutionId: string | null = null;
  private defaultSchoolId: string | null = null;
  private stats: CreateUserStats = { created: 0, skipped: 0, errors: 0 };

  constructor() {
    this.pg = knex(knexConfig.development);
  }

  async createDefaultUsers(): Promise<CreateUserStats> {
    try {
      console.log('👤 Criando usuários padrão...');
      
      // Configurar dados necessários
      await this.setupRequirements();
      
      // Lista de usuários padrão
      const defaultUsers: DefaultUser[] = [
        {
          email: 'admin@sabercon.edu.br',
          name: 'Administrador do Sistema',
          roleName: 'SYSTEM_ADMIN',
          emoji: '👑'
        },
        {
          email: 'gestor@sabercon.edu.br',
          name: 'Gestor Institucional',
          roleName: 'INSTITUTION_MANAGER',
          emoji: '🏢'
        },
        {
          email: 'professor@sabercon.edu.br',
          name: 'Professor Demonstração',
          roleName: 'TEACHER',
          emoji: '👨‍🏫'
        },
        {
          email: 'julia.c@ifsp.com',
          name: 'Julia Campos',
          roleName: 'STUDENT',
          emoji: '🎓'
        },
        {
          email: 'coordenador@sabercon.edu.com',
          name: 'Coordenador Acadêmico',
          roleName: 'COORDINATOR',
          emoji: '📚'
        },
        {
          email: 'renato@gmail.com',
          name: 'Renato Silva',
          roleName: 'GUARDIAN',
          emoji: '👨‍👩‍👧‍👦'
        }
      ];

      // Senha padrão para todos os usuários
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Criar cada usuário
      for (const userData of defaultUsers) {
        await this.createSingleUser(userData, hashedPassword);
      }

      console.log(`   ✅ ${this.stats.created} usuários padrão criados`);
      console.log(`   ⚠️ ${this.stats.skipped} usuários já existiam`);
      console.log(`   ❌ ${this.stats.errors} erros`);
      
      return this.stats;
    } catch (error) {
      console.error('❌ Erro ao criar usuários padrão:', error);
      throw error;
    } finally {
      await this.pg.destroy();
    }
  }

  private async createSingleUser(userData: DefaultUser, hashedPassword: string): Promise<void> {
    try {
      // Verificar se usuário já existe
      const existing = await this.pg('users').where('email', userData.email).first();
      
      if (existing) {
        console.log(`   ${userData.emoji} Usuário ${userData.email} já existe, pulando...`);
        this.stats.skipped++;
        return;
      }

      // Verificar se a role existe
      if (!this.roleIds[userData.roleName]) {
        console.log(`   ❌ Role ${userData.roleName} não encontrada para ${userData.email}`);
        this.stats.errors++;
        return;
      }

      console.log(`   ${userData.emoji} Criando usuário ${userData.email}...`);

      // Gerar ID único para o usuário
      const userId = uuidv4();
      
      // Inserir usuário na tabela users com o ID gerado
      await this.pg('users').insert({
        id: userId,
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        is_active: true,
        institution_id: this.defaultInstitutionId,
        school_id: this.defaultSchoolId,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      console.log(`      ✓ Usuário inserido com ID: ${userId}`);

      // Vincular à role na tabela user_roles
      await this.pg('user_roles').insert({
        user_id: userId,
        role_id: this.roleIds[userData.roleName]
      });

      console.log(`      ✓ Role ${userData.roleName} vinculada ao usuário`);
      this.stats.created++;
    } catch (error: any) {
      this.stats.errors++;
      console.log(`   ❌ Erro ao criar usuário ${userData.email}: ${error.message}`);
    }
  }

  private async setupRequirements(): Promise<void> {
    // 1. Obter instituição e escola padrão
    const institution = await this.pg('institutions').where('code', 'MYSQL_MIGRATED').first();
    if (institution) {
      this.defaultInstitutionId = institution.id;
    } else {
      // Criar instituição padrão se não existir
      const [instId] = await this.pg('institutions').insert({
        id: uuidv4(),
        name: 'Instituição Padrão',
        code: 'MYSQL_MIGRATED',
        description: 'Instituição padrão para usuários do sistema',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }).returning('id');
      this.defaultInstitutionId = instId;
    }

    const school = await this.pg('schools').where('code', 'MYSQL_MIGRATED_SCHOOL').first();
    if (school) {
      this.defaultSchoolId = school.id;
    } else {
      // Criar escola padrão se não existir
      const [schoolId] = await this.pg('schools').insert({
        id: uuidv4(),
        name: 'Escola Padrão',
        code: 'MYSQL_MIGRATED_SCHOOL',
        description: 'Escola padrão para usuários do sistema',
        institution_id: this.defaultInstitutionId,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }).returning('id');
      this.defaultSchoolId = schoolId;
    }

    // 2. Obter IDs de todas as roles
    const roles = await this.pg('roles').select('id', 'name');
    for (const role of roles) {
      this.roleIds[role.name] = role.id;
    }

    // 3. Verificar se todas as roles necessárias existem
    const requiredRoles = [
      'SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'TEACHER', 
      'STUDENT', 'COORDINATOR', 'GUARDIAN'
    ];

    for (const roleName of requiredRoles) {
      if (!this.roleIds[roleName]) {
        // Criar role se não existir
        const [roleId] = await this.pg('roles').insert({
          id: uuidv4(),
          name: roleName,
          description: `${roleName} - Role criada automaticamente`,
          type: 'system',
          status: 'active',
          user_count: 0
        }).returning('id');
        
        this.roleIds[roleName] = roleId;
        console.log(`   ✅ Role ${roleName} criada`);
      }
    }
  }
} 