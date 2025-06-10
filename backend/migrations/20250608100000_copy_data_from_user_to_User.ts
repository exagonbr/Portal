import type { Knex } from 'knex';

/**
 * Migração para copiar os dados da tabela "user" para a tabela "User".
 */
export async function up(knex: Knex): Promise<void> {
  // Verificar se a tabela "user" existe
  const userTableExists = await knex.schema.hasTable('user');
  
  if (!userTableExists) {
    console.log('❌ Tabela "user" não encontrada. Nenhum dado foi copiado.');
    return;
  }

  try {
    // Obter a estrutura de colunas da tabela "User"
    const userColumns = await knex('User').columnInfo();
    
    // Obter a estrutura de colunas da tabela "user"
    const oldUserColumns = await knex('user').columnInfo();
    
    // Encontrar colunas comuns entre as duas tabelas
    const commonColumns = Object.keys(userColumns).filter(column => 
      Object.keys(oldUserColumns).includes(column)
    );
    
    console.log(`Colunas comuns encontradas: ${commonColumns.join(', ')}`);
    
    if (commonColumns.length === 0) {
      console.log('❌ Nenhuma coluna em comum encontrada entre as tabelas "user" e "User".');
      return;
    }
    
    // Verificar se já existem dados na tabela "User"
    const userCount = await knex('User').count('id as count').first();
    if (parseInt(userCount?.count as string) > 0) {
      console.log(`⚠️ A tabela "User" já contém ${userCount?.count} registros.`);
      
      // Copiar apenas registros que ainda não existem na tabela User
      await knex.raw(`
        INSERT INTO "User" (${commonColumns.map(c => `"${c}"`).join(', ')})
        SELECT 
          CASE 
            WHEN pg_typeof("id")::text = 'integer' THEN gen_random_uuid()
            ELSE "id"::uuid 
          END as id,
          ${commonColumns.filter(c => c !== 'id').map(c => `"${c}"`).join(', ')}
        FROM "user"
        WHERE NOT EXISTS (
          SELECT 1 FROM "User" WHERE "User"."email" = "user"."email"
        )
      `);
      
      console.log(`✅ Registros copiados da tabela "user" para a tabela "User".`);
    } else {
      // Copiar todos os registros
      await knex.raw(`
        INSERT INTO "User" (${commonColumns.map(c => `"${c}"`).join(', ')})
        SELECT 
          CASE 
            WHEN pg_typeof("id")::text = 'integer' THEN gen_random_uuid()
            ELSE "id"::uuid 
          END as id,
          ${commonColumns.filter(c => c !== 'id').map(c => `"${c}"`).join(', ')}
        FROM "user"
      `);
      
      console.log(`✅ Dados copiados da tabela "user" para a tabela "User".`);
    }
  } catch (error) {
    console.error('❌ Erro ao copiar dados:', error);
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  // A operação de reversão é complexa e pode levar a perda de dados.
  // Em vez disso, simplesmente registramos uma mensagem de aviso.
  console.log('⚠️ Esta migração não pode ser revertida automaticamente. Os dados já foram copiados para a tabela "User".');
} 