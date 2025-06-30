import { NextRequest, NextResponse } from 'next/server'
import db from '../../../../../backend/src/config/database'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

// Função para criar headers CORS
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

// Função para resposta OPTIONS
function createCorsOptionsResponse(origin?: string) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin)
  })
}

// Definição dos usuários padrão
const defaultUsers = [
  {
    email: 'admin@sabercon.edu.br',
    name: 'Administrador do Sistema',
    role: 'SYSTEM_ADMIN',
    description: 'Acesso completo ao sistema'
  },
  {
    email: 'gestor@sabercon.edu.br',
    name: 'Gestor Institucional',
    role: 'INSTITUTION_MANAGER',
    description: 'Gerencia operações institucionais'
  },
  {
    email: 'professor@sabercon.edu.br',
    name: 'Professor do Sistema',
    role: 'TEACHER',
    description: 'Professor com acesso a turmas e conteúdos'
  },
  {
    email: 'julia.c@ifsp.com',
    name: 'Julia Costa Ferreira',
    role: 'STUDENT',
    description: 'Estudante do IFSP'
  },
  {
    email: 'coordenador@sabercon.edu.com',
    name: 'Coordenador Acadêmico',
    role: 'ACADEMIC_COORDINATOR',
    description: 'Coordena atividades acadêmicas'
  },
  {
    email: 'renato@gmail.com',
    name: 'Renato Oliveira Silva',
    role: 'GUARDIAN',
    description: 'Responsável por estudante'
  }
]

// Definição das roles e suas permissões
const rolesData = [
  {
    name: 'SYSTEM_ADMIN',
    description: 'Administrador do Sistema - Acesso completo',
    permissions: ['system.manage', 'users.manage', 'institutions.manage', 'portal.access', 'admin.full']
  },
  {
    name: 'INSTITUTION_MANAGER',
    description: 'Gestor Institucional - Gerencia operações da instituição',
    permissions: ['users.manage.institution', 'classes.manage', 'schedules.manage', 'portal.access']
  },
  {
    name: 'TEACHER',
    description: 'Professor - Gerencia turmas e conteúdos',
    permissions: ['classes.teach', 'students.manage', 'content.manage', 'grades.manage', 'portal.access']
  },
  {
    name: 'STUDENT',
    description: 'Estudante - Acessa conteúdos e atividades',
    permissions: ['content.access', 'assignments.submit', 'grades.view.own', 'portal.access']
  },
  {
    name: 'ACADEMIC_COORDINATOR',
    description: 'Coordenador Acadêmico - Coordena atividades pedagógicas',
    permissions: ['curriculum.manage', 'teachers.coordinate', 'classes.coordinate', 'portal.access']
  },
  {
    name: 'GUARDIAN',
    description: 'Responsável - Acompanha progresso de estudantes',
    permissions: ['children.view.info', 'children.view.grades', 'announcements.receive', 'portal.access']
  }
]


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando criação automática de usuários padrão...')

    // 1. Verificar/criar instituições
    let saberconInstitution = await db('institution')
      .where('name', 'Sabercon Educação')
      .first()
    
    if (!saberconInstitution) {
      const [newInstitution] = await db('institution').insert({
        name: 'Sabercon Educação',
        company_name: 'Sabercon Educação LTDA',
        accountable_name: 'Administrador Sistema',
        accountable_contact: 'admin@sabercon.edu.br',
        document: '00.000.000/0001-00',
        street: 'Rua Principal, 123',
        district: 'Centro',
        state: 'SP',
        postal_code: '00000-000',
        contract_disabled: false,
        contract_term_start: new Date(),
        contract_term_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        deleted: false,
        has_library_platform: true,
        has_principal_platform: true,
        has_student_platform: true
      }).returning('*')
      saberconInstitution = newInstitution
    }

    // Criar IFSP para a Julia
    let ifspInstitution = await db('institution')
      .where('name', 'Instituto Federal de São Paulo')
      .first()
    
    if (!ifspInstitution) {
      const [newIfsp] = await db('institution').insert({
        name: 'Instituto Federal de São Paulo',
        company_name: 'IFSP - Instituto Federal de São Paulo',
        accountable_name: 'Diretor IFSP',
        accountable_contact: 'contato@ifsp.edu.br',
        document: '11.111.111/0001-11',
        street: 'Av. Federal, 456',
        district: 'Centro Educacional',
        state: 'SP',
        postal_code: '11111-111',
        contract_disabled: false,
        contract_term_start: new Date(),
        contract_term_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        deleted: false,
        has_library_platform: true,
        has_principal_platform: true,
        has_student_platform: true
      }).returning('*')
      ifspInstitution = newIfsp
    }

    // 2. Criar todas as roles e permissões
    const createdRoles: Record<string, any> = {}
    
    for (const roleData of rolesData) {
      // Verificar se a role já existe
      let role = await db('roles').where('name', roleData.name).first()
      
      if (!role) {
        const [newRole] = await db('roles').insert({
          id: uuidv4(),
          name: roleData.name,
          description: roleData.description,
          type: 'system',
          status: 'active',
          active: true,
          user_count: 0,
          created_at: new Date(),
          updated_at: new Date()
        }).returning('*')
        role = newRole
      }
      
      createdRoles[roleData.name] = role

      // Criar permissões para esta role
      for (const permissionName of roleData.permissions) {
        let permission = await db('permissions').where('name', permissionName).first()
        
        if (!permission) {
          const [resource, action] = permissionName.split('.')
          const [newPermission] = await db('permissions').insert({
            id: uuidv4(),
            name: permissionName,
            resource: resource,
            action: action || 'access',
            description: `Permissão: ${permissionName}`,
            created_at: new Date(),
            updated_at: new Date()
          }).returning('*')
          permission = newPermission
        }

        // Associar permissão à role
        const existingAssociation = await db('role_permissions')
          .where({
            role_id: role.id,
            permission_id: permission.id
          })
          .first()

        if (!existingAssociation) {
          await db('role_permissions').insert({
            role_id: role.id,
            permission_id: permission.id,
            created_at: new Date(),
            updated_at: new Date()
          })
        }
      }
    }

    // 3. Verificar quais tabelas de usuários existem
    const userTables = []
    
    // Verificar se a tabela 'users' existe
    const usersTableExists = await db.schema.hasTable('users')
    if (usersTableExists) {
      userTables.push('users')
      console.log('✅ Tabela "users" encontrada')
    }
    
    // Verificar se a tabela 'user' existe
    const userTableExists = await db.schema.hasTable('user')
    if (userTableExists) {
      userTables.push('user')
      console.log('✅ Tabela "user" encontrada')
    }

    if (userTables.length === 0) {
      throw new Error('Nenhuma tabela de usuários encontrada (nem "users" nem "user")')
    }

    console.log(`📋 Criando usuários nas tabelas: ${userTables.join(', ')}`)

    // 4. Criar todos os usuários em ambas as tabelas
    const createdUsers = []
    let usersCreated = 0
    
    for (const userData of defaultUsers) {
      let userExists = false
      let existingUser = null

      // Verificar se o usuário já existe em qualquer uma das tabelas
      for (const tableName of userTables) {
        const existing = await db(tableName).where('email', userData.email).first()
        if (existing) {
          userExists = true
          existingUser = existing
          break
        }
      }
      
      if (userExists && existingUser) {
        // Atualizar usuário existente em todas as tabelas
        const role = createdRoles[userData.role]
        
        for (const tableName of userTables) {
          try {
            await db(tableName)
              .where('email', userData.email)
              .update({
                role_id: role.id,
                is_active: true,
                updated_at: new Date()
              })
            console.log(`   ✅ Usuário ${userData.email} atualizado na tabela ${tableName}`)
          } catch (error) {
            console.log(`   ⚠️ Erro ao atualizar ${userData.email} na tabela ${tableName}:`, error instanceof Error ? error.message : String(error))
          }
        }
        
        createdUsers.push({
          email: userData.email,
          name: userData.name,
          role: userData.role,
          status: 'updated',
          tables: userTables
        })
        continue
      }

      // Determinar instituição
      let institutionId
      if (userData.email.includes('ifsp.com')) {
        institutionId = ifspInstitution.id.toString()
      } else {
        institutionId = saberconInstitution.id.toString()
      }

      // Criar novo usuário em todas as tabelas
      const hashedPassword = await bcrypt.hash('password123', 12)
      const role = createdRoles[userData.role]
      const userId = uuidv4()
      
      const userDataToInsert = {
        id: userId,
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        is_active: true,
        role_id: role.id,
        institution_id: institutionId,
        created_at: new Date(),
        updated_at: new Date()
      }

      const createdInTables = []
      
      for (const tableName of userTables) {
        try {
          // Verificar colunas disponíveis na tabela
          const columns = await db.raw(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = ? 
            ORDER BY ordinal_position
          `, [tableName])
          
          const availableColumns = columns.rows.map((row: any) => row.column_name)
          
          // Filtrar dados para incluir apenas colunas que existem na tabela
          const filteredData: Record<string, any> = {}
          for (const [key, value] of Object.entries(userDataToInsert)) {
            if (availableColumns.includes(key)) {
              filteredData[key] = value
            }
          }
          
          // Se a tabela não tem coluna 'name', tentar 'full_name'
          if (!availableColumns.includes('name') && availableColumns.includes('full_name')) {
            filteredData['full_name'] = userData.name
            delete filteredData['name']
          }
          
          // Se a tabela não tem 'is_active', tentar 'enabled'
          if (!availableColumns.includes('is_active') && availableColumns.includes('enabled')) {
            filteredData['enabled'] = true
            delete filteredData['is_active']
          }

          await db(tableName).insert(filteredData)
          createdInTables.push(tableName)
          console.log(`   ✅ Usuário ${userData.email} criado na tabela ${tableName}`)
        } catch (error) {
          console.log(`   ⚠️ Erro ao criar ${userData.email} na tabela ${tableName}:`, error instanceof Error ? error.message : String(error))
        }
      }
      
      if (createdInTables.length > 0) {
        createdUsers.push({
          email: userData.email,
          name: userData.name,
          role: userData.role,
          status: 'created',
          tables: createdInTables
        })
        usersCreated++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Usuários padrão criados com sucesso!',
      usersCreated,
      totalUsers: defaultUsers.length,
      users: createdUsers,
      tablesUsed: userTables,
      institutions: {
        sabercon: saberconInstitution.id,
        ifsp: ifspInstitution.id
      }
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error: any) {
    console.error('Erro ao criar usuários padrão:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 })
  }
} 
