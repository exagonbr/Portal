// Entidade para configurações AWS
class AwsSettings {
  constructor(data = {}) {
    this.id = data.id;
    this.accessKeyId = data.access_key_id || '';
    this.secretAccessKey = data.secret_access_key || '';
    this.region = data.region || 'us-east-1';
    this.s3BucketName = data.s3_bucket_name || '';
    this.cloudWatchNamespace = data.cloudwatch_namespace || 'Portal/Metrics';
    this.updateInterval = data.update_interval || 30;
    this.enableRealTimeUpdates = data.enable_real_time_updates !== false;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  toDatabase() {
    return {
      access_key_id: this.accessKeyId,
      secret_access_key: this.secretAccessKey,
      region: this.region,
      s3_bucket_name: this.s3BucketName,
      cloudwatch_namespace: this.cloudWatchNamespace,
      update_interval: this.updateInterval,
      enable_real_time_updates: this.enableRealTimeUpdates
    };
  }
}

// Entidade para configurações de plano de fundo
class BackgroundSettings {
  constructor(data = {}) {
    this.id = data.id;
    this.type = data.type || 'video';
    this.videoFile = data.video_file || '/back_video1.mp4';
    this.customUrl = data.custom_url || '';
    this.solidColor = data.solid_color || '#1e3a8a';
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  toDatabase() {
    return {
      type: this.type,
      video_file: this.videoFile,
      custom_url: this.customUrl,
      solid_color: this.solidColor
    };
  }
}

// Entidade para configurações gerais
class GeneralSettings {
  constructor(data = {}) {
    this.id = data.id;
    this.platformName = data.platform_name || 'Portal Educacional';
    this.systemUrl = data.system_url || 'https://portal.educacional.com';
    this.supportEmail = data.support_email || 'suporte@portal.educacional.com';
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  toDatabase() {
    return {
      platform_name: this.platformName,
      system_url: this.systemUrl,
      support_email: this.supportEmail
    };
  }
}

// Entidade para configurações de segurança
class SecuritySettings {
  constructor(data = {}) {
    this.id = data.id;
    this.minPasswordLength = data.min_password_length || 8;
    this.requireSpecialChars = data.require_special_chars !== false;
    this.requireNumbers = data.require_numbers !== false;
    this.twoFactorAuth = data.two_factor_auth || 'optional';
    this.sessionTimeout = data.session_timeout || 30;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  toDatabase() {
    return {
      min_password_length: this.minPasswordLength,
      require_special_chars: this.requireSpecialChars,
      require_numbers: this.requireNumbers,
      two_factor_auth: this.twoFactorAuth,
      session_timeout: this.sessionTimeout
    };
  }
}

// Entidade para configurações de email
class EmailSettings {
  constructor(data = {}) {
    this.id = data.id;
    this.smtpServer = data.smtp_server || '';
    this.smtpPort = data.smtp_port || 587;
    this.encryption = data.encryption || 'tls';
    this.senderEmail = data.sender_email || '';
    this.senderPassword = data.sender_password || '';
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  toDatabase() {
    return {
      smtp_server: this.smtpServer,
      smtp_port: this.smtpPort,
      encryption: this.encryption,
      sender_email: this.senderEmail,
      sender_password: this.senderPassword
    };
  }
}

module.exports = {
  AwsSettings,
  BackgroundSettings,
  GeneralSettings,
  SecuritySettings,
  EmailSettings
}; 