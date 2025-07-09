import db from '../config/database';

async function createInstitutionTable() {
  try {
    console.log('🔍 Verificando se a tabela institution existe...');
    
    // Verificar se a tabela já existe
    const tableExists = await db.schema.hasTable('institution');
    
    if (tableExists) {
      console.log('✅ Tabela institution já existe');
      
      // Verificar se há dados
      const count = await db('institution').count('* as count').first();
      console.log(`📊 Registros encontrados: ${count?.count || 0}`);
      
      if (!count?.count || parseInt(count.count as string) === 0) {
        console.log('📝 Inserindo dados de teste...');
        await insertTestData();
      }
    } else {
      console.log('📦 Criando tabela institution...');
      
      await db.schema.createTable('institution', (table) => {
        table.increments('id').primary();
        table.integer('version').nullable();
        table.string('accountable_contact').notNullable();
        table.string('accountable_name').notNullable();
        table.string('company_name').notNullable();
        table.string('complement').nullable();
        table.boolean('contract_disabled').defaultTo(false);
        table.string('contract_invoice_num').nullable();
        table.integer('contract_num').nullable();
        table.timestamp('contract_term_end').notNullable();
        table.timestamp('contract_term_start').notNullable();
        table.timestamp('date_created').nullable();
        table.boolean('deleted').defaultTo(false);
        table.string('district').notNullable();
        table.string('document').notNullable();
        table.timestamp('invoice_date').nullable();
        table.timestamp('last_updated').nullable();
        table.string('name').notNullable();
        table.string('postal_code').notNullable();
        table.string('state').notNullable();
        table.string('street').notNullable();
        table.integer('score').nullable();
        table.boolean('has_library_platform').defaultTo(false);
        table.boolean('has_principal_platform').defaultTo(false);
        table.boolean('has_student_platform').defaultTo(false);
        table.timestamps(true, true);
      });
      
      console.log('✅ Tabela institution criada com sucesso');
      console.log('📝 Inserindo dados de teste...');
      await insertTestData();
    }
    
    console.log('🎉 Processo concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.destroy();
  }
}

async function insertTestData() {
  try {
    await db('institution').insert([
      {
        version: 1,
        accountable_contact: 'admin@sabercon.edu.br',
        accountable_name: 'Administrador Sabercon',
        company_name: 'Portal Sabercon LTDA',
        complement: 'Sala 101',
        contract_disabled: false,
        contract_invoice_num: 'INV-2025-001',
        contract_num: 2025001,
        contract_term_end: new Date('2025-12-31'),
        contract_term_start: new Date('2025-01-01'),
        date_created: new Date(),
        deleted: false,
        district: 'Centro',
        document: '12.345.678/0001-90',
        invoice_date: new Date(),
        last_updated: new Date(),
        name: 'Portal Sabercon - Sede',
        postal_code: '01310-100',
        state: 'SP',
        street: 'Av. Paulista, 1000',
        score: 100,
        has_library_platform: true,
        has_principal_platform: true,
        has_student_platform: true
      },
      {
        version: 1,
        accountable_contact: 'contato@escolamunicipal.edu.br',
        accountable_name: 'Diretor Municipal',
        company_name: 'Escola Municipal Santos Dumont',
        complement: 'Prédio Principal',
        contract_disabled: false,
        contract_invoice_num: 'INV-2025-002',
        contract_num: 2025002,
        contract_term_end: new Date('2025-12-31'),
        contract_term_start: new Date('2025-01-01'),
        date_created: new Date(),
        deleted: false,
        district: 'Vila Nova',
        document: '98.765.432/0001-10',
        invoice_date: new Date(),
        last_updated: new Date(),
        name: 'Escola Municipal Santos Dumont',
        postal_code: '04567-890',
        state: 'SP',
        street: 'Rua das Flores, 123',
        score: 85,
        has_library_platform: true,
        has_principal_platform: true,
        has_student_platform: true
      },
      {
        version: 1,
        accountable_contact: 'diretoria@ifsp.edu.br',
        accountable_name: 'Reitor IFSP',
        company_name: 'Instituto Federal de São Paulo',
        complement: 'Campus São Paulo',
        contract_disabled: false,
        contract_invoice_num: 'INV-2025-003',
        contract_num: 2025003,
        contract_term_end: new Date('2025-12-31'),
        contract_term_start: new Date('2025-01-01'),
        date_created: new Date(),
        deleted: false,
        district: 'Bela Vista',
        document: '10.882.594/0001-65',
        invoice_date: new Date(),
        last_updated: new Date(),
        name: 'Instituto Federal de São Paulo',
        postal_code: '01308-000',
        state: 'SP',
        street: 'Rua Pedro Vicente, 625',
        score: 95,
        has_library_platform: true,
        has_principal_platform: true,
        has_student_platform: true
      }
    ]);
    
    console.log('✅ Dados de teste inseridos na tabela institution');
  } catch (error) {
    console.error('❌ Erro ao inserir dados:', error);
  }
}

createInstitutionTable(); 