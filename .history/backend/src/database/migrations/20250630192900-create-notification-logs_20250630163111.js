'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notification_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('email', 'sms', 'push'),
        allowNull: false,
        comment: 'Tipo de notificação: email, sms ou push'
      },
      recipient: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Email, telefone ou device token do destinatário'
      },
      subject: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Assunto da notificação (principalmente para emails)'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Conteúdo da mensagem enviada'
      },
      template_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nome do template utilizado'
      },
      verification_token: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Token de verificação quando aplicável'
      },
      user_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'ID do usuário relacionado'
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'delivered', 'failed', 'bounced'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Status do envio da notificação'
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Provedor utilizado (Gmail, Twilio, Firebase, etc.)'
      },
      provider_message_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID da mensagem retornado pelo provedor'
      },
      provider_response: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Resposta completa do provedor'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Mensagem de erro em caso de falha'
      },
      retry_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de tentativas de reenvio'
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data/hora agendada para envio'
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data/hora efetiva do envio'
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data/hora de entrega confirmada'
      },
      opened_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data/hora de abertura (para emails)'
      },
      clicked_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data/hora de clique em links (para emails)'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Dados adicionais específicos do contexto'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Índices para otimizar consultas
    await queryInterface.addIndex('notification_logs', ['type']);
    await queryInterface.addIndex('notification_logs', ['recipient']);
    await queryInterface.addIndex('notification_logs', ['status']);
    await queryInterface.addIndex('notification_logs', ['user_id']);
    await queryInterface.addIndex('notification_logs', ['verification_token']);
    await queryInterface.addIndex('notification_logs', ['created_at']);
    await queryInterface.addIndex('notification_logs', ['sent_at']);
    await queryInterface.addIndex('notification_logs', ['type', 'status']);
    await queryInterface.addIndex('notification_logs', ['recipient', 'type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notification_logs');
  }
};