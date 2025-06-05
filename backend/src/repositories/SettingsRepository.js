const knex = require('../config/database');
const {
  AwsSettings,
  BackgroundSettings,
  GeneralSettings,
  SecuritySettings,
  EmailSettings
} = require('../entities/Settings');

class SettingsRepository {
  // AWS Settings
  async getAwsSettings() {
    const data = await knex('aws_settings').first();
    return data ? new AwsSettings(data) : null;
  }

  async createAwsSettings(settings) {
    const entity = new AwsSettings(settings);
    const [id] = await knex('aws_settings').insert(entity.toDatabase());
    return this.getAwsSettings();
  }

  async updateAwsSettings(id, settings) {
    const entity = new AwsSettings(settings);
    await knex('aws_settings').where({ id }).update(entity.toDatabase());
    return this.getAwsSettings();
  }

  async deleteAwsSettings(id) {
    return knex('aws_settings').where({ id }).delete();
  }

  // Background Settings
  async getBackgroundSettings() {
    const data = await knex('background_settings').first();
    return data ? new BackgroundSettings(data) : null;
  }

  async createBackgroundSettings(settings) {
    const entity = new BackgroundSettings(settings);
    const [id] = await knex('background_settings').insert(entity.toDatabase());
    return this.getBackgroundSettings();
  }

  async updateBackgroundSettings(id, settings) {
    const entity = new BackgroundSettings(settings);
    await knex('background_settings').where({ id }).update(entity.toDatabase());
    return this.getBackgroundSettings();
  }

  async deleteBackgroundSettings(id) {
    return knex('background_settings').where({ id }).delete();
  }

  // General Settings
  async getGeneralSettings() {
    const data = await knex('general_settings').first();
    return data ? new GeneralSettings(data) : null;
  }

  async createGeneralSettings(settings) {
    const entity = new GeneralSettings(settings);
    const [id] = await knex('general_settings').insert(entity.toDatabase());
    return this.getGeneralSettings();
  }

  async updateGeneralSettings(id, settings) {
    const entity = new GeneralSettings(settings);
    await knex('general_settings').where({ id }).update(entity.toDatabase());
    return this.getGeneralSettings();
  }

  async deleteGeneralSettings(id) {
    return knex('general_settings').where({ id }).delete();
  }

  // Security Settings
  async getSecuritySettings() {
    const data = await knex('security_settings').first();
    return data ? new SecuritySettings(data) : null;
  }

  async createSecuritySettings(settings) {
    const entity = new SecuritySettings(settings);
    const [id] = await knex('security_settings').insert(entity.toDatabase());
    return this.getSecuritySettings();
  }

  async updateSecuritySettings(id, settings) {
    const entity = new SecuritySettings(settings);
    await knex('security_settings').where({ id }).update(entity.toDatabase());
    return this.getSecuritySettings();
  }

  async deleteSecuritySettings(id) {
    return knex('security_settings').where({ id }).delete();
  }

  // Email Settings
  async getEmailSettings() {
    const data = await knex('email_settings').first();
    return data ? new EmailSettings(data) : null;
  }

  async createEmailSettings(settings) {
    const entity = new EmailSettings(settings);
    const [id] = await knex('email_settings').insert(entity.toDatabase());
    return this.getEmailSettings();
  }

  async updateEmailSettings(id, settings) {
    const entity = new EmailSettings(settings);
    await knex('email_settings').where({ id }).update(entity.toDatabase());
    return this.getEmailSettings();
  }

  async deleteEmailSettings(id) {
    return knex('email_settings').where({ id }).delete();
  }

  // Get all settings
  async getAllSettings() {
    const [aws, background, general, security, email] = await Promise.all([
      this.getAwsSettings(),
      this.getBackgroundSettings(),
      this.getGeneralSettings(),
      this.getSecuritySettings(),
      this.getEmailSettings()
    ]);

    return {
      aws,
      background,
      general,
      security,
      email
    };
  }
}

module.exports = new SettingsRepository(); 