exports.up = function(knex) {
  return knex.schema.table('user', function(table) {
    // Adicionar campo google_id
    table.string('google_id', 255).nullable().unique();
    
    // Adicionar campo profile_image
    table.string('profile_image', 500).nullable();
    
    // Adicionar campo email_verified se não existir
    table.boolean('email_verified').defaultTo(false).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('user', function(table) {
    // Remover os campos na ordem inversa
    table.dropColumn('email_verified');
    table.dropColumn('profile_image');
    table.dropColumn('google_id');
  });
}; 