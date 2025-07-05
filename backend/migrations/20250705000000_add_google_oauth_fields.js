/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('user', function(table) {
    // Adicionar campo google_id
    table.string('google_id', 255).nullable().unique().comment('ID único do usuário no Google OAuth');
    
    // Adicionar campo profile_image
    table.string('profile_image', 500).nullable().comment('URL da imagem de perfil do usuário');
    
    // Adicionar campo email_verified se não existir
    table.boolean('email_verified').defaultTo(false).nullable().comment('Indica se o email do usuário foi verificado');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('user', function(table) {
    // Remover os campos na ordem inversa
    table.dropColumn('email_verified');
    table.dropColumn('profile_image');
    table.dropColumn('google_id');
  });
}; 