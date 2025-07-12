import { NextRequest, NextResponse } from 'next/server'
import { getSafeConnection } from '../../../lib/database-safe'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

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

interface SeedConfig {
  users?: boolean
  institutions?: boolean
  content?: boolean
}

interface SeedRequest {
  selectedTables: string[]
  seedConfig: SeedConfig
}


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    const { selectedTables, seedConfig }: SeedRequest = await request.json()
    
    // Obter conexão segura
    const db = await getSafeConnection()
    
    let recordsGenerated = 0
    const details: Array<{ table: string; records: number }> = []
    
    // 1. Gerar instituições de exemplo
    if (seedConfig.institutions) {
      const institutionsData = [
        {
          id: uuidv4(),
          name: 'Escola Municipal João Silva',
          company_name: 'Prefeitura Municipal - Educação',
          accountable_name: 'Maria Santos',
          accountable_contact: 'maria.santos@escola.gov.br',
          document: '12.345.678/0001-90',
          street: 'Rua das Flores, 123',
          district: 'Centro',
          state: 'SP',
          postal_code: '12345-678',
          contract_disabled: false,
          contract_term_start: new Date(),
          contract_term_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          deleted: false,
          has_library_platform: true,
          has_principal_platform: true,
          has_student_platform: true
        },
        {
          id: uuidv4(),
          name: 'Colégio Estadual Dom Pedro',
          company_name: 'Secretaria de Educação do Estado',
          accountable_name: 'João Oliveira',
          accountable_contact: 'joao.oliveira@colegio.sp.gov.br',
          document: '23.456.789/0001-01',
          street: 'Av. Principal, 456',
          district: 'Vila Nova',
          state: 'SP',
          postal_code: '23456-789',
          contract_disabled: false,
          contract_term_start: new Date(),
          contract_term_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          deleted: false,
          has_library_platform: true,
          has_principal_platform: true,
          has_student_platform: true
        }
      ]
      
      for (const institution of institutionsData) {
        const existing = await db('institution').where('name', institution.name).first()
        if (!existing) {
          await db('institution').insert(institution)
          recordsGenerated++
        }
      }
      
      details.push({ table: 'institution', records: institutionsData.length })
    }
    
    // 2. Gerar usuários de teste
    if (seedConfig.users) {
      const hashedPassword = await bcrypt.hash('test123', 12)
      
      // Buscar roles existentes
      const roles = await db('roles').select('*')
      const roleMap = roles.reduce((acc: any, role: any) => {
        acc[role.name] = role.id
        return acc
      }, {})
      
      // Buscar instituições
      const institutions = await db('institution').select('*').limit(2)
      
      const testUsers = [
        {
          id: uuidv4(),
          email: 'teste.admin@escola.com',
          password: hashedPassword,
          name: 'Administrador de Teste',
          role_id: roleMap['SYSTEM_ADMIN'] || roleMap['ADMIN'],
          institution_id: institutions[0]?.id,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          email: 'teste.professor@escola.com',
          password: hashedPassword,
          name: 'Professor de Teste',
          role_id: roleMap['TEACHER'] || roleMap['PROFESSOR'],
          institution_id: institutions[0]?.id,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          email: 'teste.aluno@escola.com',
          password: hashedPassword,
          name: 'Aluno de Teste',
          role_id: roleMap['STUDENT'] || roleMap['ALUNO'],
          institution_id: institutions[1]?.id,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          email: 'teste.gestor@escola.com',
          password: hashedPassword,
          name: 'Gestor de Teste',
          role_id: roleMap['INSTITUTION_MANAGER'] || roleMap['GESTOR'],
          institution_id: institutions[0]?.id,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
      
      // Verificar quais tabelas de usuários existem
      const userTables = []
      const usersTableExists = await db.schema.hasTable('users')
      const userTableExists = await db.schema.hasTable('user')
      
      if (usersTableExists) userTables.push('users')
      if (userTableExists) userTables.push('user')
      
      let usersCreated = 0
      for (const userData of testUsers) {
        for (const tableName of userTables) {
          try {
            const existing = await db(tableName).where('email', userData.email).first()
            if (!existing) {
              // Verificar colunas disponíveis
              const columns = await db.raw(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = ? 
                ORDER BY ordinal_position
              `, [tableName])
              
              const availableColumns = columns.rows.map((row: any) => row.column_name)
              
              // Filtrar dados para colunas existentes
              const filteredData: Record<string, any> = {}
              for (const [key, value] of Object.entries(userData)) {
                if (availableColumns.includes(key)) {
                  filteredData[key] = value
                }
              }
              
              // Mapeamentos alternativos
              if (!availableColumns.includes('name') && availableColumns.includes('full_name')) {
                filteredData['full_name'] = userData.name
                delete filteredData['name']
              }
              
              if (!availableColumns.includes('is_active') && availableColumns.includes('enabled')) {
                filteredData['enabled'] = userData.is_active
                delete filteredData['is_active']
              }
              
              await db(tableName).insert(filteredData)
              usersCreated++
            }
          } catch (error) {
            console.log(`Erro ao criar usuário ${userData.email} na tabela ${tableName}:`, error)
          }
        }
      }
      
      recordsGenerated += usersCreated
      details.push({ table: 'users/user', records: usersCreated })
    }
    
    // 3. Gerar conteúdo de demonstração
    if (seedConfig.content) {
      // Verificar se tabelas de conteúdo existem
      const booksTableExists = await db.schema.hasTable('books')
      const collectionsTableExists = await db.schema.hasTable('collections')
      
      let contentRecords = 0
      
      if (booksTableExists) {
        const sampleBooks = [
          {
            id: uuidv4(),
            title: 'Matemática Básica - 5º Ano',
            author: 'Prof. Ana Silva',
            isbn: '978-85-123-4567-8',
            description: 'Livro didático de matemática para o ensino fundamental',
            category: 'Educação',
            language: 'pt-BR',
            pages: 120,
            published_year: 2023,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            title: 'História do Brasil - 6º Ano',
            author: 'Prof. Carlos Santos',
            isbn: '978-85-987-6543-2',
            description: 'História do Brasil para estudantes do ensino fundamental',
            category: 'História',
            language: 'pt-BR',
            pages: 180,
            published_year: 2023,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }
        ]
        
        for (const book of sampleBooks) {
          const existing = await db('books').where('isbn', book.isbn).first()
          if (!existing) {
            await db('books').insert(book)
            contentRecords++
          }
        }
      }
      
      if (collectionsTableExists) {
        const sampleCollections = [
          {
            id: uuidv4(),
            name: 'Ensino Fundamental I',
            description: 'Coleção de livros para o ensino fundamental I (1º ao 5º ano)',
            category: 'Educação Básica',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: uuidv4(),
            name: 'Ensino Fundamental II',
            description: 'Coleção de livros para o ensino fundamental II (6º ao 9º ano)',
            category: 'Educação Básica',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }
        ]
        
        for (const collection of sampleCollections) {
          const existing = await db('collections').where('name', collection.name).first()
          if (!existing) {
            await db('collections').insert(collection)
            contentRecords++
          }
        }
      }
      
      if (contentRecords > 0) {
        recordsGenerated += contentRecords
        details.push({ table: 'content', records: contentRecords })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Dados seed gerados com sucesso!',
      recordsGenerated,
      details,
      tablesProcessed: details.map(d => d.table, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    })
    
  } catch (error: any) {
    console.log('Erro ao gerar seed:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 })
  }
}
