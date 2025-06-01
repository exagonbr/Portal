import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  console.log('🌱 Populando dados de exemplo para arquivos e livros...');
  
  // Buscar instituição para usar nos dados
  const institution = await knex('institutions').where('status', 'active').first();
  
  if (!institution) {
    console.log('⚠️  Nenhuma instituição ativa encontrada. Pulando seed de arquivos e livros.');
    return;
  }

  // Primeiro, vamos limpar as tabelas na ordem correta
  await knex('collections').del();
  await knex('books').del();
  await knex('files').del();

  // 1. Arquivos de exemplo para livros
  const bookFiles = await knex('files').insert([
    {
      name: 'Dom Casmurro - Machado de Assis',
      original_name: 'dom_casmurro.pdf',
      type: 'pdf',
      size: 2457600, // ~2.4MB
      size_formatted: '2.4 MB',
      bucket: 'sabercon-books',
      s3_key: 'books/classic/dom_casmurro_machado.pdf',
      s3_url: 'https://sabercon-books.s3.amazonaws.com/books/classic/dom_casmurro_machado.pdf',
      description: 'Obra clássica da literatura brasileira de Machado de Assis',
      category: 'literario',
      metadata: JSON.stringify({
        author: 'Machado de Assis',
        genre: 'Romance',
        year: 1899,
        language: 'pt-BR',
        pages: 180
      }),
      checksum: 'sha256:abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567',
      is_active: true,
      tags: ['literatura', 'clássico', 'romance', 'brasil']
    },
    {
      name: 'O Cortiço - Aluísio Azevedo',
      original_name: 'o_cortico.pdf',
      type: 'pdf',
      size: 1987200, // ~1.9MB
      size_formatted: '1.9 MB',
      bucket: 'sabercon-books',
      s3_key: 'books/classic/o_cortico_aluisio.pdf',
      s3_url: 'https://sabercon-books.s3.amazonaws.com/books/classic/o_cortico_aluisio.pdf',
      description: 'Romance naturalista brasileiro sobre a vida em um cortiço',
      category: 'literario',
      metadata: JSON.stringify({
        author: 'Aluísio Azevedo',
        genre: 'Naturalismo',
        year: 1890,
        language: 'pt-BR',
        pages: 220
      }),
      checksum: 'sha256:def456ghi789jkl012mno345pqr678stu901vwx234yz567abc123',
      is_active: true,
      tags: ['literatura', 'naturalismo', 'brasil', 'sociedade']
    },
    {
      name: 'Capitães da Areia - Jorge Amado',
      original_name: 'capitaes_da_areia.pdf',
      type: 'pdf',
      size: 3145728, // 3MB
      size_formatted: '3.0 MB',
      bucket: 'sabercon-books',
      s3_key: 'books/modern/capitaes_areia_jorge.pdf',
      s3_url: 'https://sabercon-books.s3.amazonaws.com/books/modern/capitaes_areia_jorge.pdf',
      description: 'Romance sobre meninos de rua em Salvador, Bahia',
      category: 'literario',
      metadata: JSON.stringify({
        author: 'Jorge Amado',
        genre: 'Romance Social',
        year: 1937,
        language: 'pt-BR',
        pages: 280
      }),
      checksum: 'sha256:ghi789jkl012mno345pqr678stu901vwx234yz567abc123def456',
      is_active: true,
      tags: ['literatura', 'brasil', 'bahia', 'infância']
    },
    // Arquivos para professores
    {
      name: 'Plano de Aula - Literatura Brasileira',
      original_name: 'plano_aula_literatura.docx',
      type: 'docx',
      size: 524288, // 512KB
      size_formatted: '512 KB',
      bucket: 'sabercon-teaching',
      s3_key: 'teaching/plans/literatura_brasileira_plano.docx',
      s3_url: 'https://sabercon-teaching.s3.amazonaws.com/teaching/plans/literatura_brasileira_plano.docx',
      description: 'Plano de aula completo para ensino de literatura brasileira do século XIX',
      category: 'professor',
      metadata: JSON.stringify({
        subject: 'Literatura Brasileira',
        target_audience: 'Ensino Médio',
        duration: '50 minutos',
        grade: '2º ano'
      }),
      checksum: 'sha256:jkl012mno345pqr678stu901vwx234yz567abc123def456ghi789',
      is_active: true,
      tags: ['plano-aula', 'literatura', 'ensino-medio', 'professor']
    },
    {
      name: 'Exercícios - Análise Literária',
      original_name: 'exercicios_analise_literaria.pdf',
      type: 'pdf',
      size: 1048576, // 1MB
      size_formatted: '1.0 MB',
      bucket: 'sabercon-teaching',
      s3_key: 'teaching/exercises/analise_literaria_exercicios.pdf',
      s3_url: 'https://sabercon-teaching.s3.amazonaws.com/teaching/exercises/analise_literaria_exercicios.pdf',
      description: 'Lista de exercícios para prática de análise literária',
      category: 'professor',
      metadata: JSON.stringify({
        subject: 'Literatura',
        difficulty: 'Intermediário',
        questions: 25,
        answer_key: true
      }),
      checksum: 'sha256:mno345pqr678stu901vwx234yz567abc123def456ghi789jkl012',
      is_active: true,
      tags: ['exercicios', 'analise-literaria', 'avaliacao', 'professor']
    },
    {
      name: 'Guia do Professor - Machado de Assis',
      original_name: 'guia_machado_assis.pdf',
      type: 'pdf',
      size: 2097152, // 2MB
      size_formatted: '2.0 MB',
      bucket: 'sabercon-teaching',
      s3_key: 'teaching/guides/machado_assis_guia.pdf',
      s3_url: 'https://sabercon-teaching.s3.amazonaws.com/teaching/guides/machado_assis_guia.pdf',
      description: 'Guia completo para ensinar as obras de Machado de Assis',
      category: 'professor',
      metadata: JSON.stringify({
        author_focus: 'Machado de Assis',
        content_type: 'Guia Didático',
        pages: 45,
        includes: ['biografia', 'contexto histórico', 'análise de obras']
      }),
      checksum: 'sha256:pqr678stu901vwx234yz567abc123def456ghi789jkl012mno345',
      is_active: true,
      tags: ['guia-professor', 'machado-assis', 'literatura', 'didatico']
    },
    // Arquivos para alunos
    {
      name: 'Resumo - Características do Romantismo',
      original_name: 'resumo_romantismo.pdf',
      type: 'pdf',
      size: 655360, // 640KB
      size_formatted: '640 KB',
      bucket: 'sabercon-students',
      s3_key: 'students/summaries/romantismo_caracteristicas.pdf',
      s3_url: 'https://sabercon-students.s3.amazonaws.com/students/summaries/romantismo_caracteristicas.pdf',
      description: 'Resumo das principais características do movimento romântico',
      category: 'aluno',
      metadata: JSON.stringify({
        topic: 'Romantismo',
        type: 'Resumo',
        pages: 8,
        grade_level: 'Ensino Médio'
      }),
      checksum: 'sha256:stu901vwx234yz567abc123def456ghi789jkl012mno345pqr678',
      is_active: true,
      tags: ['resumo', 'romantismo', 'literatura', 'aluno']
    },
    {
      name: 'Mapa Mental - Escolas Literárias',
      original_name: 'mapa_mental_escolas_literarias.jpg',
      type: 'jpg',
      size: 1572864, // 1.5MB
      size_formatted: '1.5 MB',
      bucket: 'sabercon-students',
      s3_key: 'students/mind_maps/escolas_literarias_mapa.jpg',
      s3_url: 'https://sabercon-students.s3.amazonaws.com/students/mind_maps/escolas_literarias_mapa.jpg',
      description: 'Mapa mental visual das principais escolas literárias brasileiras',
      category: 'aluno',
      metadata: JSON.stringify({
        type: 'Mapa Mental',
        format: 'Visual',
        schools: ['Barroco', 'Arcadismo', 'Romantismo', 'Realismo', 'Parnasianismo', 'Simbolismo']
      }),
      checksum: 'sha256:vwx234yz567abc123def456ghi789jkl012mno345pqr678stu901',
      is_active: true,
      tags: ['mapa-mental', 'escolas-literarias', 'visual', 'aluno']
    },
    {
      name: 'Atividade - Interpretação de Texto',
      original_name: 'atividade_interpretacao.pdf',
      type: 'pdf',
      size: 786432, // 768KB
      size_formatted: '768 KB',
      bucket: 'sabercon-students',
      s3_key: 'students/activities/interpretacao_texto_atividade.pdf',
      s3_url: 'https://sabercon-students.s3.amazonaws.com/students/activities/interpretacao_texto_atividade.pdf',
      description: 'Atividade prática de interpretação de textos literários',
      category: 'aluno',
      metadata: JSON.stringify({
        type: 'Atividade',
        skill: 'Interpretação de Texto',
        questions: 15,
        difficulty: 'Médio'
      }),
      checksum: 'sha256:yz567abc123def456ghi789jkl012mno345pqr678stu901vwx234',
      is_active: true,
      tags: ['atividade', 'interpretacao', 'textos', 'aluno']
    },
    {
      name: 'Bibliografia - Literatura Contemporânea',
      original_name: 'bibliografia_contemporanea.pdf',
      type: 'pdf',
      size: 1310720, // 1.25MB
      size_formatted: '1.25 MB',
      bucket: 'sabercon-students',
      s3_key: 'students/references/literatura_contemporanea_bibliografia.pdf',
      s3_url: 'https://sabercon-students.s3.amazonaws.com/students/references/literatura_contemporanea_bibliografia.pdf',
      description: 'Lista de referências para estudo de literatura contemporânea',
      category: 'aluno',
      metadata: JSON.stringify({
        type: 'Bibliografia',
        period: 'Literatura Contemporânea',
        sources: 45,
        updated: '2024'
      }),
      checksum: 'sha256:abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567',
      is_active: true,
      tags: ['bibliografia', 'literatura-contemporanea', 'referencias', 'aluno']
    }
  ]).returning('*');

  console.log('✅ Dados iniciais da tabela files inseridos com sucesso!');
  console.log(`📊 Total de arquivos inseridos: ${bookFiles.length}`);
  
  // Contar por categoria
  const categories = bookFiles.reduce((acc, file) => {
    acc[file.category] = (acc[file.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📂 Distribuição por categoria:');
  Object.entries(categories).forEach(([category, count]) => {
    const emoji = category === 'literario' ? '📚' : 
                  category === 'professor' ? '👨‍🏫' : 
                  category === 'aluno' ? '👨‍🎓' : '🧪';
    const label = category === 'literario' ? 'Literário' :
                  category === 'professor' ? 'Professor' :
                  category === 'aluno' ? 'Aluno' : 'Teste';
    console.log(`   ${emoji} ${label}: ${count as number} arquivo${(count as number) > 1 ? 's' : ''}`);
  });

  console.log(`\nℹ️  Nota: Para adicionar usuário responsável, execute:`);
  console.log(`   UPDATE files SET uploaded_by = (SELECT id FROM users WHERE email = 'admin@sabercon.edu.br') WHERE uploaded_by IS NULL;`);
} 