/**
 * Script para importar dados da tabela "user" para a tabela "User" usando SQL direto
 */

const knex = require('knex');
const knexConfig = require('../knexfile');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const db = knex(knexConfig.development);

async function importUsers() {
  try {
    console.log('Iniciando importação de usuários...');
    
    // Verificar se a tabela "user" existe
    const userTableExists = await db.schema.hasTable('user');
    if (!userTableExists) {
      console.log('❌ Tabela "user" não encontrada. Nenhum dado foi importado.');
      process.exit(0);
    }
    
    // Verificar se a tabela "User" existe
    const userCapitalizedExists = await db.schema.hasTable('User');
    if (!userCapitalizedExists) {
      console.log('❌ Tabela "User" não encontrada. A tabela de destino não existe.');
      process.exit(1);
    }

    // Contar registros antes da importação
    const beforeCount = await db('User').count('id as count').first();
    console.log(`Registros na tabela "User" antes da importação: ${beforeCount.count}`);
    
    // Obter todos os registros da tabela "user"
    const users = await db('user').select('*');
    console.log(`Encontrados ${users.length} registros na tabela "user" para importar`);
    
    if (users.length === 0) {
      console.log('Nenhum dado para importar.');
      process.exit(0);
    }

    // Criar um mapeamento de IDs antigos para novos UUIDs
    const idMap = {};
    let insertedCount = 0;
    let errorCount = 0;

    // Usar transação para garantir consistência
    await db.transaction(async (trx) => {
      for (const user of users) {
        try {
          // Gerar um novo UUID para este usuário
          const newId = uuidv4();
          idMap[user.id] = newId;
          
          // Criar um objeto com os mesmos campos, mas com novo ID
          const newUser = {
            id: newId,
            name: user.name,
            email: user.email,
            password: user.password,
            address: user.address,
            phone: user.phone,
            institution_id: user.institution_id,
            created_at: user.created_at,
            updated_at: user.updated_at,
            // Incluir outros campos conforme necessário
          };
          
          // Usar SQL bruto para inserir, ignorando duplicatas
          await trx.raw(`
            INSERT INTO "User" ("id", "name", "email", "password", "address", "phone", "institution_id", "created_at", "updated_at")
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT DO NOTHING
          `, [
            newUser.id, 
            newUser.name, 
            newUser.email, 
            newUser.password, 
            newUser.address, 
            newUser.phone, 
            newUser.institution_id, 
            newUser.created_at, 
            newUser.updated_at
          ]);
          
          insertedCount++;
          
          if (insertedCount % 100 === 0) {
            console.log(`Progresso: ${insertedCount} registros processados`);
          }
        } catch (err) {
          errorCount++;
          console.log(`❌ Erro ao inserir usuário ${user.id}: ${err.message}`);
        }
      }
    });
    
    // Contar registros após a importação
    const afterCount = await db('User').count('id as count').first();
    const actualInserted = afterCount.count - beforeCount.count;
    
    console.log(`
✅ Importação concluída: 
- ${insertedCount} registros processados
- ${actualInserted} registros realmente inseridos (verificado no banco)
- ${errorCount} erros encontrados
    `);
    
    // Salvar o mapeamento de IDs em um arquivo para referência futura
    fs.writeFileSync('id_mapping.json', JSON.stringify(idMap, null, 2));
    console.log('✅ Mapeamento de IDs salvo em id_mapping.json');
    
  } catch (error) {
    console.log(`❌ Erro durante a importação: ${error.message}`);
  } finally {
    // Fechar a conexão com o banco
    await db.destroy();
  }
}

// Executar a função
importUsers(); 