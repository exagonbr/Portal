/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('files').del()
  await knex('files').insert([
    {
      id: 1,
      filename: 'documento-exemplo.pdf',
      original_name: 'Documento de Exemplo.pdf',
      mime_type: 'application/pdf',
      size_bytes: 2048000,
      storage_path: '/storage/files/2025/01/documento-exemplo.pdf',
      url: '/api/files/documento-exemplo.pdf',
      entity_type: 'course',
      entity_id: 1,
      uploaded_by: 1,
      category: 'document',
      is_public: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      filename: 'imagem-capa.png',
      original_name: 'Imagem de Capa.png',
      mime_type: 'image/png',
      size_bytes: 1024000,
      storage_path: '/storage/files/2025/01/imagem-capa.png',
      url: '/api/files/imagem-capa.png',
      entity_type: 'book',
      entity_id: 1,
      uploaded_by: 1,
      category: 'image',
      is_public: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      filename: 'video-aula.mp4',
      original_name: 'Vídeo Aula Introdutória.mp4',
      mime_type: 'video/mp4',
      size_bytes: 10485760,
      storage_path: '/storage/files/2025/01/video-aula.mp4',
      url: '/api/files/video-aula.mp4',
      entity_type: 'lesson',
      entity_id: 1,
      uploaded_by: 1,
      category: 'video',
      is_public: false,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};