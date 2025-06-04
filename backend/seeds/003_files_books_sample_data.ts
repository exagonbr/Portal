export async function seed(knex: any): Promise<void> {
  console.log('🌱 Populando dados de exemplo para arquivos e livros...');

  // Buscar uma instituição existente
  const institution = await knex('institutions').where('status', 'active').first();
  
  if (!institution) {
    console.log('❌ Nenhuma instituição encontrada. Execute primeiro o seed de instituições.');
    return;
  }

  // Limpar dados existentes de livros e arquivos
  await knex('books').del();
  await knex('files').del();

  // Inserir arquivos de exemplo
  const files = [
    // Categoria Literário
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Dom Casmurro.pdf',
      original_name: 'dom_casmurro_original.pdf',
      type: 'PDF',
      size: 2458624, // 2.4 MB em bytes
      size_formatted: '2.4 MB',
      bucket: 'sabercon-literario',
      s3_key: 'upload/literatura/dom-casmurro.pdf',
      s3_url: 'https://sabercon-literario.s3.us-east-1.amazonaws.com/upload/literatura/dom-casmurro.pdf',
      description: 'Clássico da literatura brasileira por Machado de Assis',
      category: 'literario',
      metadata: JSON.stringify({ 
        author: 'Machado de Assis',
        genre: 'Romance',
        period: 'Realismo'
      }),
      tags: ['literatura', 'clássico', 'machado-de-assis', 'realismo'],
      is_active: true
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'O Cortiço.epub',
      original_name: 'o_cortico_original.epub',
      type: 'EPUB',
      size: 1876345,
      size_formatted: '1.8 MB',
      bucket: 'sabercon-literario',
      s3_key: 'upload/literatura/o-cortico.epub',
      s3_url: 'https://sabercon-literario.s3.us-east-1.amazonaws.com/upload/literatura/o-cortico.epub',
      description: 'Romance naturalista de Aluísio Azevedo',
      category: 'literario',
      metadata: JSON.stringify({ 
        author: 'Aluísio Azevedo',
        genre: 'Romance',
        period: 'Naturalismo'
      }),
      tags: ['literatura', 'naturalismo', 'aluísio-azevedo'],
      is_active: true
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Vidas Secas.pdf',
      original_name: 'vidas_secas_original.pdf',
      type: 'PDF',
      size: 3245789,
      size_formatted: '3.1 MB',
      bucket: 'sabercon-literario',
      s3_key: 'upload/literatura/vidas-secas.pdf',
      s3_url: 'https://sabercon-literario.s3.us-east-1.amazonaws.com/upload/literatura/vidas-secas.pdf',
      description: 'Romance regionalista de Graciliano Ramos',
      category: 'literario',
      metadata: JSON.stringify({ 
        author: 'Graciliano Ramos',
        genre: 'Romance',
        period: 'Modernismo'
      }),
      tags: ['literatura', 'modernismo', 'graciliano-ramos', 'nordeste'],
      is_active: true
    },

    // Categoria Professor
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Plano de Aula - Matemática Básica.docx',
      original_name: 'plano_aula_matematica.docx',
      type: 'DOCX',
      size: 876543,
      size_formatted: '856 KB',
      bucket: 'sabercon-professor',
      s3_key: 'upload/materiais/plano-matematica-basica.docx',
      s3_url: 'https://sabercon-professor.s3.us-east-1.amazonaws.com/upload/materiais/plano-matematica-basica.docx',
      description: 'Plano de aula completo para matemática do ensino fundamental',
      category: 'professor',
      metadata: JSON.stringify({ 
        subject: 'Matemática',
        grade: 'Ensino Fundamental',
        duration: '50 minutos'
      }),
      tags: ['matemática', 'plano-aula', 'fundamental', 'professor'],
      is_active: true
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Apresentação História do Brasil.pptx',
      original_name: 'historia_brasil_slides.pptx',
      type: 'PPTX',
      size: 15934567,
      size_formatted: '15.2 MB',
      bucket: 'sabercon-professor',
      s3_key: 'upload/apresentacoes/historia-brasil.pptx',
      s3_url: 'https://sabercon-professor.s3.us-east-1.amazonaws.com/upload/apresentacoes/historia-brasil.pptx',
      description: 'Slides sobre a história do Brasil colonial',
      category: 'professor',
      metadata: JSON.stringify({ 
        subject: 'História',
        topic: 'Brasil Colonial',
        slides_count: 45
      }),
      tags: ['história', 'brasil', 'colonial', 'apresentação'],
      is_active: true
    },

    // Categoria Aluno
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Exercícios Matemática 6º Ano.pdf',
      original_name: 'exercicios_mat_6ano.pdf',
      type: 'PDF',
      size: 3345678,
      size_formatted: '3.2 MB',
      bucket: 'sabercon-aluno',
      s3_key: 'upload/exercicios/matematica-6ano.pdf',
      s3_url: 'https://sabercon-aluno.s3.us-east-1.amazonaws.com/upload/exercicios/matematica-6ano.pdf',
      description: 'Lista de exercícios de matemática para o 6º ano',
      category: 'aluno',
      metadata: JSON.stringify({ 
        subject: 'Matemática',
        grade: '6º Ano',
        exercise_count: 50
      }),
      tags: ['matemática', 'exercícios', '6ano', 'estudante'],
      is_active: true
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Jogo Educativo Ciências.zip',
      original_name: 'jogo_ciencias_interativo.zip',
      type: 'ZIP',
      size: 48034567,
      size_formatted: '45.8 MB',
      bucket: 'sabercon-aluno',
      s3_key: 'upload/jogos/ciencias-interativo.zip',
      s3_url: 'https://sabercon-aluno.s3.us-east-1.amazonaws.com/upload/jogos/ciencias-interativo.zip',
      description: 'Jogo interativo sobre ciências naturais',
      category: 'aluno',
      metadata: JSON.stringify({ 
        type: 'Jogo Educativo',
        subject: 'Ciências',
        format: 'HTML5'
      }),
      tags: ['ciências', 'jogo', 'interativo', 'educativo'],
      is_active: true
    }
  ];

  console.log('📁 Inserindo arquivos de exemplo...');
  const insertedFiles = await knex('files').insert(files).returning('*');

  // Criar livros para alguns arquivos literários
  const books = [
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'Dom Casmurro',
      author: 'Machado de Assis',
      isbn: '978-85-7326-215-4',
      description: 'Um dos maiores clássicos da literatura brasileira, Dom Casmurro narra a história de Bentinho e sua obsessão por Capitu.',
      publisher: 'Editora Ática',
      publication_year: 1899,
      language: 'pt-BR',
      pages: 208,
      category: 'literario',
      cover_url: 'https://sabercon-literario.s3.us-east-1.amazonaws.com/covers/dom-casmurro.jpg',
      file_url: insertedFiles.find((f: any) => f.name === 'Dom Casmurro.pdf')?.s3_url,
      file_type: 'PDF',
      file_size: 2458624,
      institution_id: institution.id,
      status: 'available'
    },
    {
      id: knex.raw('gen_random_uuid()'),
      title: 'O Cortiço',
      author: 'Aluísio Azevedo',
      isbn: '978-85-7326-216-1',
      description: 'Romance naturalista que retrata a vida em um cortiço no Rio de Janeiro do século XIX.',
      publisher: 'Editora Moderna',
      publication_year: 1890,
      language: 'pt-BR',
      pages: 272,
      category: 'literario',
      cover_url: 'https://sabercon-literario.s3.us-east-1.amazonaws.com/covers/o-cortico.jpg',
      file_url: insertedFiles.find((f: any) => f.name === 'O Cortiço.epub')?.s3_url,
      file_type: 'EPUB',
      file_size: 1876345,
      institution_id: institution.id,
      status: 'available'
    }
  ];

  console.log('📚 Inserindo livros de exemplo...');
  const insertedBooks = await knex('books').insert(books).returning('*');

  // Vincular arquivos aos livros usando a função do banco
  console.log('🔗 Vinculando arquivos aos livros...');
  
  const domCasmurroFile = insertedFiles.find((f: any) => f.name === 'Dom Casmurro.pdf');
  const domCasmurroBook = insertedBooks.find((b: any) => b.title === 'Dom Casmurro');
  
  if (domCasmurroFile && domCasmurroBook) {
    await knex.raw('SELECT link_file_to_book(?, ?)', [domCasmurroFile.id, domCasmurroBook.id]);
  }

  const corticoFile = insertedFiles.find((f: any) => f.name === 'O Cortiço.epub');
  const corticoBook = insertedBooks.find((b: any) => b.title === 'O Cortiço');
  
  if (corticoFile && corticoBook) {
    await knex.raw('SELECT link_file_to_book(?, ?)', [corticoFile.id, corticoBook.id]);
  }

  console.log('✅ Dados de exemplo inseridos com sucesso!');
  console.log(`📁 ${insertedFiles.length} arquivos inseridos`);
  console.log(`📚 ${insertedBooks.length} livros inseridos`);
  console.log('🔗 Vinculações criadas entre arquivos e livros');
} 