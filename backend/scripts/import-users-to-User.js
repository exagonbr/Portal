/**
 * Script para importar dados da tabela "user" para "User"
 * 
 * Este script lida com a diferença de estrutura entre as tabelas.
 */

const knex = require('knex');
const knexConfig = require('../knexfile');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const db = knex(knexConfig.development);

async function importUsers() {
  try {
    console.log('Iniciando importação de usuários...');
    
    // Verificar tabelas
    const userLowerExists = await db.schema.hasTable('user');
    if (!userLowerExists) {
      console.log('❌ Tabela "user" não encontrada.');
      process.exit(1);
    }
    
    const userUpperExists = await db.schema.hasTable('User');
    if (!userUpperExists) {
      console.log('❌ Tabela "User" não encontrada.');
      process.exit(1);
    }
    
    // Contagem de registros antes
    const userLowerCount = await db('user').count('id as count').first();
    console.log(`Registros na tabela "user" (origem): ${userLowerCount.count}`);
    
    const userUpperCount = await db('User').count('id as count').first();
    console.log(`Registros na tabela "User" (destino): ${userUpperCount.count}`);
    
    // Obter usuários da tabela user (origem)
    const users = await db('user').select(
      'id',
      'full_name as name',
      'email',
      'password',
      'address',
      'phone',
      'username as usuario',
      'institution_id',
      'created_at',
      'updated_at'
    );
    
    console.log(`Encontrados ${users.length} registros para importar.`);
    
    // Criar um mapeamento de IDs (inteiro para UUID)
    const idMap = {};
    let insertedCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    // Processar cada usuário
    for (const user of users) {
      try {
        // Verificar se o e-mail já existe na tabela User
        const existingUser = await db('User').where({ email: user.email }).first();
        
        if (existingUser) {
          skipCount++;
          continue; // Pular este usuário
        }
        
        // Gerar um novo UUID para este usuário
        const newId = uuidv4();
        
        // Guardar o mapeamento de IDs
        idMap[user.id] = newId;
        
        // Inserir na tabela User
        await db('User').insert({
          id: newId,
          name: user.name || 'Nome não informado',
          email: user.email,
          password: user.password || null,
          address: user.address || null,
          phone: user.phone || null,
          usuario: user.usuario || null,
          institution_id: null, // Converter depois se necessário
          is_active: true,
          created_at: user.created_at || new Date(),
          updated_at: user.updated_at || new Date()
        });
        
        insertedCount++;
        
        if (insertedCount % 100 === 0) {
          console.log(`Progresso: ${insertedCount} registros processados`);
        }
      } catch (err) {
        errorCount++;
        console.log(`❌ Erro ao inserir usuário ${user.id}: ${err.message}`);
      }
    }
    
    // Salvar o mapeamento de IDs em um arquivo para referência futura
    fs.writeFileSync('id_mapping_int_to_uuid.json', JSON.stringify(idMap, null, 2));
    
    // Contagem final
    const finalCount = await db('User').count('id as count').first();
    
    console.log(`
✅ Importação concluída: 
- ${insertedCount} registros importados
- ${skipCount} registros ignorados (e-mail duplicado)
- ${errorCount} erros encontrados
- Total na tabela User: ${finalCount.count} registros
    `);
    
    console.log('✅ Mapeamento de IDs salvo em id_mapping_int_to_uuid.json');
    
  } catch (error) {
    console.log(`❌ Erro durante a importação: ${error.message}`);
  } finally {
    // Fechar a conexão
    await db.destroy();
  }
}

// Executar a função
importUsers(); 