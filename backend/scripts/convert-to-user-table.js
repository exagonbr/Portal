/**
 * Script para converter a tabela "User" (UUID) para "user" (integer)
 * em vez de tentar converter os IDs inteiros para UUID
 */

const knex = require('knex');
const knexConfig = require('../knexfile');
const fs = require('fs');

const db = knex(knexConfig.development);

async function convertToUserTable() {
  try {
    console.log('Iniciando processo de conversão...');
    
    // Verificar se as tabelas existem
    const userCapitalizedExists = await db.schema.hasTable('User');
    if (!userCapitalizedExists) {
      console.log('❌ Tabela "User" não encontrada.');
      process.exit(1);
    }
    
    // Contar registros antes da conversão
    const userCount = await db('User').count('id as count').first();
    console.log(`Registros na tabela "User" (origem): ${userCount.count}`);
    
    // 1. Renomear a tabela User para User_temp
    console.log('Renomeando "User" para "User_temp"...');
    await db.schema.renameTable('User', 'User_temp');
    
    // 2. Criar nova tabela "user" com ID como inteiro
    console.log('Criando nova tabela "user" com ID como inteiro...');
    await db.schema.createTable('user', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.string('email').unique();
      table.string('password');
      table.string('address');
      table.string('phone');
      table.string('usuario');
      table.string('role_id');
      table.string('institution_id');
      table.string('school_id');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
      // Adicionar outros campos necessários
    });
    
    // 3. Copiar dados de User_temp para user
    console.log('Copiando dados...');
    const users = await db('User_temp').select('*');
    console.log(`Encontrados ${users.length} registros para copiar`);
    
    // Criar um mapeamento de UUIDs para IDs inteiros
    const idMap = {};
    let insertedCount = 0;
    let errorCount = 0;
    
    // Inserir registros um a um para manter o controle
    for (const user of users) {
      try {
        // Inserir na nova tabela, ignorando campos que não existem
        const [newId] = await db('user').insert({
          name: user.name,
          email: user.email,
          password: user.password,
          address: user.address,
          phone: user.phone,
          usuario: user.usuario,
          role_id: user.role_id,
          institution_id: user.institution_id,
          school_id: user.school_id,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at
        });
        
        // Guardar mapeamento de IDs
        idMap[user.id] = newId;
        insertedCount++;
        
        if (insertedCount % 100 === 0) {
          console.log(`Progresso: ${insertedCount} registros processados`);
        }
      } catch (err) {
        errorCount++;
        console.error(`❌ Erro ao inserir usuário ${user.id}: ${err.message}`);
      }
    }
    
    // 4. Contar registros após a conversão
    const newUserCount = await db('user').count('id as count').first();
    
    console.log(`
✅ Conversão concluída: 
- ${insertedCount} registros processados
- ${newUserCount.count} registros na nova tabela "user"
- ${errorCount} erros encontrados
    `);
    
    // Salvar o mapeamento de IDs em um arquivo para referência futura
    fs.writeFileSync('id_mapping_uuid_to_int.json', JSON.stringify(idMap, null, 2));
    console.log('✅ Mapeamento de IDs salvo em id_mapping_uuid_to_int.json');
    
  } catch (error) {
    console.error(`❌ Erro durante a conversão: ${error.message}`);
  } finally {
    // Fechar a conexão com o banco
    await db.destroy();
  }
}

// Executar a função
convertToUserTable(); 