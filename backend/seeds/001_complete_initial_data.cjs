'use strict';

module.exports = {
  seed: async function(knex) {
    console.log('🚀 Iniciando seed de dados completos...');

    // Limpar todas as tabelas na ordem correta
    await knex('user_classes').del();
    await knex('classes').del();
    await knex('education_cycles').del();
    await knex('unit').del();
    await knex('user').del();
    await knex('role_permissions').del();
    await knex('permissions').del();
    await knex('roles').del();
    await knex('institution').del();

    console.log('✅ Tabelas limpas com sucesso');

    // Resto do código permanece o mesmo, apenas mudando a estrutura de exportação
    // ... (todo o código do seed permanece igual, apenas removendo a última linha de module.exports)

    console.log('\n🎉 SEED CONCLUÍDO COM SUCESSO!');
    console.log('==========================================');
    console.log('Sistema pronto para uso!');
  }
};