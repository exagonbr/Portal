import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('books').del();

  // Primeiro, vamos buscar os IDs dos cursos criados
  const courses = await knex('courses').select('id', 'name');
  const firstCourseId = courses.length > 0 ? courses[0].id : null;

  // Inserts seed entries
  await knex('books').insert([
    {
      title: 'Matemática Fundamental',
      author: 'João Silva',
      isbn: '978-85-123-4567-8',
      file_path: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/740706609aa4939aa3c7930178bc516d4f5c2b905de7ab47637bec6bf91dcaa5.pdf',
      course_id: firstCourseId
    },
    {
      title: 'História do Brasil',
      author: 'Maria Santos',
      isbn: '978-85-234-5678-9',
      file_path: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/c76a59abd394730dfde13cb51604cc8ad0dfedcfb34a931f61182b9338c84822.pdf',
      course_id: firstCourseId
    },
    {
      title: 'Programação Python',
      author: 'Carlos Oliveira',
      isbn: '978-85-345-6789-0',
      file_path: 'https://editora-liberty.s3.sa-east-1.amazonaws.com/upload/51814c3b79838003d288662610734eb8c90dd05fb6b667ee8e2435ed1e794d4c.pdf',
      course_id: firstCourseId
    },
    {
      title: 'Inglês Técnico',
      author: 'Ana Costa',
      isbn: '978-85-456-7890-1',
      file_path: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/9fc386ff25ee851125340c47d6462a1f0f4bf3a02e4db6bbb741e9ac5458d431.pdf',
      course_id: firstCourseId
    },
    {
      title: 'Gestão de Projetos',
      author: 'Roberto Lima',
      isbn: '978-85-567-8901-2',
      file_path: '/books/9786585208116.epub',
      course_id: firstCourseId
    }
  ]);
}