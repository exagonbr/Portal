'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  await knex.schema.createTable('notification_logs', function(table) {
    table.increments('id').primary();
    table.enum('type', ['email', 'sms', 'push']).notNullable().comment('Tipo de notificação: email, sms ou push');
    table.string('recipient', 255).notNullable().comment('Email, telefone ou device token do destinatário');
    table.string('subject', 500).nullable().comment('Assunto da notificação (principalmente para emails)');
    table.text('message').nullable().comment('Conteúdo da mensagem enviada');
    table.string('template_name', 100).nullable().comment('Nome do template utilizado');
    table.string('verification_token', 500).nullable().comment('Token de verificação quando aplicável');
    table.string('user_id', 50).nullable().comment('ID do usuário relacionado');
    table.enum('status', ['pending', 'sent', 'delivered', 'failed', 'bounced']).notNullable().defaultTo('pending').comment('Status do envio da notificação');
    table.string('provider', 50).nullable().comment('Provedor utilizado (Gmail, Twilio, Firebase, etc.)');
    table.string('provider_message_id', 255).nullable().comment('ID da mensagem retornado pelo provedor');
    table.jsonb('provider_response').nullable().comment('Resposta completa do provedor');
    table.text('error_message').nullable().comment('Mensagem de erro em caso de falha');
    table.integer('retry_count').notNullable().defaultTo(0).comment('Número de tentativas de reenvio');
    table.timestamp('scheduled_at').nullable().comment('Data/hora agendada para envio');
    table.timestamp('sent_at').nullable().comment('Data/hora efetiva do envio');
    table.timestamp('delivered_at').nullable().comment('Data/hora de entrega confirmada');
    table.timestamp('opened_at').nullable().comment('Data/hora de abertura (para emails)');
    table.timestamp('clicked_at').nullable().comment('Data/hora de clique em links (para emails)');
    table.jsonb('metadata').nullable().comment('Dados adicionais específicos do contexto');
    table.timestamps(true, true);
  });

  await knex.schema.table('notification_logs', function(table) {
    table.index('type');
    table.index('recipient');
    table.index('status');
    table.index('user_id');
    table.index('verification_token');
    table.index('created_at');
    table.index('sent_at');
    table.index(['type', 'status']);
    table.index(['recipient', 'type']);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('notification_logs');
};