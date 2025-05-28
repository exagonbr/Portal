import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('videos').del();
  await knex('books').del();

  // Get course IDs
  const courses = await knex('courses').select('id', 'name');
  const getCourseId = (name: string) => courses.find(c => c.name === name)?.id;

  // Insert books with extended data (without explicit IDs)
  const books = [
    {
      title: 'Matemática Avançada - Volume 1',
      author: 'Dr. João Silva',
      isbn: '978-0000000001',
      file_path: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/740706609aa4939aa3c7930178bc516d4f5c2b905de7ab47637bec6bf91dcaa5.pdf',
      course_id: getCourseId('Matemática Avançada'),
      publisher: 'Editora Educacional',
      synopsis: 'Livro completo sobre matemática avançada para ensino médio',
      duration: '2h 30min',
      format: 'pdf',
      page_count: 120,
      thumbnail: 'https://covers.openlibrary.org/b/id/10001-L.jpg'
    },
    {
      title: 'História do Brasil Colonial',
      author: 'Prof. Maria Santos',
      isbn: '978-0000000002',
      file_path: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/c76a59abd394730dfde13cb51604cc8ad0dfedcfb34a931f61182b9338c84822.pdf',
      course_id: getCourseId('História do Brasil Colônia'),
      publisher: 'Editora História',
      synopsis: 'Análise completa do período colonial brasileiro',
      duration: '1h 45min',
      format: 'pdf',
      page_count: 85,
      thumbnail: 'https://covers.openlibrary.org/b/id/10002-L.jpg'
    },
    {
      title: 'Python para Iniciantes',
      author: 'Carlos Programador',
      isbn: '978-0000000003',
      file_path: 'https://editora-liberty.s3.sa-east-1.amazonaws.com/upload/51814c3b79838003d288662610734eb8c90dd05fb6b667ee8e2435ed1e794d4c.pdf',
      course_id: getCourseId('Introdução à Programação com Python'),
      publisher: 'Tech Books',
      synopsis: 'Guia completo para aprender Python do zero',
      duration: '3h 15min',
      format: 'pdf',
      page_count: 200,
      thumbnail: 'https://covers.openlibrary.org/b/id/10003-L.jpg'
    },
    {
      title: 'English Instrumental Reading',
      author: 'Prof. Ana English',
      isbn: '978-0000000004',
      file_path: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/9fc386ff25ee851125340c47d6462a1f0f4bf3a02e4db6bbb741e9ac5458d431.pdf',
      course_id: getCourseId('Inglês Instrumental'),
      publisher: 'Language Press',
      synopsis: 'Técnicas de leitura instrumental em inglês',
      duration: '2h 00min',
      format: 'pdf',
      page_count: 150,
      thumbnail: 'https://covers.openlibrary.org/b/id/10004-L.jpg'
    },
    {
      title: 'Gestão Ágil de Projetos',
      author: 'Roberto Gestor',
      isbn: '978-0000000005',
      file_path: '/books/9786585208116.epub',
      course_id: getCourseId('Gestão de Projetos Ágeis'),
      publisher: 'Business Books',
      synopsis: 'Metodologias ágeis aplicadas à gestão de projetos',
      duration: '2h 00min',
      format: 'epub',
      page_count: 150,
      thumbnail: 'https://covers.openlibrary.org/b/id/10005-L.jpg'
    }
  ].filter(book => book.course_id);

  if (books.length > 0) {
    await knex('books').insert(books);
  }

  // Insert videos with extended data (without explicit IDs)
  const videos = [
    {
      title: 'Matemática: Cálculo Diferencial - Aula 1',
      description: 'Introdução ao cálculo diferencial',
      file_path: 'https://example.com/videos/calc-diff-1.mp4',
      thumbnail_path: 'https://img.youtube.com/vi/X_B7o4_wOAY/maxresdefault.jpg',
      course_id: getCourseId('Matemática Avançada'),
      duration: '25:30',
      progress: 45.0
    },
    {
      title: 'História: Período Colonial - Aula 1',
      description: 'Chegada dos portugueses ao Brasil',
      file_path: 'https://example.com/videos/colonial-1.mp4',
      thumbnail_path: 'https://img.youtube.com/vi/F3BR6q9_zEs/maxresdefault.jpg',
      course_id: getCourseId('História do Brasil Colônia'),
      duration: '26:45',
      progress: 34.0
    },
    {
      title: 'Programação: Introdução ao Python - Aula 1',
      description: 'Conceitos básicos de Python',
      file_path: 'https://example.com/videos/python-intro-1.mp4',
      thumbnail_path: 'https://img.youtube.com/vi/NybHckSEQBI/maxresdefault.jpg',
      course_id: getCourseId('Introdução à Programação com Python'),
      duration: '22:15',
      progress: 23.0
    },
    {
      title: 'Inglês: Reading Comprehension - Lesson 1',
      description: 'Técnicas de leitura em inglês',
      file_path: 'https://example.com/videos/english-reading-1.mp4',
      thumbnail_path: 'https://img.youtube.com/vi/kjBOesZCoqc/maxresdefault.jpg',
      course_id: getCourseId('Inglês Instrumental'),
      duration: '30:00',
      progress: 67.0
    },
    {
      title: 'Gestão: Metodologias Ágeis - Aula 1',
      description: 'Introdução ao Scrum',
      file_path: 'https://example.com/videos/scrum-intro-1.mp4',
      thumbnail_path: 'https://img.youtube.com/vi/fNk_zzaMoSs/maxresdefault.jpg',
      course_id: getCourseId('Gestão de Projetos Ágeis'),
      duration: '28:20',
      progress: 12.0
    },
    {
      title: 'Matemática: Geometria Plana - Aula 2',
      description: 'Conceitos básicos de geometria',
      file_path: 'https://example.com/videos/geometry-1.mp4',
      thumbnail_path: 'https://img.youtube.com/vi/pTnEG_WGd2Q/maxresdefault.jpg',
      course_id: getCourseId('Matemática Avançada'),
      duration: '24:10',
      progress: 89.0
    },
    {
      title: 'História: Economia Colonial - Aula 2',
      description: 'Sistema econômico do Brasil colonial',
      file_path: 'https://example.com/videos/colonial-economy.mp4',
      thumbnail_path: 'https://img.youtube.com/vi/F3BR6q9_zEs/maxresdefault.jpg',
      course_id: getCourseId('História do Brasil Colônia'),
      duration: '28:30',
      progress: 0.0
    },
    {
      title: 'Programação: Estruturas de Dados - Aula 2',
      description: 'Listas e arrays em Python',
      file_path: 'https://example.com/videos/data-structures-1.mp4',
      thumbnail_path: 'https://img.youtube.com/vi/mH0oCDa74tE/maxresdefault.jpg',
      course_id: getCourseId('Introdução à Programação com Python'),
      duration: '32:15',
      progress: 56.0
    },
    {
      title: 'Inglês: Grammar Fundamentals - Lesson 2',
      description: 'Tempos verbais básicos',
      file_path: 'https://example.com/videos/grammar-1.mp4',
      thumbnail_path: 'https://img.youtube.com/vi/sD0NjbwqlYw/maxresdefault.jpg',
      course_id: getCourseId('Inglês Instrumental'),
      duration: '27:30',
      progress: 78.0
    },
    {
      title: 'Gestão: Kanban - Aula 2',
      description: 'Introdução ao método Kanban',
      file_path: 'https://example.com/videos/kanban-1.mp4',
      thumbnail_path: 'https://img.youtube.com/vi/PF5yfMfxI88/maxresdefault.jpg',
      course_id: getCourseId('Gestão de Projetos Ágeis'),
      duration: '29:40',
      progress: 91.0
    }
  ].filter(video => video.course_id);

  if (videos.length > 0) {
    await knex('videos').insert(videos);
  }
}
