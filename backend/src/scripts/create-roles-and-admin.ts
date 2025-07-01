import db from '../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function createRolesAndAdmin() {
  try {
    console.log('🚀 Criando roles e usuário administrador...\n');
    
    // 1. Definir todas as roles necessárias
    const roles = [
      {
        id: uuidv4(),
        name: 'SYSTEM_ADMIN',
        description: 'Administrador do Sistema - Acesso total',
        type: 'system'
      },
      {
        id: uuidv4(),
        name: 'ADMIN',
        description: 'Administrador Institucional',
        type: 'system'
      },
      {
        id: uuidv4(),
        name: 'TEACHER',
        description: 'Professor - Gerencia turmas e conteúdos',
        type: 'system'
      },
      {
        id: uuidv4(),
        name: 'STUDENT',
        description: 'Estudante - Acesso aos conteúdos educacionais',
        type: 'system'
      },
      {
        id: uuidv4(),
        name: 'COORDINATOR',
        description: 'Coordenador Pedagógico - Supervisiona professores e cursos',
        type: 'system'
      },
      {
        id: uuidv4(),
        name: 'GUARDIAN',
        description: 'Responsável/Tutor - Acompanha progresso dos estudantes',
        type: 'system'
      },
      {
        id: uuidv4(),
        name: 'MANAGER',
        description: 'Gestor Escolar - Administra unidade educacional',
        type: 'system'
      },
      {
        id: uuidv4(),
        name: 'PRINCIPAL',
        description: 'Diretor - Dirige instituição educacional',
        type: 'system'
      },
      {
        id: uuidv4(),
        name: 'SECRETARY',
        description: 'Secretário - Gerencia documentos e matrículas',
        type: 'system'
      },
      {
        id: uuidv4(),
        name: 'LIBRARIAN',
        description: 'Bibliotecário - Gerencia acervo e empréstimos',
        type: 'system'
      }
    ];

    // 2. Criar ou atualizar roles
    console.log('📋 Criando/atualizando roles...');
    for (const role of roles) {
      const existingRole = await db('roles')
        .where('name', role.name)
        .first();

      if (existingRole) {
        await db('roles')
          .where('name', role.name)
          .update({
            description: role.description,
            type: role.type,
            active: true,
            updated_at: new Date()
          });
        console.log(`   ✅ Role atualizada: ${role.name}`);
      } else {
        await db('roles').insert({
          ...role,
          active: true,
          user_count: 0,
          status: 'active'
        });
        console.log(`   ✅ Role criada: ${role.name}`);
      }
    }

    // 3. Buscar role SYSTEM_ADMIN
    const adminRole = await db('roles')
      .where('name', 'SYSTEM_ADMIN')
      .first();

    if (!adminRole) {
      console.log('❌ Role SYSTEM_ADMIN não encontrada!');
      return;
    }

    // 4. Buscar instituição padrão existente
    let institution = await db('institution')
      .where('name', 'Sabercon Educação')
      .first();

    if (!institution) {
      console.log('📋 Nenhuma instituição "Sabercon Educação" encontrada. Usando a primeira disponível...');
      institution = await db('institution')
        .where('deleted', false)
        .first();
      
      if (!institution) {
        console.log('❌ Nenhuma instituição ativa encontrada!');
        return;
      }
    }
    
    console.log(`✅ Usando instituição: ${institution.name} (ID: ${institution.id})`)

    // 5. Verificar se usuário admin já existe
    const existingAdmin = await db('users')
      .where('email', 'admin@portal.com')
      .first();

    if (existingAdmin) {
      console.log('\n⚠️  Usuário admin já existe!');
      
      // Atualizar usuário existente
      await db('users')
        .where('id', existingAdmin.id)
        .update({
          name: 'Administrador do Sistema',
          role_id: adminRole.id,
          institution_id: null, // Temporariamente null devido à incompatibilidade de tipos
          is_active: true,
          password: await bcrypt.hash('admin123', 12),
          updated_at: new Date()
        });
      console.log('✅ Usuário admin atualizado!');
    } else {
      // 6. Criar usuário admin
      console.log('\n📋 Criando usuário administrador...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await db('users').insert({
        id: uuidv4(),
        email: 'admin@portal.com',
        password: hashedPassword,
        name: 'Administrador do Sistema',
        role_id: adminRole.id,
        institution_id: null, // Temporariamente null devido à incompatibilidade de tipos
        is_active: true
      });
      
      console.log('✅ Usuário admin criado com sucesso!');
    }

    // 7. Criar usuários de exemplo para cada role
    console.log('\n📋 Criando usuários de exemplo...');
    
    const exampleUsers = [
      { name: 'Professor Exemplo', email: 'professor@portal.com', role: 'TEACHER' },
      { name: 'Estudante Exemplo', email: 'estudante@portal.com', role: 'STUDENT' },
      { name: 'Coordenador Exemplo', email: 'coordenador@portal.com', role: 'COORDINATOR' },
      { name: 'Responsável Exemplo', email: 'responsavel@portal.com', role: 'GUARDIAN' },
      { name: 'Gestor Exemplo', email: 'gestor@portal.com', role: 'MANAGER' }
    ];

    for (const user of exampleUsers) {
      const role = await db('roles').where('name', user.role).first();
      const existingUser = await db('users').where('email', user.email).first();
      
      if (!existingUser && role) {
        await db('users').insert({
          id: uuidv4(),
          email: user.email,
          password: await bcrypt.hash('123456', 12),
          name: user.name,
          role_id: role.id,
          institution_id: null, // Temporariamente null devido à incompatibilidade de tipos
          is_active: true
        });
        console.log(`   ✅ Usuário criado: ${user.name} (${user.role})`);
      }
    }

    console.log('\n🎉 PROCESSO CONCLUÍDO!');
    console.log('==========================================');
    console.log('👤 USUÁRIOS CRIADOS:');
    console.log('📧 admin@portal.com - Senha: admin123 (SYSTEM_ADMIN)');
    console.log('📧 professor@portal.com - Senha: 123456 (TEACHER)');
    console.log('📧 estudante@portal.com - Senha: 123456 (STUDENT)');
    console.log('📧 coordenador@portal.com - Senha: 123456 (COORDINATOR)');
    console.log('📧 responsavel@portal.com - Senha: 123456 (GUARDIAN)');
    console.log('📧 gestor@portal.com - Senha: 123456 (MANAGER)');
    console.log('==========================================');
    
  } catch (error) {
    console.log('❌ Erro:', error);
  } finally {
    await db.destroy();
  }
}

createRolesAndAdmin(); 