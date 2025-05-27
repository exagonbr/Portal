import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('books').del();

  // Inserts seed entries
  await knex('books').insert([
    {
      id: 'test-book-1',
      thumbnail: 'https://covers.openlibrary.org/b/id/10001-L.jpg',
      title: 'Test Book 1',
      author: 'Test Author 1',
      publisher: 'Test Publisher',
      synopsis: 'Test book for PDF reader functionality',
      duration: '2h 30min',
      format: 'pdf',
      file_path: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/740706609aa4939aa3c7930178bc516d4f5c2b905de7ab47637bec6bf91dcaa5.pdf',
      page_count: 120,
      is_active: true
    },
    {
      id: 'test-book-2',
      thumbnail: 'https://covers.openlibrary.org/b/id/10002-L.jpg',
      title: 'Test Book 2',
      author: 'Test Author 2',
      publisher: 'Test Publisher',
      synopsis: 'Test book for PDF reader functionality',
      duration: '1h 45min',
      format: 'pdf',
      file_path: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/c76a59abd394730dfde13cb51604cc8ad0dfedcfb34a931f61182b9338c84822.pdf',
      page_count: 85,
      is_active: true
    },
    {
      id: 'test-book-3',
      thumbnail: 'https://covers.openlibrary.org/b/id/10003-L.jpg',
      title: 'Test Book 3',
      author: 'Test Author 3',
      publisher: 'Test Publisher',
      synopsis: 'Test book for PDF reader functionality',
      duration: '3h 15min',
      format: 'pdf',
      file_path: 'https://editora-liberty.s3.sa-east-1.amazonaws.com/upload/51814c3b79838003d288662610734eb8c90dd05fb6b667ee8e2435ed1e794d4c.pdf',
      page_count: 200,
      is_active: true
    },
    {
      id: 'test-book-4',
      thumbnail: 'https://covers.openlibrary.org/b/id/10004-L.jpg',
      title: 'Test Book 4',
      author: 'Test Author 4',
      publisher: 'Test Publisher',
      synopsis: 'Test book for PDF reader functionality',
      duration: '2h 00min',
      format: 'pdf',
      file_path: 'https://d26a2wm7tuz2gu.cloudfront.net/upload/9fc386ff25ee851125340c47d6462a1f0f4bf3a02e4db6bbb741e9ac5458d431.pdf',
      page_count: 150,
      is_active: true
    },
    {
      id: 'test-book-5',
      thumbnail: 'https://covers.openlibrary.org/b/id/10004-L.jpg',
      title: 'Test Book 5',
      author: 'Test Author 4',
      publisher: 'Test Publisher',
      synopsis: 'Test book for EPUB reader functionality',
      duration: '2h 00min',
      format: 'epub',
      file_path: '/books/9786585208116.epub',
      page_count: 150,
      is_active: true
    }
  ]);
}