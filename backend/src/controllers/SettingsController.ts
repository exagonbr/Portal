import { Request, Response } from 'express';
import { SettingsRepository } from '../repositories/SettingsRepository';

const settingsRepository = new SettingsRepository();

class SettingsController {
  public async getSetting(req: Request, res: Response): Promise<Response> {
    try {
      const { key } = req.params;
      const setting = await settingsRepository.findByKey(key);
      if (!setting) {
        return res.status(404).json({ success: false, message: 'Setting not found' });
      }
      return res.status(200).json({ success: true, data: setting });
    } catch (error) {
      console.error(`Error in getSetting: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async getAllSettings(req: Request, res: Response): Promise<Response> {
    try {
      const settings = await settingsRepository.findAll();
      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      console.error(`Error in getAllSettings: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async setSetting(req: Request, res: Response): Promise<Response> {
    try {
      const { key } = req.params;
      const { value } = req.body;
      if (value === undefined) {
        return res.status(400).json({ success: false, message: 'Value is required' });
      }
      const setting = await settingsRepository.setValue(key, value);
      return res.status(200).json({ success: true, data: setting, message: 'Setting updated successfully' });
    } catch (error) {
      console.error(`Error in setSetting: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new SettingsController();