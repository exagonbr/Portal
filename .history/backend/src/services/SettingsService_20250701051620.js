const settingsRepository = require('../repositories/SettingsRepository');
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

class SettingsService {
  // Criptografar dados sensíveis
  encrypt(text) {
    if (!text) return '';
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  // Descriptografar dados sensíveis
  decrypt(text) {
    if (!text || !text.includes(':')) return '';
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
      const textParts = text.split(':');
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.log('Erro ao descriptografar:', error);
      return '';
    }
  }

  // AWS Settings
  async getAwsSettings() {
    const settings = await settingsRepository.getAwsSettings();
    if (settings) {
      // Descriptografar dados sensíveis
      settings.accessKeyId = this.decrypt(settings.accessKeyId);
      settings.secretAccessKey = this.decrypt(settings.secretAccessKey);
    }
    return settings;
  }

  async saveAwsSettings(data) {
    // Criptografar dados sensíveis
    const encryptedData = {
      ...data,
      accessKeyId: this.encrypt(data.accessKeyId),
      secretAccessKey: this.encrypt(data.secretAccessKey)
    };

    const existing = await settingsRepository.getAwsSettings();
    if (existing) {
      return await settingsRepository.updateAwsSettings(existing.id, encryptedData);
    } else {
      return await settingsRepository.createAwsSettings(encryptedData);
    }
  }

  async deleteAwsSettings(id) {
    return await settingsRepository.deleteAwsSettings(id);
  }

  // Background Settings
  async getBackgroundSettings() {
    return await settingsRepository.getBackgroundSettings();
  }

  async saveBackgroundSettings(data) {
    const existing = await settingsRepository.getBackgroundSettings();
    if (existing) {
      return await settingsRepository.updateBackgroundSettings(existing.id, data);
    } else {
      return await settingsRepository.createBackgroundSettings(data);
    }
  }

  // General Settings
  async getGeneralSettings() {
    return await settingsRepository.getGeneralSettings();
  }

  async saveGeneralSettings(data) {
    const existing = await settingsRepository.getGeneralSettings();
    if (existing) {
      return await settingsRepository.updateGeneralSettings(existing.id, data);
    } else {
      return await settingsRepository.createGeneralSettings(data);
    }
  }

  // Security Settings
  async getSecuritySettings() {
    return await settingsRepository.getSecuritySettings();
  }

  async saveSecuritySettings(data) {
    const existing = await settingsRepository.getSecuritySettings();
    if (existing) {
      return await settingsRepository.updateSecuritySettings(existing.id, data);
    } else {
      return await settingsRepository.createSecuritySettings(data);
    }
  }

  // Email Settings
  async getEmailSettings() {
    const settings = await settingsRepository.getEmailSettings();
    if (settings) {
      // Descriptografar senha
      settings.senderPassword = this.decrypt(settings.senderPassword);
    }
    return settings;
  }

  async saveEmailSettings(data) {
    // Criptografar senha
    const encryptedData = {
      ...data,
      senderPassword: this.encrypt(data.senderPassword)
    };

    const existing = await settingsRepository.getEmailSettings();
    if (existing) {
      return await settingsRepository.updateEmailSettings(existing.id, encryptedData);
    } else {
      return await settingsRepository.createEmailSettings(encryptedData);
    }
  }

  // Testar conexão S3
  async testS3Connection(settings) {
    try {
      const s3 = new AWS.S3({
        accessKeyId: settings.accessKeyId,
        secretAccessKey: settings.secretAccessKey,
        region: settings.region
      });

      // Tentar listar buckets para verificar a conexão
      await s3.listBuckets().promise();
      
      // Se especificou um bucket, verificar se existe
      if (settings.s3BucketName) {
        await s3.headBucket({ Bucket: settings.s3BucketName }).promise();
      }

      return { success: true, message: 'Conexão S3 estabelecida com sucesso' };
    } catch (error) {
      console.log('Erro ao testar conexão S3:', error);
      return { 
        success: false, 
        message: error.message || 'Erro ao conectar com S3',
        error: error.code
      };
    }
  }

  // Testar conexão de email
  async testEmailConnection(settings) {
    try {
      // Criar transporter do nodemailer
      const transporter = nodemailer.createTransport({
        host: settings.smtpServer,
        port: settings.smtpPort,
        secure: settings.encryption === 'ssl',
        auth: {
          user: settings.senderEmail,
          pass: settings.senderPassword
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verificar conexão
      await transporter.verify();

      // Enviar email de teste
      await transporter.sendMail({
        from: settings.senderEmail,
        to: settings.senderEmail,
        subject: 'Teste de Conexão - Portal Educacional',
        text: 'Este é um email de teste para verificar a configuração SMTP.',
        html: '<p>Este é um email de teste para verificar a configuração SMTP.</p>'
      });

      return { success: true, message: 'Email de teste enviado com sucesso' };
    } catch (error) {
      console.log('Erro ao testar conexão de email:', error);
      return { 
        success: false, 
        message: error.message || 'Erro ao conectar com servidor de email',
        error: error.code
      };
    }
  }

  // Obter todas as configurações
  async getAllSettings() {
    const settings = await settingsRepository.getAllSettings();
    
    // Descriptografar dados sensíveis
    if (settings.aws) {
      settings.aws.accessKeyId = this.decrypt(settings.aws.accessKeyId);
      settings.aws.secretAccessKey = this.decrypt(settings.aws.secretAccessKey);
    }
    
    if (settings.email) {
      settings.email.senderPassword = this.decrypt(settings.email.senderPassword);
    }

    return settings;
  }
}

module.exports = new SettingsService(); 