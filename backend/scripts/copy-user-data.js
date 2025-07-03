/**
 * Script para copiar dados da tabela "user" para a tabela "User"
 * 
 * Este script lida com a diferença de tipos entre as tabelas,
 * convertendo IDs inteiros para UUID.
 */

const knex = require('knex');
const knexConfig = require('../knexfile');
const { v4: uuidv4 } = require('uuid');

const db = knex(knexConfig.development);

async function copyUserData() {
  try {
    console.log('Iniciando cópia de dados...');
    
    // Verificar se a tabela "user" existe
    const userTableExists = await db.schema.hasTable('user');
    if (!userTableExists) {
      console.log('❌ Tabela "user" não encontrada. Nenhum dado foi copiado.');
      process.exit(0);
    }
    
    // Verificar se a tabela "User" existe
    const userCapitalizedExists = await db.schema.hasTable('User');
    if (!userCapitalizedExists) {
      console.log('❌ Tabela "User" não encontrada. A tabela de destino não existe.');
      process.exit(1);
    }
    
    // Obter informações sobre as colunas
    const oldUserColumns = await db('user').columnInfo();
    const newUserColumns = await db('User').columnInfo();
    
    // Encontrar colunas comuns exceto 'id'
    const commonColumns = Object.keys(oldUserColumns)
      .filter(column => Object.keys(newUserColumns).includes(column) && column !== 'id');
    
    console.log(`Colunas comuns encontradas: ${commonColumns.join(', ')}`);
    
    // Obter os dados da tabela original
    const users = await db('user').select('*');
    console.log(`Encontrados ${users.length} registros na tabela "user"`);
    
    if (users.length === 0) {
      console.log('Nenhum dado para copiar.');
      process.exit(0);
    }
    
    // Criar um mapeamento de IDs antigos para novos UUIDs
    const idMap = {};
    
    // Inserir os dados na nova tabela com novos UUIDs
    let insertedCount = 0;
    let errorCount = 0;
    
    // Processa cada registro individualmente
    for (const user of users) {
      try {
        // Gerar um novo UUID para este usuário
        const newId = uuidv4();
        idMap[user.id] = newId;
        
        // Criar um novo objeto com as colunas comuns e o novo ID
        const newUser = {};
        commonColumns.forEach(column => {
          newUser[column] = user[column];
        });
        newUser.id = newId;
        
        // Inserir o usuário com o novo ID UUID
        await db('User').insert(newUser);
        insertedCount++;
        
        console.log(`✅ Usuário inserido: ID antigo ${user.id} -> novo UUID ${newId}`);
      } catch (err) {
        errorCount++;
        console.error(`❌ Erro ao inserir usuário ${user.id}: ${err.message}`);
      }
    }
    
    console.log(`
✅ Processo concluído: 
- ${insertedCount} registros inseridos
- ${errorCount} erros encontrados
- ID mapping: ${JSON.stringify(idMap, null, 2)}
    `);
    
    // Salvar o mapeamento de IDs em um arquivo para referência futura
    const fs = require('fs');
    fs.writeFileSync('id_mapping.json', JSON.stringify(idMap, null, 2));
    console.log('✅ Mapeamento de IDs salvo em id_mapping.json');
    
  } catch (error) {
    console.error(`❌ Erro durante a cópia de dados: ${error.message}`);
  } finally {
    // Fechar a conexão com o banco
    await db.destroy();
  }
}

// Executar a função
copyUserData(); 