import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpar dados existentes
  await knex('files').del();

  console.log('📁 Criando dados iniciais da tabela files...');

  // Dados completos sem chave estrangeira para uploaded_by
  const filesData = [
    // Conteúdo Literário
    {
      name: 'Dom Casmurro.pdf',
      original_name: 'dom-casmurro.pdf',
      type: 'PDF',
      size: 2515968,
      size_formatted: '2.4 MB',
      bucket: 'literario-bucket',
      s3_key: 'dom-casmurro.pdf',
      s3_url: 'https://literario-bucket.s3.amazonaws.com/dom-casmurro.pdf',
      description: 'Clássico da literatura brasileira por Machado de Assis',
      category: 'literario',
      metadata: JSON.stringify({
        author: 'Machado de Assis',
        year: '1899',
        pages: 256,
        genre: 'Romance'
      }),
      is_active: true,
      tags: ['literatura', 'clássico', 'machado-assis', 'romance', 'realismo']
    },
    {
      name: 'Vidas Secas.epub',
      original_name: 'vidas-secas.epub',
      type: 'EPUB',
      size: 1887436,
      size_formatted: '1.8 MB',
      bucket: 'literario-bucket',
      s3_key: 'vidas-secas.epub',
      s3_url: 'https://literario-bucket.s3.amazonaws.com/vidas-secas.epub',
      description: 'Romance regionalista de Graciliano Ramos',
      category: 'literario',
      metadata: JSON.stringify({
        author: 'Graciliano Ramos',
        year: '1938',
        pages: 176,
        genre: 'Romance regionalista'
      }),
      is_active: true,
      tags: ['literatura', 'regionalismo', 'graciliano-ramos', 'nordeste', 'seca']
    },
    {
      name: 'O Cortiço.pdf',
      original_name: 'o-cortico.pdf',
      type: 'PDF',
      size: 3251200,
      size_formatted: '3.1 MB',
      bucket: 'literario-bucket',
      s3_key: 'o-cortico.pdf',
      s3_url: 'https://literario-bucket.s3.amazonaws.com/o-cortico.pdf',
      description: 'Romance naturalista de Aluísio Azevedo',
      category: 'literario',
      metadata: JSON.stringify({
        author: 'Aluísio Azevedo',
        year: '1890',
        pages: 224,
        genre: 'Naturalismo'
      }),
      is_active: true,
      tags: ['literatura', 'naturalismo', 'aluísio-azevedo', 'romance', 'sociedade']
    },

    // Conteúdo Professor
    {
      name: 'Plano de Aula - Matemática 6º Ano.docx',
      original_name: 'plano-matematica-6ano.docx',
      type: 'DOCX',
      size: 876544,
      size_formatted: '856 KB',
      bucket: 'professor-bucket',
      s3_key: 'planos-aula/matematica/6ano/plano-matematica-6ano.docx',
      s3_url: 'https://professor-bucket.s3.amazonaws.com/planos-aula/matematica/6ano/plano-matematica-6ano.docx',
      description: 'Plano de aula completo para matemática do 6º ano - Frações',
      category: 'professor',
      metadata: JSON.stringify({
        subject: 'Matemática',
        grade: '6º Ano',
        topic: 'Frações',
        duration: '50 minutos',
        objectives: ['Compreender conceito de fração', 'Realizar operações básicas']
      }),
      is_active: true,
      tags: ['matemática', 'plano-aula', '6ano', 'frações', 'fundamental']
    },
    {
      name: 'Apresentação História do Brasil.pptx',
      original_name: 'apresentacao-historia-brasil.pptx',
      type: 'PPTX',
      size: 15925248,
      size_formatted: '15.2 MB',
      bucket: 'professor-bucket',
      s3_key: 'apresentacoes/historia/brasil-colonial.pptx',
      s3_url: 'https://professor-bucket.s3.amazonaws.com/apresentacoes/historia/brasil-colonial.pptx',
      description: 'Slides completos sobre o período colonial brasileiro',
      category: 'professor',
      metadata: JSON.stringify({
        subject: 'História',
        grade: '7º Ano',
        topic: 'Brasil Colonial',
        slides: 45,
        duration: '60 minutos'
      }),
      is_active: true,
      tags: ['história', 'brasil', 'colonial', 'apresentação', '7ano']
    },
    {
      name: 'Manual do Professor - Ciências.pdf',
      original_name: 'manual-professor-ciencias.pdf',
      type: 'PDF',
      size: 5242880,
      size_formatted: '5.0 MB',
      bucket: 'professor-bucket',
      s3_key: 'manuais/ciencias/manual-professor-ciencias.pdf',
      s3_url: 'https://professor-bucket.s3.amazonaws.com/manuais/ciencias/manual-professor-ciencias.pdf',
      description: 'Manual completo para professores de ciências',
      category: 'professor',
      metadata: JSON.stringify({
        subject: 'Ciências',
        grade: 'Fundamental II',
        type: 'Manual',
        chapters: 12,
        experiments: 25
      }),
      is_active: true,
      tags: ['ciências', 'manual', 'professor', 'experimentos', 'fundamental']
    },

    // Conteúdo Aluno
    {
      name: 'Exercícios Matemática 6º Ano.pdf',
      original_name: 'exercicios-matematica-6ano.pdf',
      type: 'PDF',
      size: 3355443,
      size_formatted: '3.2 MB',
      bucket: 'aluno-bucket',
      s3_key: 'exercicios/matematica/6ano/lista-fracoes.pdf',
      s3_url: 'https://aluno-bucket.s3.amazonaws.com/exercicios/matematica/6ano/lista-fracoes.pdf',
      description: 'Lista de exercícios sobre frações para estudantes do 6º ano',
      category: 'aluno',
      metadata: JSON.stringify({
        subject: 'Matemática',
        grade: '6º Ano',
        topic: 'Frações',
        questions: 50,
        difficulty: 'Médio'
      }),
      is_active: true,
      tags: ['exercícios', 'matemática', '6ano', 'frações', 'lista']
    },
    {
      name: 'Jogo Educativo - Sistema Solar.zip',
      original_name: 'jogo-sistema-solar.zip',
      type: 'ZIP',
      size: 47972352,
      size_formatted: '45.8 MB',
      bucket: 'aluno-bucket',
      s3_key: 'jogos/ciencias/sistema-solar/jogo-sistema-solar.zip',
      s3_url: 'https://aluno-bucket.s3.amazonaws.com/jogos/ciencias/sistema-solar/jogo-sistema-solar.zip',
      description: 'Jogo interativo sobre o sistema solar para estudantes',
      category: 'aluno',
      metadata: JSON.stringify({
        subject: 'Ciências',
        grade: '5º Ano',
        type: 'Jogo Interativo',
        platform: 'Web',
        languages: ['português']
      }),
      is_active: true,
      tags: ['jogo', 'ciências', 'sistema-solar', 'interativo', '5ano']
    },
    {
      name: 'Vídeo Aula - Física Básica.mp4',
      original_name: 'video-fisica-basica.mp4',
      type: 'MP4',
      size: 126418534,
      size_formatted: '120.5 MB',
      bucket: 'aluno-bucket',
      s3_key: 'videos/fisica/basica/introducao-fisica.mp4',
      s3_url: 'https://aluno-bucket.s3.amazonaws.com/videos/fisica/basica/introducao-fisica.mp4',
      description: 'Vídeo introdutório sobre conceitos básicos de física',
      category: 'aluno',
      metadata: JSON.stringify({
        subject: 'Física',
        grade: '9º Ano',
        duration: '15:30',
        quality: '1080p',
        subtitle: true
      }),
      is_active: true,
      tags: ['vídeo', 'física', 'básica', 'introdução', '9ano']
    },
    {
      name: 'Atividade Português - Interpretação.pdf',
      original_name: 'atividade-portugues-interpretacao.pdf',
      type: 'PDF',
      size: 2097152,
      size_formatted: '2.0 MB',
      bucket: 'aluno-bucket',
      s3_key: 'atividades/portugues/interpretacao/texto-narrativo.pdf',
      s3_url: 'https://aluno-bucket.s3.amazonaws.com/atividades/portugues/interpretacao/texto-narrativo.pdf',
      description: 'Atividade de interpretação de texto narrativo',
      category: 'aluno',
      metadata: JSON.stringify({
        subject: 'Português',
        grade: '8º Ano',
        type: 'Interpretação de Texto',
        questions: 10,
        text_type: 'Narrativo'
      }),
      is_active: true,
      tags: ['português', 'interpretação', 'texto', 'narrativo', '8ano']
    },

    // Arquivo de teste para simular arquivo órfão
    {
      name: 'Arquivo Teste - Sem Referência.pdf',
      original_name: 'arquivo-teste-orfao.pdf',
      type: 'PDF',
      size: 1048576,
      size_formatted: '1.0 MB',
      bucket: 'literario-bucket',
      s3_key: 'teste/arquivo-sem-referencia.pdf',
      s3_url: 'https://literario-bucket.s3.amazonaws.com/teste/arquivo-sem-referencia.pdf',
      description: 'Arquivo de teste para demonstrar funcionalidade de órfãos',
      category: 'literario',
      metadata: JSON.stringify({
        test: true,
        purpose: 'Demonstração de arquivo órfão'
      }),
      is_active: false, // Marcado como inativo para teste
      tags: ['teste', 'órfão', 'demonstração']
    }
  ];

  try {
    await knex('files').insert(filesData);
    
    console.log('✅ Dados iniciais da tabela files inseridos com sucesso!');
    console.log('📊 Total de arquivos inseridos:', filesData.length);
    console.log('📂 Distribuição por categoria:');
    console.log('   📚 Literário: 3 arquivos');
    console.log('   👨‍🏫 Professor: 3 arquivos');
    console.log('   👨‍🎓 Aluno: 4 arquivos');
    console.log('   🧪 Teste: 1 arquivo (inativo)');
    console.log('');
    console.log('ℹ️  Nota: Para adicionar usuário responsável, execute:');
    console.log('   UPDATE files SET uploaded_by = (SELECT id FROM users WHERE email = \'admin@sabercon.edu.br\') WHERE uploaded_by IS NULL;');
    
  } catch (error) {
    console.error('❌ Erro ao inserir arquivos:', error);
    throw error;
  }
} 