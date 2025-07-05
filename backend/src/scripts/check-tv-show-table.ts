import { AppDataSource } from '../config/typeorm.config';

async function checkTvShowTable() {
  try {
    // Inicializar conexão
    await AppDataSource.initialize();
    console.log('✅ Conexão com banco de dados estabelecida');

    // Verificar se a tabela tv_show existe
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tv_show'
      );
    `;

    const [tableExists] = await AppDataSource.query(tableCheckQuery);
    console.log('Tabela tv_show existe?', tableExists.exists);

    if (tableExists.exists) {
      // Contar registros
      const countQuery = `SELECT COUNT(*) as total FROM tv_show WHERE deleted IS NULL OR deleted = false`;
      const [count] = await AppDataSource.query(countQuery);
      console.log('Total de registros na tabela tv_show:', count.total);

      // Buscar o registro com ID 9
      const recordQuery = `SELECT * FROM tv_show WHERE id = 9`;
      const record = await AppDataSource.query(recordQuery);
      
      if (record.length > 0) {
        console.log('Registro com ID 9 encontrado:', record[0]);
      } else {
        console.log('❌ Registro com ID 9 não encontrado');
      }
    } else {
      console.log('❌ Tabela tv_show não existe!');
      
      // Listar todas as tabelas que contém "tv" no nome
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%tv%'
        ORDER BY table_name;
      `;
      
      const tables = await AppDataSource.query(tablesQuery);
      console.log('\nTabelas encontradas com "tv" no nome:');
      tables.forEach((t: any) => console.log(`- ${t.table_name}`));
    }

  } catch (error) {
    console.log('❌ Erro:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

checkTvShowTable();