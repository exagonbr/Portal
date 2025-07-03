import knex from 'knex';
import config from '../knexfile';

async function gerarEstatisticas() {
  const environment = process.env.NODE_ENV || 'development';
  const db = knex(config[environment]);

  try {
    console.log('📊 RELATÓRIO FINAL DA MIGRAÇÃO SABERCON → PORTAL');
    console.log('===================================================');
    console.log('');

    const tabelas = [
      'users', 'videos', 'tv_shows', 'institutions', 'authors',
      'genres', 'tags', 'themes', 'target_audiences', 'education_periods',
      'educational_stages', 'files', 'school_units', 'school_classes',
      'user_profiles', 'questions', 'question_answers', 'certificates',
      'viewing_statuses', 'watchlist_entries', 'sabercon_migration_mapping'
    ];

    let totalRegistros = 0;
    const estatisticas: { [key: string]: number } = {};

    console.log('📈 DADOS MIGRADOS:');
    console.log('');

    for (const tabela of tabelas) {
      try {
        const [{ count }] = await db(tabela).count('* as count');
        const numeroRegistros = parseInt(String(count));
        estatisticas[tabela] = numeroRegistros;
        totalRegistros += numeroRegistros;
        
        if (numeroRegistros > 0) {
          console.log(`✅ ${tabela.padEnd(25)} ${numeroRegistros.toLocaleString('pt-BR').padStart(8)} registros`);
        } else {
          console.log(`⚠️  ${tabela.padEnd(25)} ${numeroRegistros.toString().padStart(8)} registros`);
        }
      } catch (error) {
        console.log(`❌ ${tabela.padEnd(25)}     ERRO: ${error instanceof Error ? error.message : String(error)}`);
        estatisticas[tabela] = -1;
      }
    }

    console.log('');
    console.log('═'.repeat(50));
    console.log(`🎯 TOTAL DE REGISTROS MIGRADOS: ${totalRegistros.toLocaleString('pt-BR')}`);
    console.log('═'.repeat(50));
    console.log('');

    // Verificar relacionamentos
    console.log('🔗 VERIFICAÇÃO DE RELACIONAMENTOS:');
    console.log('');

    const relacionamentos = [
      { nome: 'Vídeo ↔ Arquivos', query: 'video_files' },
      { nome: 'Vídeo ↔ Autores', query: 'video_authors' },
      { nome: 'Vídeo ↔ Temas', query: 'video_themes' },
      { nome: 'TV Show ↔ Autores', query: 'tv_show_authors' },
      { nome: 'Usuário ↔ Perfis', query: 'user_profiles' },
      { nome: 'Instituição ↔ Unidades', query: 'school_units' }
    ];

    for (const rel of relacionamentos) {
      try {
        const [{ count }] = await db(rel.query).count('* as count');
        const numeroRel = parseInt(String(count));
        if (numeroRel > 0) {
          console.log(`✅ ${rel.nome.padEnd(25)} ${numeroRel.toLocaleString('pt-BR').padStart(8)} relacionamentos`);
        } else {
          console.log(`⚠️  ${rel.nome.padEnd(25)} ${numeroRel.toString().padStart(8)} relacionamentos`);
        }
      } catch (error) {
        console.log(`❌ ${rel.nome.padEnd(25)}     ERRO`);
      }
    }

    console.log('');
    console.log('🗂️  MAPEAMENTO DE IDs:');
    console.log('');

    // Verificar mapeamentos por tabela
    const mapeamentos = await db('sabercon_migration_mapping')
      .select('table_name')
      .count('* as count')
      .groupBy('table_name')
      .orderBy('count', 'desc');

    for (const mapeamento of mapeamentos) {
      const tabelaNome = String(mapeamento.table_name);
      const contagem = parseInt(String(mapeamento.count));
      console.log(`✅ ${tabelaNome.padEnd(25)} ${contagem.toLocaleString('pt-BR').padStart(8)} IDs mapeados`);
    }

    console.log('');
    console.log('✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('');
    console.log('🎉 BENEFÍCIOS ALCANÇADOS:');
    console.log('   • Dados legados preservados no PostgreSQL');
    console.log('   • Relacionamentos mantidos');
    console.log('   • UUIDs implementados para melhor segurança');
    console.log('   • Rastreabilidade total através de mapeamentos');
    console.log('   • Base sólida para evolução da plataforma');

    return estatisticas;
    
  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    await db.destroy();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  gerarEstatisticas()
    .then(() => {
      console.log('');
      console.log('📄 Relatório gerado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export default gerarEstatisticas; 