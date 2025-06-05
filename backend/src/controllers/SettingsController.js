const settingsService = require('../services/SettingsService');

class SettingsController {
  // AWS Settings
  async getAwsSettings(req, res) {
    try {
      const settings = await settingsService.getAwsSettings();
      if (!settings) {
        return res.status(404).json({ error: 'Configurações AWS não encontradas' });
      }
      res.json(settings);
    } catch (error) {
      console.error('Erro ao buscar configurações AWS:', error);
      res.status(500).json({ error: 'Erro ao buscar configurações AWS' });
    }
  }

  async saveAwsSettings(req, res) {
    try {
      const settings = await settingsService.saveAwsSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error('Erro ao salvar configurações AWS:', error);
      res.status(500).json({ error: 'Erro ao salvar configurações AWS' });
    }
  }

  async deleteAwsSettings(req, res) {
    try {
      await settingsService.deleteAwsSettings(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar configurações AWS:', error);
      res.status(500).json({ error: 'Erro ao deletar configurações AWS' });
    }
  }

  // Background Settings
  async getBackgroundSettings(req, res) {
    try {
      const settings = await settingsService.getBackgroundSettings();
      if (!settings) {
        return res.status(404).json({ error: 'Configurações de plano de fundo não encontradas' });
      }
      res.json(settings);
    } catch (error) {
      console.error('Erro ao buscar configurações de plano de fundo:', error);
      res.status(500).json({ error: 'Erro ao buscar configurações de plano de fundo' });
    }
  }

  async saveBackgroundSettings(req, res) {
    try {
      const settings = await settingsService.saveBackgroundSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error('Erro ao salvar configurações de plano de fundo:', error);
      res.status(500).json({ error: 'Erro ao salvar configurações de plano de fundo' });
    }
  }

  // General Settings
  async getGeneralSettings(req, res) {
    try {
      const settings = await settingsService.getGeneralSettings();
      if (!settings) {
        return res.status(404).json({ error: 'Configurações gerais não encontradas' });
      }
      res.json(settings);
    } catch (error) {
      console.error('Erro ao buscar configurações gerais:', error);
      res.status(500).json({ error: 'Erro ao buscar configurações gerais' });
    }
  }

  async saveGeneralSettings(req, res) {
    try {
      const settings = await settingsService.saveGeneralSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error('Erro ao salvar configurações gerais:', error);
      res.status(500).json({ error: 'Erro ao salvar configurações gerais' });
    }
  }

  // Security Settings
  async getSecuritySettings(req, res) {
    try {
      const settings = await settingsService.getSecuritySettings();
      if (!settings) {
        return res.status(404).json({ error: 'Configurações de segurança não encontradas' });
      }
      res.json(settings);
    } catch (error) {
      console.error('Erro ao buscar configurações de segurança:', error);
      res.status(500).json({ error: 'Erro ao buscar configurações de segurança' });
    }
  }

  async saveSecuritySettings(req, res) {
    try {
      const settings = await settingsService.saveSecuritySettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error('Erro ao salvar configurações de segurança:', error);
      res.status(500).json({ error: 'Erro ao salvar configurações de segurança' });
    }
  }

  // Email Settings
  async getEmailSettings(req, res) {
    try {
      const settings = await settingsService.getEmailSettings();
      if (!settings) {
        return res.status(404).json({ error: 'Configurações de email não encontradas' });
      }
      res.json(settings);
    } catch (error) {
      console.error('Erro ao buscar configurações de email:', error);
      res.status(500).json({ error: 'Erro ao buscar configurações de email' });
    }
  }

  async saveEmailSettings(req, res) {
    try {
      const settings = await settingsService.saveEmailSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error('Erro ao salvar configurações de email:', error);
      res.status(500).json({ error: 'Erro ao salvar configurações de email' });
    }
  }

  // Test connections
  async testS3Connection(req, res) {
    try {
      const result = await settingsService.testS3Connection(req.body);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Erro ao testar conexão S3:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao testar conexão S3',
        error: error.message 
      });
    }
  }

  async testEmailConnection(req, res) {
    try {
      const result = await settingsService.testEmailConnection(req.body);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Erro ao testar conexão de email:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao testar conexão de email',
        error: error.message 
      });
    }
  }

  // Get all settings
  async getAllSettings(req, res) {
    try {
      const settings = await settingsService.getAllSettings();
      res.json(settings);
    } catch (error) {
      console.error('Erro ao buscar todas as configurações:', error);
      res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
  }
}

module.exports = new SettingsController(); 